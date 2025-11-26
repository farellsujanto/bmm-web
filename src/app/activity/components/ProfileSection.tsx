'use client';

import { useState } from 'react';

interface ProfileSectionProps {
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  memberSince?: string;
}

export default function ProfileSection({ 
  userName = 'Pengguna',
  userEmail = 'user@example.com',
  userPhone = '+62 812-3456-7890',
  memberSince = 'November 2025'
}: ProfileSectionProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="bg-gradient-to-br from-gray-900 via-black to-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-800 hover:border-red-600 transition-all duration-500">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white mb-1">{userName}</h2>
            <p className="text-gray-400 text-sm">Premium Member</p>
          </div>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-gray-400 hover:text-white transition-colors p-2"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-3 text-gray-300">
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span>{userEmail}</span>
        </div>
        
        <div className="flex items-center space-x-3 text-gray-300">
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <span>{userPhone}</span>
        </div>
        
        <div className="flex items-center space-x-3 text-gray-300">
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>Member sejak {memberSince}</span>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-800">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-white">24</p>
            <p className="text-xs text-gray-400 mt-1">Pesanan</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">8</p>
            <p className="text-xs text-gray-400 mt-1">Review</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-white">2.4k</p>
            <p className="text-xs text-gray-400 mt-1">Poin</p>
          </div>
        </div>
      </div>
    </div>
  );
}
