import React from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          onClick={() => onDismiss(toast.id)}
          className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg text-sm transition-all transform animate-in fade-in slide-in-from-bottom-2 duration-200 cursor-pointer ${
            toast.type === 'success'
              ? 'bg-neutral-900 text-white border-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:border-neutral-200'
              : toast.type === 'error'
              ? 'bg-rose-900 text-white border-rose-700'
              : 'bg-neutral-800 text-white border-neutral-700'
          }`}
        >
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
          {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />}
          {toast.type === 'info' && <Info className="w-4 h-4 text-sky-300 shrink-0" />}
          <span className="font-medium text-xs leading-relaxed">{toast.text}</span>
        </div>
      ))}
    </div>
  );
};
