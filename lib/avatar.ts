const allowedAvatarTypes = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
  ['image/gif', 'gif']
])

const maxAvatarBytes = 3 * 1024 * 1024

export function avatarFileError(file: File) {
  if (!file || file.size === 0) return null
  if (!allowedAvatarTypes.has(file.type)) return 'Envie uma imagem PNG, JPG, WEBP ou GIF.'
  if (file.size > maxAvatarBytes) return 'A imagem precisa ter no máximo 3MB.'
  return null
}

export function avatarStoragePath(userId: string, file: File) {
  const extension = allowedAvatarTypes.get(file.type) || 'jpg'
  return `${userId}/avatar-${crypto.randomUUID()}.${extension}`
}

export function hasAvatarUpload(file: File | null) {
  return Boolean(file && file.size > 0)
}
