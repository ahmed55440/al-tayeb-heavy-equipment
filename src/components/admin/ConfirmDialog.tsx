'use client';

import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  open?: boolean;
  isOpen?: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmText?: string;
  cancelLabel?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  destructive?: boolean;
}

export default function ConfirmDialog({
  open,
  isOpen,
  title,
  message,
  confirmLabel,
  confirmText = 'Confirm',
  cancelLabel,
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  destructive = true,
}: ConfirmDialogProps) {
  const isVisible = open !== undefined ? open : isOpen;
  if (!isVisible) return null;

  const actualConfirmText = confirmLabel || confirmText;
  const actualCancelText = cancelLabel || cancelText;

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-[#151515] border border-[#2a2a2a] rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg"
        >
          <X size={18} />
        </button>
        <div className="flex items-start gap-4">
          <div
            className={`p-3 rounded-xl flex-shrink-0 ${
              destructive ? 'bg-red-500/10 text-red-500' : 'bg-[#F5C400]/10 text-[#F5C400]'
            }`}
          >
            <AlertTriangle size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-white text-lg font-bold mb-1">{title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#222]">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-[#222] text-gray-300 hover:bg-[#2a2a2a] hover:text-white transition-colors text-sm font-medium"
          >
            {actualCancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              destructive
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20'
                : 'bg-[#F5C400] hover:bg-[#FFD429] text-black font-bold shadow-lg shadow-[#F5C400]/20'
            }`}
          >
            {actualConfirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
