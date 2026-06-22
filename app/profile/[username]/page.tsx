import Image from 'next/image'
import { notFound } from 'next/navigation'
import { AppShell } from '@/components/shell'
import { requireCompletedProfile } from '@/lib/auth'
import { getProfileByUsername, getProfileFavorites } from '@/lib/data'
import { posterUrl } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  await requireCompletedProfile()
  const { username } = await params
  const profile = await getProfileByUsername(username)
  if (!profile) notFound()
  const favorites = await getProfileFavorites(profile.id)
  return (
    <AppShell>
      <div className="space-y-8">
        <section className="flex flex-col gap-5 rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:flex-row sm:items-center">
          <div className="h-24 w-24 overflow-hidden rounded-3xl bg-slate-900">
            {profile.avatarUrl ? <Image src={profile.avatarUrl} alt={profile.name} width={160} height={160} unoptimized className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-3xl text-violet-200">{profile.name.slice(0, 1).toUpperCase()}</div>}
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-violet-300">Perfil</p>
            <h1 className="mt-2 text-4xl font-bold text-white">{profile.name}</h1>
            <p className="mt-1 text-slate-400">@{profile.username}</p>
          </div>
        </section>
        <section>
          <h2 className="text-2xl font-bold text-white">Top 5 filmes favoritos</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {favorites.map((movie) => {
              const poster = posterUrl(movie.posterPath)
              return (
                <article key={movie.id} className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]">
                  <div className="relative aspect-[2/3] bg-slate-900">
                    {poster ? <Image src={poster} alt={movie.title} fill sizes="220px" className="object-cover" /> : <div className="flex h-full items-center justify-center text-slate-500">Sem poster</div>}
                    <span className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-sm font-semibold text-violet-200">#{movie.position}</span>
                  </div>
                  <div className="p-4">
                    <h3 className="line-clamp-2 font-semibold text-white">{movie.title}</h3>
                    <p className="mt-1 text-xs text-slate-400">{movie.releaseDate || 'Sem data'}</p>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      </div>
    </AppShell>
  )
}
