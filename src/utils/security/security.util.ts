import { randomUUID } from 'crypto';
import SHA256 from 'crypto-js/sha256';
import Base64 from 'crypto-js/enc-base64';
import Utf8 from 'crypto-js/enc-utf8';
import jwt from 'jsonwebtoken';
import * as forge from 'node-forge';
import { JwtData } from './models/jwt.model';

export function decodeBase64(text: string) {
    const encodedWord = Base64.parse(text);
    const decoded = Utf8.stringify(encodedWord);

    return decoded;
}

export function createJwt(data: JwtData, expiresIn: string = '7d'): string {
    if (!process.env.JWT_KEY) {
        throw new Error('JWT_KEY is not set in environment variables');
    }
    const privateKey = decodeBase64(process.env.JWT_KEY);
    const payload = {
        id: data.id,
        role: data.role
    };
    return jwt.sign(payload, privateKey, { expiresIn } as jwt.SignOptions);
}

export function verifyJwt(token: string): JwtData | null {
    if (!process.env.JWT_KEY) {
        throw new Error('JWT_KEY is not set in environment variables');
    }
    const privateKey = decodeBase64(process.env.JWT_KEY);
    try {
        return jwt.verify(token, privateKey) as JwtData;
    } catch (err: any) {
        if (err.name === 'TokenExpiredError') {
            return null;
        }
        throw err;
    }
}

export function decodeJwt(token: string): JwtData {
    return jwt.decode(token) as JwtData;
}

export function createSalt(): string {
    return SHA256(Math.random().toString() + randomUUID()).toString();
}

export function saltPassword(password: string, salt: string): string {
    if (!process.env.EXTRA_SALT || !salt || !password) {
        throw 'Missing data for hashing';
    }
    return SHA256(password + salt + process.env.EXTRA_SALT).toString();
}

export function verifyPassword(password: string, hashedPassword: string, salt: string): boolean {
    return saltPassword(password, salt) === hashedPassword;
}

export function generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
}

export function createFullJwt(userData: { id: number, role: string }): string {
    const jwtData: JwtData = {
        id: userData.id,
        role: userData.role
    };
    
    return createJwt(jwtData);
}

// Create short-lived access token (15 minutes)
export function createAccessToken(userData: { id: number, role: string }): string {
    const jwtData: JwtData = {
        id: userData.id,
        role: userData.role
    };
    
    return createJwt(jwtData, '15m');
}

// Create long-lived refresh token (7 days)
export function createRefreshToken(userData: { id: number, role: string }): string {
    const jwtData: JwtData = {
        id: userData.id,
        role: userData.role
    };
    
    return createJwt(jwtData, '7d');
}

export function isOtpExpired(validUntil: Date): boolean {
    return new Date() > validUntil;
}

export function createOtpExpiry(minutes: number = 5): Date {
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + minutes);
    return expiry;
}

export function validateApiKey(apiKey: string): boolean {
    return apiKey === process.env.API_KEY;
}

export function validateRequiredHeaders(apiKey: string | null): { isValid: boolean, error?: string } {
    if (!apiKey) {
        return { isValid: false, error: 'API key is required' };
    }
    
    if (!validateApiKey(apiKey)) {
        return { isValid: false, error: 'Invalid API key' };
    }
    
    return { isValid: true };
}

// RSA Encryption utilities for PIN transport
export interface RSAEncryptedData {
    encryptedData: string;
    iv: string;
    key: string; // AES key encrypted with RSA
}

export function generateRSAKeyPair(): { publicKey: string, privateKey: string } {
    const keypair = forge.pki.rsa.generateKeyPair(2048);
    const publicKeyPem = forge.pki.publicKeyToPem(keypair.publicKey);
    const privateKeyPem = forge.pki.privateKeyToPem(keypair.privateKey);
    
    return {
        publicKey: publicKeyPem,
        privateKey: privateKeyPem
    };
}

export function encryptPinWithRSA(pin: string, publicKeyPem: string): RSAEncryptedData {
    try {
        // Parse the public key
        const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
        
        // Generate random AES key and IV
        const aesKey = forge.random.getBytesSync(32); // 256-bit key
        const iv = forge.random.getBytesSync(16); // 128-bit IV
        
        // Encrypt PIN with AES
        const cipher = forge.cipher.createCipher('AES-CBC', aesKey);
        cipher.start({ iv: iv });
        cipher.update(forge.util.createBuffer(pin));
        cipher.finish();
        
        const encryptedPin = cipher.output.getBytes();
        
        // Encrypt AES key with RSA
        const encryptedAESKey = publicKey.encrypt(aesKey, 'RSA-OAEP', {
            md: forge.md.sha256.create(),
            mgf1: forge.mgf.mgf1.create(forge.md.sha256.create())
        });
        
        return {
            encryptedData: forge.util.encode64(encryptedPin),
            iv: forge.util.encode64(iv),
            key: forge.util.encode64(encryptedAESKey)
        };
    } catch (error) {
        throw new Error(`RSA encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export function decryptPinWithRSA(encryptedData: RSAEncryptedData, privateKeyPem: string): string {
    try {
        // Parse the private key
        const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
        
        // Decrypt AES key with RSA
        const encryptedAESKey = forge.util.decode64(encryptedData.key);
        const aesKey = privateKey.decrypt(encryptedAESKey, 'RSA-OAEP', {
            md: forge.md.sha256.create(),
            mgf1: forge.mgf.mgf1.create(forge.md.sha256.create())
        });
        
        // Decrypt PIN with AES
        const encryptedPin = forge.util.decode64(encryptedData.encryptedData);
        const iv = forge.util.decode64(encryptedData.iv);
        
        const decipher = forge.cipher.createDecipher('AES-CBC', aesKey);
        decipher.start({ iv: iv });
        decipher.update(forge.util.createBuffer(encryptedPin));
        decipher.finish();
        
        return decipher.output.toString();
    } catch (error) {
        throw new Error(`RSA decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export function getRSAPublicKey(): string {
    if (!process.env.RSA_PUBLIC_KEY) {
        throw new Error('RSA_PUBLIC_KEY is not set in environment variables');
    }
    return decodeBase64(process.env.RSA_PUBLIC_KEY);
}

export function getRSAPrivateKey(): string {
    if (!process.env.RSA_PRIVATE_KEY) {
        throw new Error('RSA_PRIVATE_KEY is not set in environment variables');
    }
    return decodeBase64(process.env.RSA_PRIVATE_KEY);
}
