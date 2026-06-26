import { describe, expect, it } from 'vitest'
import { avatarFileError, avatarStoragePath, hasAvatarUpload } from '@/lib/avatar'

describe('avatar upload helpers', () => {
  it('accepts common image upload types', () => {
    const file = new File(['x'], 'avatar.png', { type: 'image/png' })
    expect(avatarFileError(file)).toBeNull()
  })

  it('rejects non image uploads', () => {
    const file = new File(['x'], 'avatar.txt', { type: 'text/plain' })
    expect(avatarFileError(file)).toBe('Envie uma imagem PNG, JPG, WEBP ou GIF.')
  })

  it('rejects files over 10MB', () => {
    const big = new File([new Uint8Array(10 * 1024 * 1024 + 1)], 'big.jpg', { type: 'image/jpeg' })
    expect(avatarFileError(big)).toBe('A imagem precisa ter no máximo 10MB.')
  })

  it('returns null for an empty file (no upload)', () => {
    const empty = new File([], 'empty.png', { type: 'image/png' })
    expect(avatarFileError(empty)).toBeNull()
  })

  it('builds a user scoped storage path with the right extension', () => {
    const file = new File(['x'], 'avatar.webp', { type: 'image/webp' })
    expect(avatarStoragePath('user-1', file)).toMatch(/^user-1\/avatar-[a-f0-9-]+\.webp$/)
  })

  it('uses jpg extension for image/jpeg', () => {
    const file = new File(['x'], 'photo.jpg', { type: 'image/jpeg' })
    expect(avatarStoragePath('user-2', file)).toMatch(/\.jpg$/)
  })
})

describe('hasAvatarUpload', () => {
  it('returns true for a non-empty file', () => {
    const file = new File(['x'], 'a.png', { type: 'image/png' })
    expect(hasAvatarUpload(file)).toBe(true)
  })

  it('returns false for an empty file', () => {
    const empty = new File([], 'a.png', { type: 'image/png' })
    expect(hasAvatarUpload(empty)).toBe(false)
  })

  it('returns false for null', () => {
    expect(hasAvatarUpload(null)).toBe(false)
  })
})
