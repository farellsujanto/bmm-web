'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ensureDeviceId, getAuthHeaders } from '@/src/utils/auth';
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
      await ensureDeviceId();
      const headers = await getAuthHeaders();

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

  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOTPPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    const newOtp = pastedData.split('');
    
    if (newOtp.length === 6) {
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
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
      await ensureDeviceId();
      const headers = await getAuthHeaders();

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
      }

      // Redirect to home or dashboard
      router.push('/');
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
      await ensureDeviceId();
      const headers = await getAuthHeaders();

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
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Selamat Datang</h2>
              <p className="text-gray-600">
                Masukkan nomor telepon Anda untuk melanjutkan
              </p>
            </div>

            {/* Error Message */}
            {error && !showOTP && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Telepon
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-red-600 focus:ring-2 focus:ring-red-600 focus:outline-none transition"
                  placeholder="08123456789 atau +628123456789"
                  required
                  disabled={loading}
                />
                <p className="mt-2 text-xs text-gray-500">
                  Kami akan mengirimkan kode verifikasi via WhatsApp
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !phoneNumber}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors duration-300 transform hover:scale-105 disabled:transform-none"
              >
                {loading ? 'Mengirim...' : 'Lanjutkan'}
              </button>
            </form>
          </div>

          {/* OTP Verification Form */}
          <div
            className={`transition-all duration-500 ease-in-out ${
              showOTP
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 translate-x-full absolute inset-0 p-8 pointer-events-none'
            }`}
          >
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifikasi Nomor Anda</h2>
              <p className="text-gray-600">
                Kami telah mengirimkan kode verifikasi 6 digit ke:
              </p>
              {maskedPhone && (
                <p className="mt-2 text-sm text-gray-700 font-medium">
                  {maskedPhone}
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && showOTP && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleOTPSubmit} className="space-y-6">
              {/* OTP Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                  Masukkan Kode OTP
                </label>
                <div className="flex justify-center gap-2" onPaste={handleOTPPaste}>
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
                      onChange={(e) => handleOTPChange(index, e.target.value)}
                      onKeyDown={(e) => handleOTPKeyDown(index, e)}
                      disabled={loading}
                      className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-red-600 focus:ring-2 focus:ring-red-600 focus:outline-none transition disabled:bg-gray-100"
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
                    onClick={handleResendOTP}
                    disabled={loading}
                    className="text-red-600 hover:text-red-700 font-semibold disabled:text-gray-400"
                  >
                    Kirim Ulang Kode OTP
                  </button>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={otp.some((digit) => !digit) || loading}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors duration-300 transform hover:scale-105 disabled:transform-none"
              >
                {loading ? 'Memverifikasi...' : 'Verifikasi'}
              </button>

              {/* Back Button */}
              <button
                type="button"
                onClick={handleBackToForm}
                disabled={loading}
                className="w-full text-gray-600 hover:text-gray-900 py-2 font-medium transition-colors disabled:text-gray-400"
              >
                ← Kembali
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
