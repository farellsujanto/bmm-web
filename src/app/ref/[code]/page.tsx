'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function ReferralPage() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    const referralCode = params.code as string;
    
    if (referralCode) {
      // Save referral code to localStorage
      localStorage.setItem('referralCode', referralCode);
      
      // Redirect to shop page
      router.push('/shop');
    }
  }, [params.code, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to shop...</p>
      </div>
    </div>
  );
}
