import { relations } from 'drizzle-orm'
import { boolean, check, integer, jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(),
  name: text('name').notNull(),
  username: text('username').unique(),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
})

export const groups = pgTable('groups', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  inviteCode: text('invite_code').notNull().unique(),
  accessPin: text('access_pin'),
  isPublic: boolean('is_public').default(false).notNull(),
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

export const profileFavoriteMovies = pgTable('profile_favorite_movies', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  movieId: uuid('movie_id').notNull().references(() => movies.id, { onDelete: 'cascade' }),
  position: integer('position').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  userMovieUnique: uniqueIndex('profile_favorite_movies_user_movie_unique').on(table.userId, table.movieId),
  userPositionUnique: uniqueIndex('profile_favorite_movies_user_position_unique').on(table.userId, table.position),
  positionCheck: check('profile_favorite_movies_position_check', sql`${table.position} >= 1 and ${table.position} <= 5`)
}))

export const recommendations = pgTable('recommendations', {
  id: uuid('id').defaultRandom().primaryKey(),
  groupId: uuid('group_id').notNull().references(() => groups.id, { onDelete: 'cascade' }),
  movieId: uuid('movie_id').notNull().references(() => movies.id, { onDelete: 'cascade' }),
  recommendedBy: uuid('recommended_by').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  status: text('status').notNull().default('recommended'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
})

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

export const weeklyCycles = pgTable('weekly_cycles', {
  id: uuid('id').defaultRandom().primaryKey(),
  groupId: uuid('group_id').notNull().references(() => groups.id, { onDelete: 'cascade' }),
  weekStart: timestamp('week_start', { withTimezone: true }).notNull(),
  chooserId: uuid('chooser_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  recommendationId: uuid('recommendation_id').references(() => recommendations.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  cycleGroupWeekUnique: uniqueIndex('weekly_cycles_group_week_unique').on(table.groupId, table.weekStart)
}))

export const profilesRelations = relations(profiles, ({ many }) => ({
  memberships: many(groupMembers),
  favoriteMovies: many(profileFavoriteMovies),
  recommendations: many(recommendations),
  ratings: many(ratings),
  comments: many(comments)
}))

export const groupsRelations = relations(groups, ({ many, one }) => ({
  owner: one(profiles, { fields: [groups.ownerId], references: [profiles.id] }),
  members: many(groupMembers),
  recommendations: many(recommendations),
  weeklyCycles: many(weeklyCycles)
}))

export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
  group: one(groups, { fields: [groupMembers.groupId], references: [groups.id] }),
  user: one(profiles, { fields: [groupMembers.userId], references: [profiles.id] })
}))

export const moviesRelations = relations(movies, ({ many }) => ({
  favoriteForProfiles: many(profileFavoriteMovies),
  recommendations: many(recommendations)
}))

export const profileFavoriteMoviesRelations = relations(profileFavoriteMovies, ({ one }) => ({
  user: one(profiles, { fields: [profileFavoriteMovies.userId], references: [profiles.id] }),
  movie: one(movies, { fields: [profileFavoriteMovies.movieId], references: [movies.id] })
}))

export const recommendationsRelations = relations(recommendations, ({ one, many }) => ({
  group: one(groups, { fields: [recommendations.groupId], references: [groups.id] }),
  movie: one(movies, { fields: [recommendations.movieId], references: [movies.id] }),
  recommender: one(profiles, { fields: [recommendations.recommendedBy], references: [profiles.id] }),
  ratings: many(ratings),
  comments: many(comments)
}))

export const weeklyCyclesRelations = relations(weeklyCycles, ({ one }) => ({
  group: one(groups, { fields: [weeklyCycles.groupId], references: [groups.id] }),
  chooser: one(profiles, { fields: [weeklyCycles.chooserId], references: [profiles.id] }),
  recommendation: one(recommendations, { fields: [weeklyCycles.recommendationId], references: [recommendations.id] })
}))
