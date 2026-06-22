import { notFound } from 'next/navigation'
import { LinkButton } from '@/components/button'
import { MovieCard } from '@/components/movie-card'
import { MovieSearch } from '@/components/movie-search'
import { AppShell } from '@/components/shell'
import { requireUser } from '@/lib/auth'
import { getGroupForMember, getGroupRecommendations } from '@/lib/data'

export const dynamic = 'force-dynamic'

export default async function GroupPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params
  const user = await requireUser()
  const group = await getGroupForMember(groupId, user.id)
  if (!group) notFound()
  const recommendations = await getGroupRecommendations(group.id)
  const ranking = [...recommendations]
    .filter((movie) => Number(movie.ratingCount) > 0)
    .sort((a, b) => Number(b.averageRating || 0) - Number(a.averageRating || 0))
    .slice(0, 5)

  return (
    <AppShell>
      <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-violet-300">Grupo</p>
          <h1 className="mt-2 text-4xl font-bold text-white">{group.name}</h1>
          <p className="mt-2 max-w-2xl text-slate-400">{group.description || 'Sem descrição.'}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300">
          Código: <span className="font-mono text-violet-200">{group.inviteCode}</span>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-8">
          <MovieSearch groupId={group.id} />
          <section className="space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Recomendações</h2>
                <p className="text-sm text-slate-400">Filmes indicados pelos membros.</p>
              </div>
              <LinkButton href="/dashboard" className="bg-white/10 hover:bg-white/15">Voltar</LinkButton>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {recommendations.map((movie) => (
                <MovieCard
                  key={movie.id}
                  href={`/groups/${group.id}/movies/${movie.id}`}
                  title={movie.title}
                  posterPath={movie.posterPath}
                  overview={movie.overview}
                  recommendedBy={movie.recommendedByName}
                  averageRating={movie.averageRating}
                  ratingCount={Number(movie.ratingCount)}
                />
              ))}
            </div>
            {recommendations.length === 0 && <div className="rounded-3xl border border-dashed border-white/15 p-10 text-center text-slate-400">Nenhum filme recomendado ainda.</div>}
          </section>
        </div>
        <aside className="h-fit space-y-3 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
          <h2 className="text-xl font-bold text-white">Ranking</h2>
          {ranking.map((movie, index) => (
            <a key={movie.id} href={`/groups/${group.id}/movies/${movie.id}`} className="flex items-center justify-between rounded-2xl bg-black/20 p-3 hover:bg-white/10">
              <div className="min-w-0">
                <p className="text-sm text-violet-300">#{index + 1}</p>
                <p className="line-clamp-1 font-medium text-white">{movie.title}</p>
              </div>
              <span className="text-sm text-amber-300">{Number(movie.averageRating).toFixed(1)}</span>
            </a>
          ))}
          {ranking.length === 0 && <p className="text-sm text-slate-400">Avaliações insuficientes para dominar o ranking.</p>}
        </aside>
      </div>
    </AppShell>
  )
}

