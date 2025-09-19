import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

type Kind = 'success' | 'error' | 'info';

interface Toast { id: number; title?: string; message: string; kind: Kind; }
interface ToastCtx { notify: (message: string, kind?: Kind, title?: string) => void; }

const Ctx = createContext<ToastCtx | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<Toast[]>([]);
  const notify = useCallback((message: string, kind: Kind = 'info', title?: string) => {
    const t: Toast = { id: Date.now() + Math.random(), message, kind, title };
    setItems(prev => [t, ...prev].slice(0, 5));
    setTimeout(() => setItems(prev => prev.filter(i => i.id !== t.id)), 3500);
  }, []);
  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="toast-wrap">
        {items.map(t => (
          <div key={t.id} className={`toast ${t.kind}`}>
            {t.title && <div className="title">{t.title}</div>}
            <div className="msg">{t.message}</div>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
