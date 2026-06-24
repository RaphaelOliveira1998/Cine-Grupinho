import { describe, expect, it } from 'vitest'
import { cn, posterUrl, formatDate } from '@/lib/utils'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2')
  })

  it('resolves tailwind conflicts, keeping the last class', () => {
    expect(cn('px-4', 'px-8')).toBe('px-8')
  })

  it('ignores falsy values', () => {
    expect(cn('px-4', false && 'py-2', undefined, null, '')).toBe('px-4')
  })

  it('handles conditional classes', () => {
    const active = true
    expect(cn('base', active && 'active')).toBe('base active')
  })
})

describe('posterUrl', () => {
  it('builds the full TMDB image URL from a path', () => {
    expect(posterUrl('/abc123.jpg')).toBe('https://image.tmdb.org/t/p/w500/abc123.jpg')
  })

  it('returns null for null input', () => {
    expect(posterUrl(null)).toBeNull()
  })
})

describe('formatDate', () => {
  it('formats an ISO date string in pt-BR', () => {
    // 2024-03-15 should format as something with "mar" and "2024"
    const result = formatDate('2024-03-15')
    expect(result).toMatch(/2024/)
    expect(result.toLowerCase()).toMatch(/mar/)
  })

  it('returns "Sem data" for null', () => {
    expect(formatDate(null)).toBe('Sem data')
  })
})
