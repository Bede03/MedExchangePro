import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    // Simulate sending reset link
    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
    }, 1000);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12">
      {/* Logo and Title */}
      <div className="mb-8 flex flex-col items-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500 text-2xl font-bold text-white">
          M
        </div>
        <h1 className="mt-4 text-3xl font-bold text-slate-900">MedExchange</h1>
        <p className="mt-2 text-sm text-slate-500">Hospital-to-Hospital Patient Data Exchange</p>
      </div>

      {/* Form Card */}
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-md">
        {!submitted ? (
          <>
            <h2 className="text-lg font-semibold text-slate-900">Reset Password</h2>
            <p className="mt-1 text-sm text-slate-600">Enter your email to receive a reset link</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div>
                <label className="text-sm font-medium text-slate-900" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@hospital.rw"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Sending…' : 'Send Reset Link'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700">
                Back to Sign In
              </Link>
            </p>
          </>
        ) : (
          <>
            <div className="text-center">
              <h2 className="text-lg font-semibold text-slate-900">Check your email</h2>
              <p className="mt-2 text-sm text-slate-600">
                We've sent a password reset link to <span className="font-medium">{email}</span>
              </p>
            </div>

            <div className="mt-8 rounded-lg bg-blue-50 p-4">
              <p className="text-sm text-slate-700">
                Click the link in your email to reset your password. If you don't see the email, check your spam folder.
              </p>
            </div>

            <p className="mt-6 text-center text-sm text-slate-600">
              <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700">
                Back to Sign In
              </Link>
            </p>
          </>
        )}
      </div>

      {/* Footer */}
    </div>
  );
}
