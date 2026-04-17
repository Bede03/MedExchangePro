import React from 'react';
import { Heart } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="-mx-6 border-t border-slate-800 bg-slate-900 px-10 py-10 text-white mt-12 -mb-6">
      <div className="mx-auto w-full max-w-6xl">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 mb-6">
          <div>
            <h3 className="text-sm font-semibold text-white">MedExchange</h3>
            <p className="mt-2 text-xs text-slate-400">
              Healthcare referral management system designed to streamline patient care coordination.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Quick Links</h4>
            <ul className="mt-2 space-y-2 text-xs text-slate-400">
              <li><a href="/dashboard" className="hover:text-white transition">Dashboard</a></li>
              <li><a href="/referrals" className="hover:text-white transition">Referrals</a></li>
              <li><a href="/patients" className="hover:text-white transition">Patients</a></li>
              <li><a href="/reports" className="hover:text-white transition">Reports</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Support</h4>
            <ul className="mt-2 space-y-2 text-xs text-slate-400">
              <li><a href="#" className="hover:text-white transition">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition">Contact Us</a></li>
              <li><a href="#" className="hover:text-white transition">Documentation</a></li>
              <li><a href="#" className="hover:text-white transition">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Legal</h4>
            <ul className="mt-2 space-y-2 text-xs text-slate-400">
              <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition">Security</a></li>
              <li><a href="#" className="hover:text-white transition">Compliance</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            
          <div className="flex items-center gap-2 text-xs text-slate-400">
          </div>
          <p className="text-xs text-slate-400">
            © {currentYear} MedExchangePro. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
