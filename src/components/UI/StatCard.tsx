import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'indigo';
}

const colorMap: Record<NonNullable<StatCardProps['color']>, { icon: string; background: string; border: string }> = {
  blue: {
    icon: 'bg-blue-50 text-blue-700',
    background: 'bg-blue-50',
    border: 'border-blue-200',
  },
  green: {
    icon: 'bg-emerald-50 text-emerald-700',
    background: 'bg-emerald-50',
    border: 'border-emerald-200',
  },
  yellow: {
    icon: 'bg-amber-50 text-amber-700',
    background: 'bg-amber-50',
    border: 'border-amber-200',
  },
  red: {
    icon: 'bg-rose-50 text-rose-700',
    background: 'bg-rose-50',
    border: 'border-rose-200',
  },
  indigo: {
    icon: 'bg-indigo-50 text-indigo-700',
    background: 'bg-indigo-50',
    border: 'border-indigo-200',
  },
};

export function StatCard({ title, value, icon, color = 'blue' }: StatCardProps) {
  const colors = colorMap[color];

  return (
    <div className={`rounded-lg border p-4 shadow-sm ${colors.background} ${colors.border}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
        </div>
        {icon ? (
          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${colors.icon}`}>
            {icon}
          </div>
        ) : null}
      </div>
    </div>
  );
}
