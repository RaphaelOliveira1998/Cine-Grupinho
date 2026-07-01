import Image from 'next/image'
import { notFound } from 'next/navigation'
import { SubmitButton } from '@/components/button'
import { Textarea } from '@/components/input'
import { AppShell } from '@/components/shell'
import { addCommentAction, rateMovieAction } from '@/lib/actions'
import { requireCompletedProfile } from '@/lib/auth'
import { getGroupForMember, getRecommendationComments, getRecommendationDetail, getRecommendationMemberRatings } from '@/lib/data'
import { COMMENT_MAX_LENGTH } from '@/lib/validators'
import { formatDate, posterUrl } from '@/lib/utils'
import { getMovieTrailer } from '@/lib/tmdb'
import { formatRatingStars } from '@/lib/ratings'

export const dynamic = 'force-dynamic'

export default async function MoviePage({ params }: { params: Promise<{ groupId: string; movieId: string }> }) {
  const { groupId, movieId } = await params
  const { user } = await requireCompletedProfile()
  const group = await getGroupForMember(groupId, user.id)
  if (!group) notFound()
  const [movie, comments, memberRatings] = await Promise.all([
    getRecommendationDetail(groupId, movieId, user.id),
    getRecommendationComments(movieId),
    getRecommendationMemberRatings(groupId, movieId),
  ])
  if (!movie) notFound()
  const trailerKey = await getMovieTrailer(movie.tmdbId).catch(() => null)
  const poster = posterUrl(movie.posterPath)
  const average = movie.averageRating ? Number(movie.averageRating).toFixed(1) : '—'

  return (
    <AppShell>
      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900">
          {poster ? <Image src={poster} alt={movie.title} width={500} height={750} className="h-full w-full object-cover" /> : <div className="flex aspect-[2/3] items-center justify-center text-slate-500">Sem poster</div>}
        </div>
        <section className="space-y-6">
          <div>
            <a href={`/groups/${group.id}`} className="text-sm text-violet-300 hover:text-violet-200">← {group.name}</a>
            <h1 className="mt-3 text-5xl font-bold text-white">{movie.title}</h1>
            <p className="mt-2 text-slate-400">{movie.originalTitle} · {movie.releaseDate || 'Sem data'} · recomendado por <a href={movie.recommendedByUsername ? `/profile/${movie.recommendedByUsername}` : '#'} className="text-violet-300 hover:text-violet-200">{movie.recommendedByName}</a></p>
          </div>
          <div className="flex flex-wrap gap-2">
            {movie.genres.map((genre) => <span key={genre} className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">{genre}</span>)}
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-sm text-slate-400">Média</p>
              <p className="mt-1 text-3xl font-bold text-amber-300">{average}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-sm text-slate-400">Avaliações</p>
              <p className="mt-1 text-3xl font-bold text-white">{Number(movie.ratingCount)}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-sm text-slate-400">Sua nota</p>
              <p className="mt-1 text-3xl font-bold text-violet-200">{movie.myRating || '—'}</p>
            </div>
          </div>
          <p className="text-lg leading-8 text-slate-300">{movie.overview || 'Sem sinopse.'}</p>
          {trailerKey && (
            <div className="overflow-hidden rounded-2xl border border-white/10 aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${trailerKey}`}
                title="Trailer"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          )}
          <form action={rateMovieAction} className="space-y-3 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <input type="hidden" name="groupId" value={group.id} />
            <input type="hidden" name="recommendationId" value={movie.id} />
            <h2 className="text-xl font-semibold text-white">Avaliar</h2>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map((star) => <SubmitButton key={star} name="stars" value={star} pendingLabel="..." className="bg-amber-500 text-black hover:bg-amber-400">{star} ★</SubmitButton>)}
            </div>
          </form>
          <section className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-white">Notas do grupo</h2>
              <span className="rounded-full bg-amber-400/10 px-3 py-1 text-sm font-medium text-amber-200">
                {Number(movie.ratingCount)} avaliações
              </span>
            </div>
            {memberRatings.length > 0 ? (
              <div className="flex flex-wrap gap-4">
                {memberRatings.map((member) => (
                  <a
                    key={member.userId}
                    href={member.username ? `/profile/${member.username}` : '#'}
                    className={member.stars
                      ? 'group relative flex h-16 w-16 items-center justify-center rounded-full border border-amber-300/40 bg-slate-800 bg-cover bg-center text-sm font-medium text-white shadow-lg shadow-amber-950/30 transition hover:scale-105 hover:border-amber-200'
                      : 'group relative flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-slate-800 bg-cover bg-center text-sm font-medium text-slate-400 opacity-60 transition hover:opacity-90'}
                    style={member.avatarUrl ? { backgroundImage: `url(${member.avatarUrl})` } : undefined}
                    title={`${member.name}: ${formatRatingStars(member.stars)}`}
                  >
                    {!member.avatarUrl && <span className="max-w-12 truncate">{member.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</span>}
                    <span className={member.stars
                      ? 'absolute -bottom-1 -right-1 rounded-full border border-black bg-amber-300 px-1.5 py-0.5 text-xs font-bold text-black shadow-lg'
                      : 'absolute -bottom-1 -right-1 rounded-full border border-black bg-slate-600 px-1.5 py-0.5 text-xs font-bold text-slate-200 shadow-lg'}>
                      {member.stars ? `${member.stars}/5` : '—'}
                    </span>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">Nenhum membro encontrado.</p>
            )}
          </section>
          <section className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <h2 className="text-xl font-semibold text-white">Comentários</h2>
            <form action={addCommentAction} className="space-y-3">
              <input type="hidden" name="groupId" value={group.id} />
              <input type="hidden" name="recommendationId" value={movie.id} />
              <Textarea name="body" placeholder="Escreva um comentário" rows={3} required maxLength={COMMENT_MAX_LENGTH} />
              <SubmitButton pendingLabel="Comentando...">Comentar</SubmitButton>
            </form>
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="rounded-2xl bg-black/20 p-4">
                  <div className="flex justify-between gap-3 text-sm">
                    <div className="min-w-0">
                      <a href={comment.authorUsername ? `/profile/${comment.authorUsername}` : '#'} className="font-medium text-white hover:text-violet-200">{comment.authorName}</a>
                      <span className={comment.authorRating ? 'ml-2 text-amber-300' : 'ml-2 text-slate-500'}>{formatRatingStars(comment.authorRating)}</span>
                    </div>
                    <span className="shrink-0 text-slate-500">{formatDate(comment.createdAt.toISOString())}</span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-slate-300">{comment.body}</p>
                </div>
              ))}
              {comments.length === 0 && <p className="text-sm text-slate-400">Ninguém comentou. Civilização ainda em silêncio.</p>}
            </div>
          </section>
        </section>
      </div>
    </AppShell>
  )
}

