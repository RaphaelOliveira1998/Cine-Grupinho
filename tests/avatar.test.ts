import { describe, expect, it } from 'vitest'
import { avatarFileError, avatarStoragePath } from '@/lib/avatar'

describe('avatar upload helpers', () => {
  it('accepts common image upload types', () => {
    const file = new File(['x'], 'avatar.png', { type: 'image/png' })
    expect(avatarFileError(file)).toBeNull()
  })

  it('rejects non image uploads', () => {
    const file = new File(['x'], 'avatar.txt', { type: 'text/plain' })
    expect(avatarFileError(file)).toBe('Envie uma imagem PNG, JPG, WEBP ou GIF.')
  })

  it('builds a user scoped storage path with the right extension', () => {
    const file = new File(['x'], 'avatar.webp', { type: 'image/webp' })
    expect(avatarStoragePath('user-1', file)).toMatch(/^user-1\/avatar-[a-f0-9-]+\.webp$/)
  })
})
