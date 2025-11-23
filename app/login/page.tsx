'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [contactInfo, setContactInfo] = useState({ email: '', phone: '' });
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [formData, setFormData] = useState({
    emailOrPhone: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    name: '',
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLogin) {
      // For registration, show OTP verification
      setContactInfo({ email: formData.email, phone: formData.phone });
      setShowOTP(true);
      setTimer(60);
      console.log('Registration submitted, showing OTP verification');
    } else {
      // For login, show OTP verification
      setContactInfo({ 
        email: formData.emailOrPhone.includes('@') ? formData.emailOrPhone : '',
        phone: !formData.emailOrPhone.includes('@') ? formData.emailOrPhone : ''
      });
      setShowOTP(true);
      setTimer(60);
      console.log('Login submitted, showing OTP verification');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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

  const handleOTPSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');
    
    if (otpCode.length === 6) {
      console.log('OTP submitted:', otpCode);
      console.log('User data:', {
        isLogin,
        ...(isLogin ? { emailOrPhone: formData.emailOrPhone } : {
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        })
      });
      
      // TODO: Send to backend API for verification
      // After successful verification, redirect to home or dashboard
      router.push('/');
    }
  };

  const handleResendOTP = () => {
    setTimer(60);
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
    
    console.log('Resend OTP to:', contactInfo);
    // TODO: Send to backend API to resend OTP
  };

  const handleBackToForm = () => {
    setShowOTP(false);
    setOtp(['', '', '', '', '', '']);
    setTimer(60);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-red-900 flex items-center justify-center py-24 px-6">
      <div className="max-w-md w-full">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            CV. BOCAH MANTUL MABUR
          </h1>
          <p className="text-gray-400">
            {showOTP ? 'Verifikasi OTP' : 'Portal Keunggulan Teknik'}
          </p>
        </div>

        {/* Form Card with Animation */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 relative overflow-hidden">
          {/* Login/Register Form */}
          <div
            className={`transition-all duration-500 ease-in-out ${
              showOTP
                ? 'opacity-0 -translate-x-full absolute inset-0 p-8 pointer-events-none'
                : 'opacity-100 translate-x-0'
            }`}
          >
            {/* Toggle Buttons */}
            <div className="flex mb-8 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 rounded-md font-semibold transition-all ${
                  isLogin ? 'bg-red-600 text-white' : 'text-gray-600'
                }`}
              >
                Masuk
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 rounded-md font-semibold transition-all ${
                  !isLogin ? 'bg-red-600 text-white' : 'text-gray-600'
                }`}
              >
                Daftar
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-red-600 focus:ring-2 focus:ring-red-600 focus:outline-none transition"
                    placeholder="Nama Lengkap Anda"
                    required={!isLogin}
                  />
                </div>
              )}

              {isLogin ? (
                <div>
                  <label htmlFor="emailOrPhone" className="block text-sm font-medium text-gray-700 mb-2">
                    Email atau Nomor Telepon
                  </label>
                  <input
                    type="text"
                    id="emailOrPhone"
                    name="emailOrPhone"
                    value={formData.emailOrPhone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-red-600 focus:ring-2 focus:ring-red-600 focus:outline-none transition"
                    placeholder="email@example.com atau 08123456789"
                    required
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Alamat Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-red-600 focus:ring-2 focus:ring-red-600 focus:outline-none transition"
                      placeholder="email@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Nomor Telepon
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-red-600 focus:ring-2 focus:ring-red-600 focus:outline-none transition"
                      placeholder="08123456789"
                      required
                    />
                  </div>
                </>
              )}

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Kata Sandi
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-red-600 focus:ring-2 focus:ring-red-600 focus:outline-none transition"
                  placeholder="••••••••"
                  required
                />
              </div>

              {!isLogin && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Konfirmasi Kata Sandi
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-red-600 focus:ring-2 focus:ring-red-600 focus:outline-none transition"
                    placeholder="••••••••"
                    required={!isLogin}
                  />
                </div>
              )}

              {isLogin && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm text-gray-600">Ingat saya</span>
                  </label>
                  <a href="#" className="text-sm text-red-600 hover:text-red-700">
                    Lupa kata sandi?
                  </a>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-colors duration-300 transform hover:scale-105"
              >
                {isLogin ? 'Masuk' : 'Buat Akun'}
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifikasi Akun Anda</h2>
              <p className="text-gray-600">
                Kami telah mengirimkan kode verifikasi 6 digit ke:
              </p>
              {(contactInfo.email || contactInfo.phone) && (
                <div className="mt-3 space-y-1">
                  {contactInfo.email && (
                    <p className="text-sm text-gray-700 font-medium">
                      Email: {contactInfo.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')}
                    </p>
                  )}
                  {contactInfo.phone && (
                    <p className="text-sm text-gray-700 font-medium">
                      Telepon: {contactInfo.phone.replace(/(\d{4})(\d+)(\d{4})/, '$1****$3')}
                    </p>
                  )}
                </div>
              )}
            </div>

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
                    onClick={handleResendOTP}
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

              {/* Back Button */}
              <button
                type="button"
                onClick={handleBackToForm}
                className="w-full text-gray-600 hover:text-gray-900 py-2 font-medium transition-colors"
              >
                ← Kembali ke Form
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
