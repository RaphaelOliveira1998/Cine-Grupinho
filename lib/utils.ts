import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function posterUrl(path: string | null) {
  return path ? `https://image.tmdb.org/t/p/w500${path}` : null
}

export function formatDate(date: string | null) {
  if (!date) return 'Sem data'
  return new Intl.DateTimeFormat('pt-BR', { year: 'numeric', month: 'short', day: '2-digit' }).format(new Date(date))
}
