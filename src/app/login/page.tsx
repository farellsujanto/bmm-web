'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PhoneNumberForm from './components/PhoneNumberForm';
import OTPVerificationForm from './components/OTPVerificationForm';
import { getAuthHeaders } from './utils/authHelpers';
import { maskPhoneNumber } from '@/src/utils/formatter/stringFormatter.util';
import { useAuth } from '@/src/contexts/AuthContext';
import { apiRequest } from '@/src/utils/api/apiRequest';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, user, isLoading: authLoading } = useAuth();
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [maskedPhone, setMaskedPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCount, setResendCount] = useState(0);
  const [maxResends, setMaxResends] = useState(2);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      // Redirect based on user role
      if (user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/activity');
      }
    }
  }, [isAuthenticated, authLoading, user, router]);

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
        credentials: 'include',
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

      // Store resend tracking
      if (data.data?.resendCount !== undefined) {
        setResendCount(data.data.resendCount);
      }
      if (data.data?.maxResends !== undefined) {
        setMaxResends(data.data.maxResends);
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

      // Get referral code from localStorage
      const referralCode = localStorage.getItem('referralCode');

      const response = await fetch('/api/v1/auth/signin', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ 
          phoneNumber,
          otp: otpCode,
          referralCode: referralCode || undefined
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Verifikasi OTP gagal');
      }

      // Remove referral code from localStorage after successful registration
      if (referralCode) {
        localStorage.removeItem('referralCode');
      }

      // Store access token in memory and context
      if (data.data?.accessToken && data.data?.user) {
        // Set token in apiRequest utility
        apiRequest.setToken(data.data.accessToken);
        // Update auth context
        login(data.data.accessToken, data.data.user);
        // Redirect based on user role
        if (data.data.user.role === 'ADMIN') {
          router.push('/admin');
        } else {
          router.push('/activity');
        }
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err: any) {
      setError(err.message || 'Verifikasi gagal. Silakan coba lagi.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCount >= maxResends) {
      setError('Batas pengiriman ulang OTP telah tercapai');
      return;
    }

    setTimer(60);
    setOtp(['', '', '', '', '', '']);
    setError('');
    inputRefs.current[0]?.focus();
    
    try {
      const headers = getAuthHeaders();

      const response = await fetch('/api/v1/auth/request-otp', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend OTP');
      }

      // Update resend count
      if (data.data?.resendCount !== undefined) {
        setResendCount(data.data.resendCount);
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
    setResendCount(0);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-black to-red-900 flex items-center justify-center py-24 px-6">
      <div className="max-w-md w-full">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            BMM PARTS
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
              resendCount={resendCount}
              maxResends={maxResends}
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
