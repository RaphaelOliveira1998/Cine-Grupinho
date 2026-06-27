import { ProfileMoviePicker } from '@/components/profile-movie-picker'
import { AppShell } from '@/components/shell'
import { requireUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { profiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export default async function ProfileSetupPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const user = await requireUser()
  const [profile, params] = await Promise.all([
    db.query.profiles.findFirst({ where: eq(profiles.id, user.id) }),
    searchParams
  ])
  const errorMessage = params.error ? decodeURIComponent(params.error) : null
  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-violet-300">Perfil</p>
          <h1 className="mt-2 text-4xl font-bold text-white">Configure seu perfil</h1>
          <p className="mt-2 max-w-2xl text-slate-400">Antes de entrar no dashboard, defina username e foto. Filmes favoritos são opcionais.</p>
        </div>
        {errorMessage && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {errorMessage}
          </div>
        )}
        <ProfileMoviePicker name={profile?.name || user.email?.split('@')[0] || ''} username={profile?.username || ''} avatarUrl={profile?.avatarUrl || ''} />
      </div>
    </AppShell>
  )
}
