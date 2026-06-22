'use server'

import { and, eq, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { comments, groupMembers, groups, movies, profileFavoriteMovies, profiles, ratings, recommendations } from '@/lib/db/schema'
import { createInviteCode } from '@/lib/invite'
import { getMovieDetails } from '@/lib/tmdb'
import { requireUser } from '@/lib/auth'
import { commentSchema, groupSchema, joinGroupSchema, profileSchema, ratingSchema, recommendMovieSchema, updateGroupSchema } from '@/lib/validators'
import { isGroupMember } from '@/lib/data'

function value(formData: FormData, key: string) {
  const raw = formData.get(key)
  return typeof raw === 'string' ? raw : ''
}

function values(formData: FormData, key: string) {
  return formData.getAll(key).map((item) => String(item))
}

async function uniqueInviteCode() {
  let inviteCode = createInviteCode()
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const existing = await db.query.groups.findFirst({ where: eq(groups.inviteCode, inviteCode) })
    if (!existing) return inviteCode
    inviteCode = createInviteCode()
  }
  return inviteCode
}

async function upsertMovieFromTmdb(tmdbId: number) {
  const details = await getMovieDetails(tmdbId)
  const [movie] = await db.insert(movies).values({
    tmdbId: details.id,
    title: details.title,
    originalTitle: details.original_title,
    overview: details.overview,
    posterPath: details.poster_path,
    releaseDate: details.release_date,
    genres: details.genres?.map((genre) => genre.name) || []
  }).onConflictDoUpdate({
    target: movies.tmdbId,
    set: {
      title: details.title,
      originalTitle: details.original_title,
      overview: details.overview,
      posterPath: details.poster_path,
      releaseDate: details.release_date,
      genres: details.genres?.map((genre) => genre.name) || []
    }
  }).returning()
  return movie
}

export async function updateProfileAction(formData: FormData) {
  const user = await requireUser()
  const parsed = profileSchema.parse({
    name: value(formData, 'name'),
    username: value(formData, 'username'),
    avatarUrl: value(formData, 'avatarUrl'),
    favoriteTmdbIds: values(formData, 'favoriteTmdbIds')
  })
  await db.update(profiles).set({
    name: parsed.name,
    username: parsed.username,
    avatarUrl: parsed.avatarUrl || null
  }).where(eq(profiles.id, user.id))
  await db.delete(profileFavoriteMovies).where(eq(profileFavoriteMovies.userId, user.id))
  const favoriteMovies = await Promise.all(parsed.favoriteTmdbIds.map((tmdbId) => upsertMovieFromTmdb(tmdbId)))
  await db.insert(profileFavoriteMovies).values(favoriteMovies.map((movie, index) => ({
    userId: user.id,
    movieId: movie.id,
    position: index + 1
  })))
  revalidatePath('/dashboard')
  revalidatePath(`/profile/${parsed.username}`)
  redirect('/dashboard')
}

export async function createGroupAction(formData: FormData) {
  const user = await requireUser()
  const parsed = groupSchema.parse({
    name: value(formData, 'name'),
    description: value(formData, 'description'),
    isPublic: formData.get('isPublic') === 'on',
    accessPin: value(formData, 'accessPin')
  })
  const inviteCode = await uniqueInviteCode()
  const [group] = await db.insert(groups).values({
    name: parsed.name,
    description: parsed.description || null,
    inviteCode,
    accessPin: parsed.isPublic ? null : parsed.accessPin || null,
    isPublic: parsed.isPublic,
    ownerId: user.id
  }).returning()
  await db.insert(groupMembers).values({ groupId: group.id, userId: user.id, role: 'owner' })
  redirect(`/groups/${group.id}`)
}

export async function updateGroupAction(formData: FormData) {
  const user = await requireUser()
  const parsed = updateGroupSchema.parse({
    groupId: value(formData, 'groupId'),
    name: value(formData, 'name'),
    description: value(formData, 'description'),
    isPublic: formData.get('isPublic') === 'on',
    accessPin: value(formData, 'accessPin'),
    rotateInviteCode: formData.get('rotateInviteCode') === 'on'
  })
  const group = await db.query.groups.findFirst({ where: eq(groups.id, parsed.groupId) })
  if (!group || group.ownerId !== user.id) throw new Error('Acesso negado')
  const inviteCode = parsed.rotateInviteCode ? await uniqueInviteCode() : group.inviteCode
  await db.update(groups).set({
    name: parsed.name,
    description: parsed.description || null,
    isPublic: parsed.isPublic,
    accessPin: parsed.isPublic ? null : parsed.accessPin || group.accessPin || null,
    inviteCode
  }).where(eq(groups.id, parsed.groupId))
  revalidatePath(`/groups/${parsed.groupId}`)
  redirect(`/groups/${parsed.groupId}`)
}

export async function joinGroupAction(formData: FormData) {
  const user = await requireUser()
  const parsed = joinGroupSchema.parse({ inviteCode: value(formData, 'inviteCode'), accessPin: value(formData, 'accessPin') })
  const group = await db.query.groups.findFirst({ where: eq(groups.inviteCode, parsed.inviteCode) })
  if (!group) redirect('/groups/join?error=invalid')
  if (!group.isPublic && group.accessPin && group.accessPin !== parsed.accessPin) redirect('/groups/join?error=pin')
  await db.insert(groupMembers).values({ groupId: group.id, userId: user.id, role: 'member' }).onConflictDoNothing()
  redirect(`/groups/${group.id}`)
}

export async function recommendMovieAction(formData: FormData) {
  const user = await requireUser()
  const parsed = recommendMovieSchema.parse({ groupId: value(formData, 'groupId'), tmdbId: value(formData, 'tmdbId') })
  const member = await isGroupMember(parsed.groupId, user.id)
  if (!member) throw new Error('Acesso negado')
  const movie = await upsertMovieFromTmdb(parsed.tmdbId)
  const [recommendation] = await db.insert(recommendations).values({
    groupId: parsed.groupId,
    movieId: movie.id,
    recommendedBy: user.id,
    status: 'recommended'
  }).onConflictDoNothing().returning()
  revalidatePath(`/groups/${parsed.groupId}`)
  if (recommendation) redirect(`/groups/${parsed.groupId}/movies/${recommendation.id}`)
  const existing = await db.query.recommendations.findFirst({
    where: and(eq(recommendations.groupId, parsed.groupId), eq(recommendations.movieId, movie.id))
  })
  if (existing) redirect(`/groups/${parsed.groupId}/movies/${existing.id}`)
  redirect(`/groups/${parsed.groupId}`)
}

export async function rateMovieAction(formData: FormData) {
  const user = await requireUser()
  const groupId = value(formData, 'groupId')
  const recommendationId = value(formData, 'recommendationId')
  const parsed = ratingSchema.parse({ stars: value(formData, 'stars') })
  const member = await isGroupMember(groupId, user.id)
  if (!member) throw new Error('Acesso negado')
  await db.insert(ratings).values({ recommendationId, userId: user.id, stars: parsed.stars })
    .onConflictDoUpdate({
      target: [ratings.recommendationId, ratings.userId],
      set: { stars: parsed.stars, updatedAt: sql`now()` }
    })
  revalidatePath(`/groups/${groupId}`)
  revalidatePath(`/groups/${groupId}/movies/${recommendationId}`)
}

export async function addCommentAction(formData: FormData) {
  const user = await requireUser()
  const groupId = value(formData, 'groupId')
  const recommendationId = value(formData, 'recommendationId')
  const parsed = commentSchema.parse({ body: value(formData, 'body') })
  const member = await isGroupMember(groupId, user.id)
  if (!member) throw new Error('Acesso negado')
  await db.insert(comments).values({ recommendationId, userId: user.id, body: parsed.body })
  revalidatePath(`/groups/${groupId}/movies/${recommendationId}`)
}
