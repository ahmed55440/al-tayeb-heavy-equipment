'use client';

import { useTheme } from './ThemeProvider';
import { Sun, Moon } from 'lucide-react';
import { useLocale } from './LocaleProvider';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export default function ThemeToggle({ className = '', showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const { isRtl } = useLocale();

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex items-center gap-2 p-2 rounded-xl transition-all duration-300 ${
        isDark
          ? 'bg-[#151515] hover:bg-[#222] border border-[#2a2a2a] text-yellow-400 hover:text-yellow-300'
          : 'bg-[#F3F3F3] hover:bg-[#EAEAEA] border border-[#D1D5DB] text-amber-600 hover:text-amber-700'
      } shadow-sm cursor-pointer group focus:outline-none focus:ring-2 focus:ring-[#F5C400]/50 ${className}`}
      title={
        isDark
          ? isRtl
            ? 'التبديل إلى الوضع النهاري (Light Mode)'
            : 'Switch to Light Mode'
          : isRtl
          ? 'التبديل إلى الوضع الليلي (Dark Mode)'
          : 'Switch to Dark Mode'
      }
      aria-label="Toggle theme"
    >
      <div className="relative w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
        {isDark ? (
          <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-[#F5C400] transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
        ) : (
          <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 transition-transform duration-300 group-hover:rotate-45 group-hover:scale-110" />
        )}
      </div>

      {showLabel && (
        <span className="text-xs font-bold">
          {isDark
            ? isRtl
              ? 'الوضع الليلي'
              : 'Dark Mode'
            : isRtl
            ? 'الوضع النهاري'
            : 'Light Mode'}
        </span>
      )}
    </button>
  );
}
