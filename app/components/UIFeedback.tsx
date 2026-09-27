"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
}

interface UIContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const UIContext = createContext<UIContextType | null>(null);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    options: ConfirmOptions;
    resolve: (val: boolean) => void;
  } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmModal({
        isOpen: true,
        options,
        resolve,
      });
    });
  }, []);

  const handleConfirmResponse = (choice: boolean) => {
    if (confirmModal) {
      confirmModal.resolve(choice);
      setConfirmModal(null);
    }
  };

  return (
    <UIContext.Provider value={{ showToast, confirm }}>
      {children}

      {/* Toast Notifications container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none px-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all animate-in slide-in-from-bottom-5 duration-300 ${
              toast.type === 'success'
                ? 'bg-[#0f1d15]/90 border-green-500/30 text-green-200'
                : toast.type === 'error'
                ? 'bg-[#200e12]/90 border-red-500/30 text-red-200'
                : 'bg-[#111827]/90 border-blue-500/30 text-blue-200'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />}
            <p className="text-sm font-medium flex-1 text-white leading-relaxed">{toast.message}</p>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      {confirmModal && confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0e0e0e] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
            <h3 className="text-xl font-serif text-white mb-2">{confirmModal.options.title}</h3>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              {confirmModal.options.message}
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => handleConfirmResponse(false)}
                className="px-5 py-2.5 rounded-xl border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium"
              >
                {confirmModal.options.cancelText || 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => handleConfirmResponse(true)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-lg ${
                  confirmModal.options.destructive
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-white hover:bg-gray-200 text-black'
                }`}
              >
                {confirmModal.options.confirmText || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
}
