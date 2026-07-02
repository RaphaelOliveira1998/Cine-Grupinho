'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn('w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-violet-400', props.className)} />
}

export function Textarea({ className, onInput, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const ref = useRef<HTMLTextAreaElement>(null)

  function resize(element: HTMLTextAreaElement) {
    element.style.height = 'auto'
    element.style.height = `${element.scrollHeight}px`
  }

  useEffect(() => {
    if (ref.current) resize(ref.current)
  }, [props.defaultValue, props.value])

  return (
    <textarea
      {...props}
      ref={ref}
      onInput={(event) => {
        resize(event.currentTarget)
        onInput?.(event)
      }}
      className={cn('min-h-32 w-full resize-y overflow-hidden rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-slate-500 focus:border-violet-400', className)}
    />
  )
}
