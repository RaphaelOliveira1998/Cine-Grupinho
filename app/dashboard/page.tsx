import { LinkButton } from '@/components/button'
import { MovieCarousel } from '@/components/movie-carousel'
import { AppShell } from '@/components/shell'
import { requireUser } from '@/lib/auth'
import { getMyGroups } from '@/lib/data'
import { getTrendingMovies } from '@/lib/tmdb'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const user = await requireUser()
  const [groups, trendingMovies] = await Promise.all([getMyGroups(user.id), getTrendingMovies()])
  return (
    <AppShell>
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-violet-300">Dashboard</p>
          <h1 className="mt-2 text-4xl font-bold text-white">Meus grupos</h1>
          <p className="mt-3 max-w-2xl text-slate-400">Crie comunidades, jogue recomendações na arena e deixe seus amigos avaliarem sem depender do algoritmo de uma plataforma qualquer.</p>
        </div>
        <div className="flex gap-3">
          <LinkButton href="/groups/join" className="bg-white/10 hover:bg-white/15">Entrar por código</LinkButton>
          <LinkButton href="/groups/new">Novo grupo</LinkButton>
        </div>
      </div>
      <MovieCarousel movies={trendingMovies} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <a key={group.id} href={`/groups/${group.id}`} className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 hover:border-violet-400/60">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white">{group.name}</h2>
                <p className="mt-2 line-clamp-2 text-sm text-slate-400">{group.description || 'Sem descrição.'}</p>
              </div>
              <span className="rounded-full bg-violet-500/15 px-3 py-1 text-xs text-violet-200">{group.role}</span>
            </div>
            <div className="mt-6 flex justify-between text-sm text-slate-400">
              <span>{group.memberCount} membros</span>
              <span>{group.inviteCode}</span>
            </div>
          </a>
        ))}
      </div>
      {groups.length === 0 && <div className="rounded-3xl border border-dashed border-white/15 p-10 text-center text-slate-400">Crie ou entre em um grupo. Filmes não vão se recomendar sozinhos. Ainda.</div>}
    </AppShell>
  )
}

