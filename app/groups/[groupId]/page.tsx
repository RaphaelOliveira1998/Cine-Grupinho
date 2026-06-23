import Image from 'next/image'
import { notFound } from 'next/navigation'
import { LinkButton } from '@/components/button'
import { MovieSearch } from '@/components/movie-search'
import { AppShell } from '@/components/shell'
import { WeekCountdown } from '@/components/week-countdown'
import { requireCompletedProfile } from '@/lib/auth'
import { getCurrentCycleWithMovie, getGroupCycleHistory, getGroupForMember, getGroupMembers } from '@/lib/data'
import { posterUrl } from '@/lib/utils'
import { weekEnd } from '@/lib/week'

export const dynamic = 'force-dynamic'

const dateRange = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', timeZone: 'America/Sao_Paulo' })
const deadlineFormat = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', timeZone: 'America/Sao_Paulo' })

export default async function GroupPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params
  const { user } = await requireCompletedProfile()
  const group = await getGroupForMember(groupId, user.id)
  if (!group) notFound()
  const [cycle, history, members] = await Promise.all([
    getCurrentCycleWithMovie(group.id, user.id),
    getGroupCycleHistory(group.id),
    getGroupMembers(group.id)
  ])

  const weekStart = cycle ? new Date(cycle.weekStart) : null
  const weekFinish = weekStart ? weekEnd(weekStart) : null

  return (
    <AppShell>
      <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-violet-300">Grupo · {group.isPublic ? 'Público' : 'Privado'}</p>
          <h1 className="mt-2 text-4xl font-bold text-white">{group.name}</h1>
          <p className="mt-2 max-w-2xl text-slate-400">{group.description || 'Sem descrição.'}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {group.ownerId === user.id && <LinkButton href={`/groups/${group.id}/edit`} className="bg-white/10 hover:bg-white/15">Editar grupo</LinkButton>}
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300">
            Código: <span className="font-mono text-violet-200">{group.inviteCode}</span>
          </div>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-8">
          {/* Weekly cycle banner */}
          <section className="space-y-4 rounded-3xl border border-violet-500/30 bg-violet-500/[0.07] p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-violet-300">Filme da semana</p>
                {weekStart && weekFinish && (
                  <p className="mt-1 text-sm text-slate-300">
                    {dateRange.format(weekStart)} – {dateRange.format(new Date(weekFinish.getTime() - 1))}
                  </p>
                )}
              </div>
              {cycle?.chooser && (
                <div className="flex items-center gap-3 rounded-2xl bg-black/20 px-4 py-2">
                  <div className="h-9 w-9 overflow-hidden rounded-full bg-slate-900">
                    {cycle.chooser.avatarUrl ? (
                      <Image src={cycle.chooser.avatarUrl} alt={cycle.chooser.name} width={72} height={72} unoptimized className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-violet-200">{cycle.chooser.name.slice(0, 1).toUpperCase()}</div>
                    )}
                  </div>
                  <div className="text-sm">
                    <p className="text-slate-400">Sorteado</p>
                    <p className="font-medium text-white">{cycle.chooser.name}</p>
                  </div>
                </div>
              )}
            </div>

            {cycle && weekStart && weekFinish && (
              <WeekCountdown weekStart={weekStart.toISOString()} weekFinish={weekFinish.toISOString()} />
            )}

            {!cycle && <p className="text-slate-300">Este grupo ainda não tem membros suficientes para iniciar a semana.</p>}

            {cycle && !cycle.movie && cycle.isViewerChooser && <MovieSearch groupId={group.id} />}

            {cycle && !cycle.movie && !cycle.isViewerChooser && (
              <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-slate-300">
                Aguardando <span className="font-medium text-white">{cycle.chooser?.name}</span> escolher o filme da semana.
              </div>
            )}

            {cycle?.movie && (
              <div className="grid gap-5 sm:grid-cols-[140px_1fr]">
                <a href={`/groups/${group.id}/movies/${cycle.movie.recommendationId}`} className="block overflow-hidden rounded-2xl bg-slate-900">
                  <div className="relative aspect-[2/3]">
                    {posterUrl(cycle.movie.posterPath) ? (
                      <Image src={posterUrl(cycle.movie.posterPath)!} alt={cycle.movie.title} fill sizes="140px" className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-500">Sem poster</div>
                    )}
                  </div>
                </a>
                <div className="space-y-3">
                  <div>
                    <a href={`/groups/${group.id}/movies/${cycle.movie.recommendationId}`} className="text-2xl font-bold text-white hover:text-violet-200">{cycle.movie.title}</a>
                    <p className="mt-1 text-sm text-slate-400">{cycle.movie.releaseDate || 'Sem data'}</p>
                  </div>
                  <p className="line-clamp-3 text-sm text-slate-300">{cycle.movie.overview || 'Sem sinopse.'}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <span className="text-amber-300">★ {Number(cycle.movie.averageRating || 0).toFixed(1)}</span>
                    <span className="text-slate-400">{Number(cycle.movie.ratingCount)} avaliações</span>
                    {weekFinish && <span className="text-slate-400">Avalie até {deadlineFormat.format(new Date(weekFinish.getTime() - 1))}</span>}
                  </div>
                  <LinkButton href={`/groups/${group.id}/movies/${cycle.movie.recommendationId}`}>
                    {cycle.movie.myRating ? 'Ver / editar avaliação' : 'Avaliar e comentar'}
                  </LinkButton>
                </div>
              </div>
            )}
          </section>

          {/* History */}
          <section className="space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Semanas anteriores</h2>
                <p className="text-sm text-slate-400">Filmes já escolhidos pelo grupo.</p>
              </div>
              <LinkButton href="/dashboard" className="bg-white/10 hover:bg-white/15">Voltar</LinkButton>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {history.map((item) => {
                const itemStart = new Date(item.weekStart)
                const itemEnd = weekEnd(itemStart)
                return (
                  <a
                    key={item.cycleId}
                    href={`/groups/${group.id}/movies/${item.recommendationId}`}
                    className="group flex gap-3 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-3 hover:border-violet-400/60 hover:bg-white/[0.07]"
                  >
                    <div className="h-24 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-900">
                      {posterUrl(item.posterPath) ? (
                        <Image src={posterUrl(item.posterPath)!} alt={item.title} width={128} height={192} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-center text-[10px] text-slate-500">Sem poster</div>
                      )}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-violet-300/80">
                          {dateRange.format(itemStart)} – {dateRange.format(new Date(itemEnd.getTime() - 1))}
                        </p>
                        <p className="line-clamp-1 font-semibold text-white group-hover:text-violet-200">{item.title}</p>
                        <p className="line-clamp-1 text-xs text-slate-400">Por {item.chooserName}</p>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-amber-300">★ {item.averageRating ? Number(item.averageRating).toFixed(1) : '—'}</span>
                        <span className="text-xs text-slate-500">{Number(item.ratingCount)} avaliações</span>
                      </div>
                    </div>
                  </a>
                )
              })}
            </div>
            {history.length === 0 && <div className="rounded-3xl border border-dashed border-white/15 p-10 text-center text-slate-400">Nenhuma semana concluída ainda.</div>}
          </section>
        </div>
        <div className="space-y-6">
          <aside className="h-fit space-y-3 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <h2 className="text-xl font-bold text-white">Membros</h2>
            {members.map((member) => (
              <a key={member.id} href={member.username ? `/profile/${member.username}` : '#'} className="flex items-center gap-3 rounded-2xl bg-black/20 p-3 hover:bg-white/10">
                <div className="h-10 w-10 overflow-hidden rounded-xl bg-slate-900">
                  {member.avatarUrl ? <Image src={member.avatarUrl} alt={member.name} width={80} height={80} unoptimized className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-violet-200">{member.name.slice(0, 1).toUpperCase()}</div>}
                </div>
                <div className="min-w-0">
                  <p className="line-clamp-1 text-sm font-medium text-white">{member.name}</p>
                  <p className="text-xs text-slate-400">{member.username ? `@${member.username}` : 'sem username'} · {member.role}</p>
                </div>
              </a>
            ))}
          </aside>
        </div>
      </div>
    </AppShell>
  )
}
