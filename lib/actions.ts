'use server'

import { eq, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { comments, groupMembers, groups, movies, profileFavoriteMovies, profiles, ratings, recommendations, weeklyCycles } from '@/lib/db/schema'
import { createInviteCode } from '@/lib/invite'
import { getMovieDetails } from '@/lib/tmdb'
import { requireUser } from '@/lib/auth'
import { commentSchema, groupSchema, joinGroupSchema, profileSchema, ratingSchema, chooseWeeklyMovieSchema, updateGroupSchema } from '@/lib/validators'
import { getOrCreateCurrentCycle, getCycleForRecommendation, isGroupMember } from '@/lib/data'
import { avatarFileError, avatarStoragePath, hasAvatarUpload } from '@/lib/avatar'
import { createAdminClient } from '@/lib/supabase/admin'
import { nextWeekStart, currentWeekStart } from '@/lib/week'

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

async function uploadAvatar(userId: string, file: File | null) {
  if (!file || !hasAvatarUpload(file)) return null
  const error = avatarFileError(file)
  if (error) throw new Error(error)
  const supabase = createAdminClient()
  const bucket = 'avatars'
  const buckets = await supabase.storage.listBuckets()
  if (!buckets.data?.some((item) => item.name === bucket)) {
    const created = await supabase.storage.createBucket(bucket, { public: true, fileSizeLimit: 3145728, allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] })
    if (created.error) throw new Error(created.error.message)
  }
  const path = avatarStoragePath(userId, file)
  const uploaded = await supabase.storage.from(bucket).upload(path, file, { contentType: file.type, upsert: true })
  if (uploaded.error) throw new Error(uploaded.error.message)
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl
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
  const rawAvatarFile = formData.get('avatarFile')
  const avatarFile = rawAvatarFile instanceof File ? rawAvatarFile : null
  const uploadedAvatarUrl = await uploadAvatar(user.id, avatarFile)
  const parsed = profileSchema.parse({
    name: value(formData, 'name'),
    username: value(formData, 'username'),
    avatarUrl: uploadedAvatarUrl || value(formData, 'avatarUrl'),
    favoriteTmdbIds: values(formData, 'favoriteTmdbIds')
  })
  await db.update(profiles).set({
    name: parsed.name,
    username: parsed.username,
    avatarUrl: parsed.avatarUrl || null
  }).where(eq(profiles.id, user.id))
  await db.delete(profileFavoriteMovies).where(eq(profileFavoriteMovies.userId, user.id))
  const favoriteMovies = await Promise.all(parsed.favoriteTmdbIds.map((tmdbId) => upsertMovieFromTmdb(tmdbId)))
  if (favoriteMovies.length > 0) {
    await db.insert(profileFavoriteMovies).values(favoriteMovies.map((movie, index) => ({
      userId: user.id,
      movieId: movie.id,
      position: index + 1
    })))
  }
  revalidatePath('/dashboard')
  revalidatePath(`/profile/${parsed.username}`)
  redirect('/dashboard')
}

export async function updateProfilePanelAction(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  try {
    const user = await requireUser()
    const rawAvatarFile = formData.get('avatarFile')
    const avatarFile = rawAvatarFile instanceof File ? rawAvatarFile : null
    const uploadedAvatarUrl = await uploadAvatar(user.id, avatarFile)
    const parsed = profileSchema.parse({
      name: value(formData, 'name'),
      username: value(formData, 'username'),
      avatarUrl: uploadedAvatarUrl || value(formData, 'avatarUrl'),
      favoriteTmdbIds: values(formData, 'favoriteTmdbIds')
    })
    await db.update(profiles).set({
      name: parsed.name,
      username: parsed.username,
      avatarUrl: parsed.avatarUrl || null
    }).where(eq(profiles.id, user.id))
    await db.delete(profileFavoriteMovies).where(eq(profileFavoriteMovies.userId, user.id))
    const favoriteMovies = await Promise.all(parsed.favoriteTmdbIds.map((tmdbId) => upsertMovieFromTmdb(tmdbId)))
    if (favoriteMovies.length > 0) {
      await db.insert(profileFavoriteMovies).values(favoriteMovies.map((movie, index) => ({
        userId: user.id,
        movieId: movie.id,
        position: index + 1
      })))
    }
    revalidatePath('/', 'layout')
    return { success: true }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Erro ao salvar perfil' }
  }
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
    ownerId: user.id,
    firstCycleAt: null
  }).returning()
  await db.insert(groupMembers).values({ groupId: group.id, userId: user.id, role: 'owner' })
  redirect(`/groups/${group.id}`)
}

export async function startGroupCycleAction(formData: FormData) {
  const user = await requireUser()
  const groupId = value(formData, 'groupId')
  const mode = value(formData, 'mode')
  const group = await db.query.groups.findFirst({ where: eq(groups.id, groupId) })
  if (!group || group.ownerId !== user.id) throw new Error('Acesso negado')
  const firstCycleAt = mode === 'next_week' ? nextWeekStart() : currentWeekStart()
  await db.update(groups).set({ firstCycleAt }).where(eq(groups.id, groupId))
  revalidatePath(`/groups/${groupId}`)
  redirect(`/groups/${groupId}`)
}

export async function deleteGroupAction(formData: FormData) {
  const user = await requireUser()
  const groupId = value(formData, 'groupId')
  const group = await db.query.groups.findFirst({ where: eq(groups.id, groupId) })
  if (!group || group.ownerId !== user.id) throw new Error('Acesso negado')
  await db.delete(groups).where(eq(groups.id, groupId))
  redirect('/dashboard')
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

export async function chooseWeeklyMovieAction(formData: FormData) {
  const user = await requireUser()
  const parsed = chooseWeeklyMovieSchema.parse({ groupId: value(formData, 'groupId'), tmdbId: value(formData, 'tmdbId') })
  const member = await isGroupMember(parsed.groupId, user.id)
  if (!member) throw new Error('Acesso negado')
  const cycle = await getOrCreateCurrentCycle(parsed.groupId)
  if (!cycle) throw new Error('Nenhum ciclo ativo para este grupo')
  if (cycle.chooserId !== user.id) throw new Error('Apenas o membro sorteado pode escolher o filme da semana')
  if (cycle.recommendationId) throw new Error('O filme da semana já foi escolhido')
  const movie = await upsertMovieFromTmdb(parsed.tmdbId)
  const [recommendation] = await db.insert(recommendations).values({
    groupId: parsed.groupId,
    movieId: movie.id,
    recommendedBy: user.id,
    status: 'weekly'
  }).returning()
  await db.update(weeklyCycles).set({ recommendationId: recommendation.id }).where(eq(weeklyCycles.id, cycle.id))
  revalidatePath(`/groups/${parsed.groupId}`)
  redirect(`/groups/${parsed.groupId}/movies/${recommendation.id}`)
}

export async function rateMovieAction(formData: FormData) {
  const user = await requireUser()
  const groupId = value(formData, 'groupId')
  const recommendationId = value(formData, 'recommendationId')
  const parsed = ratingSchema.parse({ stars: value(formData, 'stars') })
  const member = await isGroupMember(groupId, user.id)
  if (!member) throw new Error('Acesso negado')
  const cycle = await getCycleForRecommendation(recommendationId)
  if (!cycle) throw new Error('Este filme não está em votação')
  const activeCycle = await getOrCreateCurrentCycle(groupId)
  if (!activeCycle || activeCycle.id !== cycle.id) throw new Error('A semana de avaliação deste filme já encerrou')
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
  const cycle = await getCycleForRecommendation(recommendationId)
  if (!cycle) throw new Error('Este filme não está em votação')
  const activeCycle = await getOrCreateCurrentCycle(groupId)
  if (!activeCycle || activeCycle.id !== cycle.id) throw new Error('A semana de avaliação deste filme já encerrou')
  await db.insert(comments).values({ recommendationId, userId: user.id, body: parsed.body })
  revalidatePath(`/groups/${groupId}/movies/${recommendationId}`)
}
