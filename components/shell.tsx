import Link from 'next/link'
import Image from 'next/image'
import { eq } from 'drizzle-orm'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { profiles } from '@/lib/db/schema'
import { getProfileFavorites } from '@/lib/data'
import { ProfilePanel } from '@/components/profile-panel'

export async function AppShell({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  const profile = data.user ? await db.query.profiles.findFirst({ where: eq(profiles.id, data.user.id) }) : null
  const favorites = profile ? await getProfileFavorites(profile.id) : []
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#312e81,transparent_35%),#050816]">
      <header className="border-b border-white/10 bg-black/20 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/dashboard" className="flex items-center gap-3 font-semibold tracking-tight text-white">
            <span className="overflow-hidden rounded-2xl"><Image src="/icon.png" alt="Beckflix" width={40} height={40} className="h-10 w-10 object-cover" /></span>
            Beckflix
          </Link>
          <div className="flex items-center gap-3 text-sm text-slate-300">
            <span className="hidden md:block">{data.user?.email}</span>
            {profile && (
              <ProfilePanel
                profile={{ id: profile.id, name: profile.name, username: profile.username ?? null, avatarUrl: profile.avatarUrl ?? null }}
                favorites={favorites.map((f) => ({ id: f.id, movieId: f.movieId, tmdbId: f.tmdbId, title: f.title, overview: f.overview ?? null, posterPath: f.posterPath ?? null, releaseDate: f.releaseDate ?? null, position: f.position }))}
              />
            )}
            <form action="/auth/signout" method="post">
              <button className="rounded-xl border border-white/10 px-3 py-2 hover:bg-white/10">Sair</button>
            </form>
          </div>
        </div>
      </header>
      <section className="mx-auto max-w-6xl px-4 py-8">{children}</section>
    </main>
  )
}
