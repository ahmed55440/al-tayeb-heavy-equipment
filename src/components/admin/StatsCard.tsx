'use client';

import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  icon: LucideIcon;
  title?: string;
  label?: string;
  value: string | number;
  color?: string;
  subtitle?: string;
}

export default function StatsCard({
  icon: Icon,
  title,
  label,
  value,
  color = '#F5C400',
  subtitle,
}: StatsCardProps) {
  const displayTitle = title || label || '';

  return (
    <div className="bg-[#151515] border border-[#262626] rounded-2xl p-5 flex items-center gap-4 hover:border-[#383838] transition-all shadow-md">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${color}15`, color }}
      >
        <Icon size={24} />
      </div>
      <div className="min-w-0">
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider truncate">
          {displayTitle}
        </p>
        <p className="text-white text-2xl font-black mt-0.5 tracking-tight font-mono">{value}</p>
        {subtitle && (
          <p className="text-[11px] text-gray-500 mt-0.5 truncate">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
