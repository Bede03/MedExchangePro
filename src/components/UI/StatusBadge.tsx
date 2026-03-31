import React from 'react';
import { ReferralStatus } from '../../types';

interface StatusBadgeProps {
  status: ReferralStatus;
}

const statusMap: Record<ReferralStatus, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-amber-100 text-amber-800' },
  approved: { label: 'Approved', className: 'bg-emerald-100 text-emerald-800' },
  completed: { label: 'Completed', className: 'bg-sky-100 text-sky-800' },
  rejected: { label: 'Rejected', className: 'bg-rose-100 text-rose-800' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const info = statusMap[status];
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${info.className}`}>
      {info.label}
    </span>
  );
}
