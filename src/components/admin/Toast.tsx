'use client';

import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose?: () => void;
  duration?: number;
}

export default function Toast({
  message,
  type = 'info',
  onClose,
  duration = 4000,
}: ToastProps) {
  useEffect(() => {
    if (!onClose) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const icon =
    type === 'success' ? (
      <CheckCircle size={20} className="text-green-500" />
    ) : type === 'error' ? (
      <AlertCircle size={20} className="text-red-500" />
    ) : (
      <Info size={20} className="text-[#F5C400]" />
    );

  const borderColor =
    type === 'success'
      ? 'border-green-500'
      : type === 'error'
      ? 'border-red-500'
      : 'border-[#F5C400]';

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 bg-[#151515] border border-[#2a2a2a] border-l-4 ${borderColor} rounded-xl px-4 py-3 shadow-2xl min-w-[300px] max-w-[480px] animate-in slide-in-from-bottom duration-300">
      <span>{icon}</span>
      <p className="text-white text-sm flex-1">{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white p-1 rounded-lg"
          aria-label="Close notification"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}

export { Toast };
