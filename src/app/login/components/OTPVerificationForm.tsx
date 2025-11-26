'use client';

import React from 'react';

interface OTPVerificationFormProps {
  otp: string[];
  setOtp: (otp: string[]) => void;
  inputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
  maskedPhone: string;
  timer: number;
  error: string;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onResendOTP: () => void;
  onBackToForm: () => void;
}

export default function OTPVerificationForm({
  otp,
  setOtp,
  inputRefs,
  maskedPhone,
  timer,
  error,
  loading,
  onSubmit,
  onResendOTP,
  onBackToForm
}: OTPVerificationFormProps) {
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

  return (
    <>
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifikasi Nomor Anda</h2>
        <p className="text-gray-600">
          Kami telah mengirimkan kode verifikasi 6 digit ke:
        </p>
        {maskedPhone && (
          <p className="text-gray-900 font-semibold mt-2">{maskedPhone}</p>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm text-center">{error}</p>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        {/* OTP Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
            Masukkan Kode OTP
          </label>
          <div className="flex justify-center gap-2">
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
                onPaste={handleOTPPaste}
                className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-red-600 focus:ring-2 focus:ring-red-600 focus:outline-none transition text-gray-900"
                disabled={loading}
              />
            ))}
          </div>
        </div>

        {/* Timer and Resend */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            {timer > 0 ? (
              <>Kirim ulang kode dalam <span className="font-semibold text-red-600">{timer} detik</span></>
            ) : (
              <button
                type="button"
                onClick={onResendOTP}
                className="text-red-600 font-semibold hover:text-red-700 transition"
              >
                Kirim Ulang Kode OTP
              </button>
            )}
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || otp.join('').length !== 6}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors duration-300 transform hover:scale-105 disabled:transform-none"
        >
          {loading ? 'Memverifikasi...' : 'Verifikasi'}
        </button>
      </form>

      {/* Back Button */}
      <div className="mt-6 text-center">
        <button
          onClick={onBackToForm}
          className="text-gray-600 hover:text-gray-900 transition font-medium"
        >
          ← Ubah Nomor Telepon
        </button>
      </div>
    </>
  );
}
