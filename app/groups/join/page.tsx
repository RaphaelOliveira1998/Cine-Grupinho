import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { AppShell } from '@/components/shell'
import { joinGroupAction } from '@/lib/actions'

export const dynamic = 'force-dynamic'

export default async function JoinGroupPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams
  return (
    <AppShell>
      <div className="mx-auto max-w-xl space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-white">Entrar em grupo</h1>
          <p className="mt-2 text-slate-400">Use o código curto enviado por um amigo. Grupos privados podem exigir PIN.</p>
        </div>
        <form action={joinGroupAction} className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <Input name="inviteCode" placeholder="Código de convite" required />
          <Input name="accessPin" placeholder="PIN, se o grupo for privado" maxLength={12} />
          {params.error === 'invalid' && <p className="text-sm text-red-300">Código inválido.</p>}
          {params.error === 'pin' && <p className="text-sm text-red-300">PIN inválido para este grupo privado.</p>}
          <Button>Entrar</Button>
        </form>
      </div>
    </AppShell>
  )
}
