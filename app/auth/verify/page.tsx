'use client';

import Link from 'next/link';

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <div className="bg-brand-surface rounded-2xl shadow-sm p-8">
          <div className="text-6xl mb-4">📬</div>
          <h1 className="font-fredoka text-2xl font-semibold text-brand-blue mb-2">
            Check your inbox!
          </h1>
          <p className="text-brand-textSecondary text-sm mb-6">
            We sent you a verification email. Click the link to activate your account and get your 60 starter coins 🪙
          </p>
          <Link
            href="/auth/signin"
            className="inline-block bg-brand-blue text-white rounded-xl px-6 py-3 font-semibold text-sm hover:bg-blue-700 transition"
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
