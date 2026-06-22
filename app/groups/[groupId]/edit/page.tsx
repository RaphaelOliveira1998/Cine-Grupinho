import { notFound } from 'next/navigation'
import { Button } from '@/components/button'
import { Input, Textarea } from '@/components/input'
import { AppShell } from '@/components/shell'
import { updateGroupAction } from '@/lib/actions'
import { requireCompletedProfile } from '@/lib/auth'
import { getGroupForMember } from '@/lib/data'

export const dynamic = 'force-dynamic'

export default async function EditGroupPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params
  const { user } = await requireCompletedProfile()
  const group = await getGroupForMember(groupId, user.id)
  if (!group || group.ownerId !== user.id) notFound()
  return (
    <AppShell>
      <div className="mx-auto max-w-xl space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-violet-300">Configurações</p>
          <h1 className="mt-2 text-4xl font-bold text-white">Editar grupo</h1>
          <p className="mt-2 text-slate-400">Mude nome, visibilidade, PIN e código de convite.</p>
        </div>
        <form action={updateGroupAction} className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <input type="hidden" name="groupId" value={group.id} />
          <Input name="name" defaultValue={group.name} placeholder="Nome do grupo" required minLength={2} />
          <Textarea name="description" defaultValue={group.description || ''} placeholder="Descrição" rows={4} maxLength={240} />
          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-slate-300">
            <input type="checkbox" name="isPublic" defaultChecked={group.isPublic} className="h-4 w-4 accent-violet-500" />
            Público, sem PIN obrigatório para entrar
          </label>
          <Input name="accessPin" defaultValue={group.accessPin || ''} placeholder="Novo PIN de acesso" minLength={4} maxLength={12} />
          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-slate-300">
            <input type="checkbox" name="rotateInviteCode" className="h-4 w-4 accent-violet-500" />
            Gerar novo código de convite
          </label>
          <div className="rounded-2xl bg-black/20 p-4 text-sm text-slate-400">Código atual: <span className="font-mono text-violet-200">{group.inviteCode}</span></div>
          <Button>Salvar alterações</Button>
        </form>
      </div>
    </AppShell>
  )
}
