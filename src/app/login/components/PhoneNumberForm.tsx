'use client';

import React from 'react';
import { PrimaryButton } from '@/src/components/ui';

interface PhoneNumberFormProps {
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  error: string;
}

export default function PhoneNumberForm({
  phoneNumber,
  setPhoneNumber,
  onSubmit,
  loading,
  error
}: PhoneNumberFormProps) {
  return (
    <>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Selamat Datang</h2>
        <p className="text-gray-800">
          Masukkan nomor telepon Anda untuk melanjutkan
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm text-center">{error}</p>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-900 mb-2">
            Nomor Telepon
          </label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-red-600 focus:ring-2 focus:ring-red-600 focus:outline-none transition text-gray-900 placeholder:text-gray-600"
            placeholder="08123456789 atau +628123456789"
            required
            disabled={loading}
          />
          <p className="text-xs text-gray-700 mt-2">
            Anda akan menerima kode OTP via WhatsApp
          </p>
        </div>

        <PrimaryButton
          type="submit"
          disabled={loading || !phoneNumber}
          className="w-full"
        >
          {loading ? 'Mengirim...' : 'Kirim Kode OTP'}
        </PrimaryButton>
      </form>
    </>
  );
}
