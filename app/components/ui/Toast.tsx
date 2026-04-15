'use client'

import { useEffect, useState } from 'react'

interface ToastProps {
  message: string
  type?: 'error' | 'success'
  onClose: () => void
}

export function Toast({ message, type = 'error', onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-lg fade-in
      ${type === 'error' ? 'bg-red-900 text-red-100' : 'bg-zinc-800 text-zinc-100'}`}>
      {message}
    </div>
  )
}

export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null)

  const show = (message: string, type: 'error' | 'success' = 'error') => {
    setToast({ message, type })
  }

  const hide = () => setToast(null)

  return { toast, show, hide }
}
