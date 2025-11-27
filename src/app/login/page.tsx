'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PhoneNumberForm from './components/PhoneNumberForm';
import OTPVerificationForm from './components/OTPVerificationForm';
import { getAuthHeaders, isAuthenticated } from './utils/authHelpers';
import { maskPhoneNumber } from '@/src/utils/formatter/stringFormatter.util';

export default function LoginPage() {
  const router = useRouter();
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [maskedPhone, setMaskedPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/activity');
    }
  }, [router]);

  useEffect(() => {
    // Timer countdown for OTP
    if (showOTP && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer, showOTP]);

  useEffect(() => {
    // Focus first OTP input when OTP screen is shown
    if (showOTP) {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 300);
    }
  }, [showOTP]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const headers = getAuthHeaders();

      const response = await fetch('/api/v1/auth/request-otp', {
        method: 'POST',
        headers,
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP');
      }

      // Store masked phone for display
      if (data.data?.maskedPhone) {
        setMaskedPhone(data.data.maskedPhone);
      } else {
        // Fallback to local masking
        try {
          setMaskedPhone(maskPhoneNumber(phoneNumber));
        } catch {
          setMaskedPhone(phoneNumber);
        }
      }

      // Show OTP screen and start timer
      setShowOTP(true);
      setTimer(60);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      setError('Masukkan kode OTP lengkap');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const headers = getAuthHeaders();

      const response = await fetch('/api/v1/auth/signin', {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          phoneNumber,
          otp: otpCode 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Verifikasi OTP gagal');
      }

      // Store auth token
      if (data.data?.token) {
        localStorage.setItem('authToken', data.data.token);
        // Trigger storage event for navbar to update
        window.dispatchEvent(new Event('storage'));
      }

      // Redirect to activity
      router.push('/activity');
    } catch (err: any) {
      setError(err.message || 'Verifikasi gagal. Silakan coba lagi.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setTimer(60);
    setOtp(['', '', '', '', '', '']);
    setError('');
    inputRefs.current[0]?.focus();
    
    try {
      const headers = getAuthHeaders();

      const response = await fetch('/api/v1/auth/request-otp', {
        method: 'POST',
        headers,
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend OTP');
      }
    } catch (err: any) {
      setError(err.message || 'Gagal mengirim ulang OTP');
    }
  };

  const handleBackToForm = () => {
    setShowOTP(false);
    setOtp(['', '', '', '', '', '']);
    setTimer(60);
    setError('');
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-black to-red-900 flex items-center justify-center py-24 px-6">
      <div className="max-w-md w-full">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            CV. BOCAH MANTUL MABUR
          </h1>
          <p className="text-gray-400">
            {showOTP ? 'Verifikasi OTP' : 'Masuk atau Daftar'}
          </p>
        </div>

        {/* Form Card with Animation */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 relative overflow-hidden">
          {/* Phone Number Form */}
          <div
            className={`transition-all duration-500 ease-in-out ${
              showOTP
                ? 'opacity-0 -translate-x-full absolute inset-0 p-8 pointer-events-none'
                : 'opacity-100 translate-x-0'
            }`}
          >
            <PhoneNumberForm
              phoneNumber={phoneNumber}
              setPhoneNumber={setPhoneNumber}
              onSubmit={handleSubmit}
              loading={loading}
              error={!showOTP ? error : ''}
            />
          </div>

          {/* OTP Verification Form */}
          <div
            className={`transition-all duration-500 ease-in-out ${
              showOTP
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 translate-x-full absolute inset-0 p-8 pointer-events-none'
            }`}
          >
            <OTPVerificationForm
              otp={otp}
              setOtp={setOtp}
              inputRefs={inputRefs}
              maskedPhone={maskedPhone}
              timer={timer}
              error={showOTP ? error : ''}
              loading={loading}
              onSubmit={handleOTPSubmit}
              onResendOTP={handleResendOTP}
              onBackToForm={handleBackToForm}
            />
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link href="/" className="text-gray-400 hover:text-white transition">
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
