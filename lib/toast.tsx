"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { X, MessageCircle } from "lucide-react";
import Image from "next/image";

type Toast = {
  id: string;
  senderName: string;
  senderAvatar: string;
  message: string;
  chatUrl: string;
};

type ToastContextType = {
  showToast: (toast: Omit<Toast, "id">) => void;
};

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const dismiss = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="bg-[var(--charcoal)] text-[var(--cream)] rounded-xl shadow-2xl p-4 flex items-start gap-3 animate-slide-in border border-[var(--gold)]/20"
          >
            <Image
              src={toast.senderAvatar}
              alt={toast.senderName}
              width={40}
              height={40}
              className="rounded-full object-cover border border-[var(--gold)]/30 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <MessageCircle size={12} className="text-[var(--gold)]" />
                <p className="text-[var(--gold)] text-[10px] font-bold uppercase tracking-widest">
                  {toast.senderName}
                </p>
              </div>
              <p className="text-sm font-serif text-[var(--cream)]/80 truncate">{toast.message}</p>
              <a
                href={toast.chatUrl}
                className="text-[9px] font-bold uppercase tracking-widest text-[var(--gold)] hover:text-white mt-1 block transition-colors"
              >
                Open Chat →
              </a>
            </div>
            <button onClick={() => dismiss(toast.id)} className="text-white/30 hover:text-white transition-colors flex-shrink-0">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
