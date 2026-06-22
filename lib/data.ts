import { and, avg, count, desc, eq, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { comments, groupMembers, groups, movies, profileFavoriteMovies, profiles, ratings, recommendations } from '@/lib/db/schema'

export async function isGroupMember(groupId: string, userId: string) {
  const member = await db.query.groupMembers.findFirst({
    where: and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId))
  })
  return Boolean(member)
}

export async function getMyGroups(userId: string) {
  return db.select({
    id: groups.id,
    name: groups.name,
    description: groups.description,
    inviteCode: groups.inviteCode,
    isPublic: groups.isPublic,
    role: groupMembers.role,
    createdAt: groups.createdAt,
    memberCount: sql<number>`(select count(*)::int from group_members gm where gm.group_id = ${groups.id})`
  })
    .from(groupMembers)
    .innerJoin(groups, eq(groupMembers.groupId, groups.id))
    .where(eq(groupMembers.userId, userId))
    .orderBy(desc(groups.createdAt))
}

export async function getGroupForMember(groupId: string, userId: string) {
  const group = await db.select({
    id: groups.id,
    name: groups.name,
    description: groups.description,
    inviteCode: groups.inviteCode,
    accessPin: groups.accessPin,
    isPublic: groups.isPublic,
    ownerId: groups.ownerId,
    role: groupMembers.role,
    createdAt: groups.createdAt
  })
    .from(groups)
    .innerJoin(groupMembers, eq(groupMembers.groupId, groups.id))
    .where(and(eq(groups.id, groupId), eq(groupMembers.userId, userId)))
    .limit(1)
  return group[0] || null
}

export async function getGroupMembers(groupId: string) {
  return db.select({
    id: profiles.id,
    name: profiles.name,
    username: profiles.username,
    avatarUrl: profiles.avatarUrl,
    role: groupMembers.role
  })
    .from(groupMembers)
    .innerJoin(profiles, eq(groupMembers.userId, profiles.id))
    .where(eq(groupMembers.groupId, groupId))
    .orderBy(desc(groupMembers.createdAt))
}

export async function getProfileByUsername(username: string) {
  const rows = await db.select({
    id: profiles.id,
    name: profiles.name,
    username: profiles.username,
    avatarUrl: profiles.avatarUrl,
    createdAt: profiles.createdAt
  })
    .from(profiles)
    .where(eq(profiles.username, username))
    .limit(1)
  return rows[0] || null
}

export async function getProfileFavorites(userId: string) {
  return db.select({
    id: profileFavoriteMovies.id,
    position: profileFavoriteMovies.position,
    movieId: movies.id,
    tmdbId: movies.tmdbId,
    title: movies.title,
    overview: movies.overview,
    posterPath: movies.posterPath,
    releaseDate: movies.releaseDate,
    genres: movies.genres
  })
    .from(profileFavoriteMovies)
    .innerJoin(movies, eq(profileFavoriteMovies.movieId, movies.id))
    .where(eq(profileFavoriteMovies.userId, userId))
    .orderBy(profileFavoriteMovies.position)
}

export async function getGroupRecommendations(groupId: string) {
  return db.select({
    id: recommendations.id,
    status: recommendations.status,
    createdAt: recommendations.createdAt,
    movieId: movies.id,
    tmdbId: movies.tmdbId,
    title: movies.title,
    overview: movies.overview,
    posterPath: movies.posterPath,
    releaseDate: movies.releaseDate,
    genres: movies.genres,
    recommendedById: profiles.id,
    recommendedByUsername: profiles.username,
    recommendedByName: profiles.name,
    averageRating: avg(ratings.stars),
    ratingCount: count(ratings.id)
  })
    .from(recommendations)
    .innerJoin(movies, eq(recommendations.movieId, movies.id))
    .innerJoin(profiles, eq(recommendations.recommendedBy, profiles.id))
    .leftJoin(ratings, eq(ratings.recommendationId, recommendations.id))
    .where(eq(recommendations.groupId, groupId))
    .groupBy(recommendations.id, movies.id, profiles.id)
    .orderBy(desc(recommendations.createdAt))
}

export async function getRecommendationDetail(groupId: string, recommendationId: string, userId: string) {
  const rows = await db.select({
    id: recommendations.id,
    status: recommendations.status,
    createdAt: recommendations.createdAt,
    movieId: movies.id,
    tmdbId: movies.tmdbId,
    title: movies.title,
    originalTitle: movies.originalTitle,
    overview: movies.overview,
    posterPath: movies.posterPath,
    releaseDate: movies.releaseDate,
    genres: movies.genres,
    recommendedById: profiles.id,
    recommendedByUsername: profiles.username,
    recommendedByName: profiles.name,
    averageRating: avg(ratings.stars),
    ratingCount: count(ratings.id),
    myRating: sql<number | null>`max(case when ${ratings.userId} = ${userId} then ${ratings.stars} end)`
  })
    .from(recommendations)
    .innerJoin(movies, eq(recommendations.movieId, movies.id))
    .innerJoin(profiles, eq(recommendations.recommendedBy, profiles.id))
    .leftJoin(ratings, eq(ratings.recommendationId, recommendations.id))
    .where(and(eq(recommendations.id, recommendationId), eq(recommendations.groupId, groupId)))
    .groupBy(recommendations.id, movies.id, profiles.id)
    .limit(1)
  return rows[0] || null
}

export async function getRecommendationComments(recommendationId: string) {
  return db.select({
    id: comments.id,
    body: comments.body,
    createdAt: comments.createdAt,
    authorName: profiles.name,
    authorUsername: profiles.username,
    avatarUrl: profiles.avatarUrl
  })
    .from(comments)
    .innerJoin(profiles, eq(comments.userId, profiles.id))
    .where(eq(comments.recommendationId, recommendationId))
    .orderBy(desc(comments.createdAt))
}
