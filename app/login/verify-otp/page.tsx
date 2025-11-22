'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface RegistrationData {
  name: string;
  email: string;
  phone: string;
  password: string;
  timestamp: number;
}

export default function VerifyOTPPage() {
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null);
  const [contactInfo, setContactInfo] = useState({ email: '', phone: '' });
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Check if registration data exists
    const storedData = sessionStorage.getItem('pendingRegistration');
    if (!storedData) {
      // No registration data found, redirect back to login
      router.push('/login');
      return;
    }

    try {
      const data: RegistrationData = JSON.parse(storedData);
      
      // Check if data is not expired (30 minutes)
      const currentTime = new Date().getTime();
      const dataAge = currentTime - data.timestamp;
      const thirtyMinutes = 30 * 60 * 1000;
      
      if (dataAge > thirtyMinutes) {
        // Data expired, clear and redirect
        sessionStorage.removeItem('pendingRegistration');
        router.push('/login');
        return;
      }
      
      setRegistrationData(data);
      setContactInfo({ email: data.email, phone: data.phone });
    } catch (error) {
      console.error('Error parsing registration data:', error);
      sessionStorage.removeItem('pendingRegistration');
      router.push('/login');
      return;
    }

    // Focus first input
    inputRefs.current[0]?.focus();

    // Timer countdown
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer, router]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    const newOtp = pastedData.split('');
    
    if (newOtp.length === 6) {
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');
    
    if (otpCode.length === 6 && registrationData) {
      // Handle OTP verification with registration data
      console.log('OTP submitted:', otpCode);
      console.log('Registration data:', {
        name: registrationData.name,
        email: registrationData.email,
        phone: registrationData.phone
        // Password is available but not logged for security
      });
      
      // TODO: Send to backend API for verification and registration
      // After successful verification, clear the session storage
      sessionStorage.removeItem('pendingRegistration');
      
      // Redirect to home or dashboard after successful verification
      router.push('/');
    }
  };

  const handleResend = () => {
    if (!registrationData) return;
    
    setTimer(60);
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
    
    // Handle resend OTP logic with registration data
    console.log('Resend OTP to:', {
      email: registrationData.email,
      phone: registrationData.phone
    });
    
    // TODO: Send to backend API to resend OTP
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-900 flex items-center justify-center py-24 px-6">
      <div className="max-w-md w-full">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            CV. BOCAH MANTUL MABUR
          </h1>
          <p className="text-gray-400">Verifikasi OTP</p>
        </div>

        {/* OTP Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifikasi Akun Anda</h2>
            <p className="text-gray-600">
              Kami telah mengirimkan kode verifikasi 6 digit ke:
            </p>
            {contactInfo.email && contactInfo.phone && (
              <div className="mt-3 space-y-1">
                <p className="text-sm text-gray-700 font-medium">
                  Email: {contactInfo.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')}
                </p>
                <p className="text-sm text-gray-700 font-medium">
                  Telepon: {contactInfo.phone.replace(/(\d{4})(\d+)(\d{4})/, '$1****$3')}
                </p>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                Masukkan Kode OTP
              </label>
              <div className="flex justify-center gap-2" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-red-600 focus:ring-2 focus:ring-red-600 focus:outline-none transition"
                  />
                ))}
              </div>
            </div>

            {/* Timer */}
            <div className="text-center">
              {timer > 0 ? (
                <p className="text-gray-600">
                  Kirim ulang kode dalam <span className="font-semibold text-red-600">{timer}s</span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-red-600 hover:text-red-700 font-semibold"
                >
                  Kirim Ulang Kode OTP
                </button>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={otp.some((digit) => !digit)}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors duration-300 transform hover:scale-105 disabled:transform-none"
            >
              Verifikasi
            </button>
          </form>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Tidak menerima kode?{' '}
              <a href="#" className="text-red-600 hover:text-red-700 font-semibold">
                Hubungi Dukungan
              </a>
            </p>
          </div>
        </div>

        {/* Back to Login */}
        <div className="text-center mt-6">
          <Link href="/login" className="text-gray-400 hover:text-white transition">
            ← Kembali ke Halaman Masuk
          </Link>
        </div>
      </div>
    </div>
  );
}
