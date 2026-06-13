import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  onClose: (id: string) => void;
}

export const Toast = ({ id, message, type, onClose }: ToastProps) => {
  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />
  };

  const bgs = {
    success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-50',
    error: 'bg-rose-500/10 border-rose-500/20 text-rose-50',
    info: 'bg-blue-500/10 border-blue-500/20 text-blue-50'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className={`flex items-start gap-3 p-4 rounded-2xl border shadow-2xl backdrop-blur-md pointer-events-auto ${bgs[type]}`}
      style={{ WebkitBackdropFilter: 'blur(12px)' }}
    >
      <div className="shrink-0 mt-0.5">{icons[type]}</div>
      <p className="flex-1 text-sm font-medium leading-relaxed pr-2">{message}</p>
      <button 
        onClick={() => onClose(id)} 
        className="shrink-0 p-1 opacity-50 hover:opacity-100 transition-opacity rounded-full hover:bg-white/10"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

export const ToastContainer = ({ toasts, onClose }: { toasts: Omit<ToastProps, 'onClose'>[], onClose: (id: string) => void }) => {
  return (
    <div className="fixed bottom-24 left-0 right-0 z-50 flex flex-col items-center gap-3 px-4 pointer-events-none">
      <AnimatePresence>
        {toasts.map(toast => (
          <Toast key={toast.id} {...toast} onClose={onClose} />
        ))}
      </AnimatePresence>
    </div>
  );
};
