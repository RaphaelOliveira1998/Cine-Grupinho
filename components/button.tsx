import Link from 'next/link'
import { cn } from '@/lib/utils'

export function Button({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={cn('rounded-xl bg-violet-500 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-50', className)} {...props} />
}

export function LinkButton({ className, ...props }: React.ComponentProps<typeof Link>) {
  return <Link className={cn('inline-flex rounded-xl bg-violet-500 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-400', className)} {...props} />
}
