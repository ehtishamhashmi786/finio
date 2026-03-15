import React, { createContext, useCallback, useContext, useState } from 'react'
import type { ToastMessage, ToastType } from '@/types'

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
  }, [])

  const colors: Record<ToastType, string> = {
    success: 'bg-green-500/10 border border-brand-green/30 text-brand-green',
    error:   'bg-red-500/10 border border-brand-red/30 text-brand-red',
    info:    'bg-blue-500/10 border border-brand-blue/30 text-brand-blue',
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`${colors[t.type]} px-4 py-3 rounded-[var(--radius)] text-sm font-medium animate-fade-up backdrop-blur-sm`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}
