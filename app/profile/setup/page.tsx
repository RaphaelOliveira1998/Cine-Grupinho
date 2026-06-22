import { ProfileMoviePicker } from '@/components/profile-movie-picker'
import { AppShell } from '@/components/shell'
import { requireUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { profiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export default async function ProfileSetupPage() {
  const user = await requireUser()
  const profile = await db.query.profiles.findFirst({ where: eq(profiles.id, user.id) })
  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-violet-300">Perfil</p>
          <h1 className="mt-2 text-4xl font-bold text-white">Configure seu perfil</h1>
          <p className="mt-2 max-w-2xl text-slate-400">Antes de entrar no dashboard, defina username, foto e seus 5 filmes favoritos.</p>
        </div>
        <ProfileMoviePicker name={profile?.name || user.email?.split('@')[0] || ''} username={profile?.username || ''} avatarUrl={profile?.avatarUrl || ''} />
      </div>
    </AppShell>
  )
}
