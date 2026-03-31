import React from 'react';
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <h1 className="text-6xl font-bold text-slate-900">404</h1>
        <p className="mt-4 text-lg font-semibold text-slate-700">Page not found</p>
        <p className="mt-2 text-sm text-slate-500">We couldn't find the page you're looking for.</p>
        <Link
          to="/dashboard"
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
