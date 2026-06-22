import Image from 'next/image'
import Link from 'next/link'
import { Star } from 'lucide-react'
import { posterUrl } from '@/lib/utils'

type MovieCardProps = {
  href: string
  title: string
  posterPath: string | null
  overview: string | null
  recommendedBy: string
  recommendedByHref?: string
  averageRating: string | number | null
  ratingCount: number
}

export function MovieCard({ href, title, posterPath, overview, recommendedBy, recommendedByHref, averageRating, ratingCount }: MovieCardProps) {
  const poster = posterUrl(posterPath)
  const average = averageRating ? Number(averageRating).toFixed(1) : '—'
  return (
    <div className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20 hover:border-violet-400/60">
      <Link href={href}>
        <div className="aspect-[2/3] bg-slate-900">
          {poster ? <Image src={poster} alt={title} width={500} height={750} loading="eager" className="h-full w-full object-cover group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-slate-500">Sem poster</div>}
        </div>
      </Link>
      <div className="space-y-3 p-4">
        <div>
          <Link href={href} className="line-clamp-1 font-semibold text-white hover:text-violet-200">{title}</Link>
          {recommendedByHref ? <Link href={recommendedByHref} className="text-xs text-slate-400 hover:text-violet-200">Por {recommendedBy}</Link> : <p className="text-xs text-slate-400">Por {recommendedBy}</p>}
        </div>
        <p className="line-clamp-3 min-h-12 text-sm text-slate-400">{overview || 'Sem sinopse.'}</p>
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1 text-amber-300"><Star size={16} fill="currentColor" /> {average}</span>
          <span className="text-slate-500">{ratingCount} avaliações</span>
        </div>
      </div>
    </div>
  )
}
