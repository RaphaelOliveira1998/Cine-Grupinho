import { relations } from 'drizzle-orm'
import { check, integer, jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(),
  name: text('name').notNull(),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
})

export const groups = pgTable('groups', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  inviteCode: text('invite_code').notNull().unique(),
  ownerId: uuid('owner_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
})

export const groupMembers = pgTable('group_members', {
  id: uuid('id').defaultRandom().primaryKey(),
  groupId: uuid('group_id').notNull().references(() => groups.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  role: text('role').notNull().default('member'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  memberUnique: uniqueIndex('group_members_group_user_unique').on(table.groupId, table.userId)
}))

export const movies = pgTable('movies', {
  id: uuid('id').defaultRandom().primaryKey(),
  tmdbId: integer('tmdb_id').notNull().unique(),
  title: text('title').notNull(),
  originalTitle: text('original_title'),
  overview: text('overview'),
  posterPath: text('poster_path'),
  releaseDate: text('release_date'),
  genres: jsonb('genres').$type<string[]>().default([]).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
})

export const recommendations = pgTable('recommendations', {
  id: uuid('id').defaultRandom().primaryKey(),
  groupId: uuid('group_id').notNull().references(() => groups.id, { onDelete: 'cascade' }),
  movieId: uuid('movie_id').notNull().references(() => movies.id, { onDelete: 'cascade' }),
  recommendedBy: uuid('recommended_by').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  status: text('status').notNull().default('recommended'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  recommendationUnique: uniqueIndex('recommendations_group_movie_unique').on(table.groupId, table.movieId)
}))

export const ratings = pgTable('ratings', {
  id: uuid('id').defaultRandom().primaryKey(),
  recommendationId: uuid('recommendation_id').notNull().references(() => recommendations.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  stars: integer('stars').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  ratingUnique: uniqueIndex('ratings_recommendation_user_unique').on(table.recommendationId, table.userId),
  starsCheck: check('ratings_stars_check', sql`${table.stars} >= 1 and ${table.stars} <= 5`)
}))

export const comments = pgTable('comments', {
  id: uuid('id').defaultRandom().primaryKey(),
  recommendationId: uuid('recommendation_id').notNull().references(() => recommendations.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  body: text('body').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
})

export const profilesRelations = relations(profiles, ({ many }) => ({
  memberships: many(groupMembers),
  recommendations: many(recommendations),
  ratings: many(ratings),
  comments: many(comments)
}))

export const groupsRelations = relations(groups, ({ many, one }) => ({
  owner: one(profiles, { fields: [groups.ownerId], references: [profiles.id] }),
  members: many(groupMembers),
  recommendations: many(recommendations)
}))

export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
  group: one(groups, { fields: [groupMembers.groupId], references: [groups.id] }),
  user: one(profiles, { fields: [groupMembers.userId], references: [profiles.id] })
}))

export const moviesRelations = relations(movies, ({ many }) => ({
  recommendations: many(recommendations)
}))

export const recommendationsRelations = relations(recommendations, ({ one, many }) => ({
  group: one(groups, { fields: [recommendations.groupId], references: [groups.id] }),
  movie: one(movies, { fields: [recommendations.movieId], references: [movies.id] }),
  recommender: one(profiles, { fields: [recommendations.recommendedBy], references: [profiles.id] }),
  ratings: many(ratings),
  comments: many(comments)
}))
