"use client"

import { toast as sonnerToast } from "sonner"
import type { ReactNode } from "react"

type ToastProps = {
  title?: ReactNode
  description?: ReactNode
  className?: string
}

type UseToastReturn = {
  toast: (props: ToastProps) => void
  dismiss: typeof sonnerToast.dismiss
}

export function useToast(): UseToastReturn {
  const toast = ({ title, description, className }: ToastProps) => {
    sonnerToast.custom((t) => (
      <div className={`rounded-xl shadow-lg ${className ?? ""}`}>
        <div className="flex items-start justify-between gap-4 px-5 py-4">
          <div className="flex-1">
            {title && (
              <div className="mb-1 font-semibold">
                {title}
              </div>
            )}
            {description}
          </div>

          <button
            onClick={() => sonnerToast.dismiss(t)}
            className="ml-3 transition opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      </div>
    ))
  }

  return {
    toast,
    dismiss: sonnerToast.dismiss,
  }
}

export const toast = sonnerToast