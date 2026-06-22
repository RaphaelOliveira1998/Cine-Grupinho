import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

export const registerSchema = loginSchema.extend({
  name: z.string().min(2).max(80)
})

export const groupSchema = z.object({
  name: z.string().min(2).max(80),
  description: z.string().max(240).optional(),
  isPublic: z.coerce.boolean().default(false),
  accessPin: z.string().trim().min(4).max(12).optional().or(z.literal(''))
})

export const updateGroupSchema = groupSchema.extend({
  groupId: z.string().uuid(),
  rotateInviteCode: z.coerce.boolean().default(false)
})

export const joinGroupSchema = z.object({
  inviteCode: z.string().min(4).max(16).transform((value) => value.trim().toUpperCase()),
  accessPin: z.string().trim().max(12).optional().or(z.literal(''))
})

export const ratingSchema = z.object({
  stars: z.coerce.number().int().min(1).max(5)
})

export const commentSchema = z.object({
  body: z.string().min(1).max(1000)
})

export const searchSchema = z.object({
  q: z.string().min(1).max(120)
})

export const recommendMovieSchema = z.object({
  groupId: z.string().uuid(),
  tmdbId: z.coerce.number().int().positive()
})

export const profileSchema = z.object({
  name: z.string().min(2).max(80),
  username: z.string().trim().toLowerCase().regex(/^[a-z0-9_]{3,24}$/),
  avatarUrl: z.string().url().max(500).optional().or(z.literal('')),
  favoriteTmdbIds: z.array(z.coerce.number().int().positive()).max(5)
})
