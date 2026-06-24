'use client'

import { useFormStatus } from 'react-dom'
import { cn } from '@/lib/utils'

export function SubmitButton({ children, pendingLabel, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { pendingLabel?: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending || props.disabled}
      className={cn('rounded-xl bg-violet-500 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-50', className)}
      {...props}
    >
      {pending ? (pendingLabel ?? 'Salvando...') : children}
    </button>
  )
}
