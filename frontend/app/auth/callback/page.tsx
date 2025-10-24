'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      // Store the JWT token in NextAuth session
      // We'll use a custom credentials flow to set up the session
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((user) => {
          // Store token and user info in localStorage for now
          localStorage.setItem('authToken', token);
          localStorage.setItem('user', JSON.stringify(user));

          // Redirect to dashboard
          router.push('/');
        })
        .catch((error) => {
          console.error('Failed to fetch user:', error);
          router.push('/auth/signin?error=callback_failed');
        });
    } else {
      router.push('/auth/signin?error=no_token');
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}
