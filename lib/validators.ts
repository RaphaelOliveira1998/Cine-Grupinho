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
  description: z.string().max(240).optional()
})

export const joinGroupSchema = z.object({
  inviteCode: z.string().min(4).max(16).transform((value) => value.trim().toUpperCase())
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
