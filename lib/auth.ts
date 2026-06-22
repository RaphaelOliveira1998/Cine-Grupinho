import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { profiles } from '@/lib/db/schema'
import { createClient } from '@/lib/supabase/server'

export async function getCurrentUser() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  return data.user
}

export async function requireUser() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  await ensureProfile(user.id, user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário')
  return user
}

export async function ensureProfile(id: string, name: string, avatarUrl?: string | null) {
  const existing = await db.query.profiles.findFirst({ where: eq(profiles.id, id) })
  if (existing) return existing
  const [profile] = await db.insert(profiles)
    .values({ id, name, avatarUrl: avatarUrl || null })
    .onConflictDoUpdate({
      target: profiles.id,
      set: { name, avatarUrl: avatarUrl || null }
    })
    .returning()
  return profile
}
