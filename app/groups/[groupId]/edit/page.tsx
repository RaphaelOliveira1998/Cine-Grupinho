import { notFound } from 'next/navigation'
import { SubmitButton } from '@/components/button'
import { Input, Textarea } from '@/components/input'
import { AppShell } from '@/components/shell'
import { updateGroupAction } from '@/lib/actions'
import { DeleteGroupButton } from '@/components/delete-group-button'
import { TransferOwnership } from '@/components/transfer-ownership'
import { requireCompletedProfile } from '@/lib/auth'
import { getGroupForMember, getGroupMembers } from '@/lib/data'

export const dynamic = 'force-dynamic'

export default async function EditGroupPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params
  const { user } = await requireCompletedProfile()
  const [group, allMembers] = await Promise.all([
    getGroupForMember(groupId, user.id),
    getGroupMembers(groupId)
  ])
  if (!group || group.ownerId !== user.id) notFound()
  const otherMembers = allMembers.filter((m) => m.id !== user.id)
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
          <SubmitButton pendingLabel="Salvando...">Salvar alterações</SubmitButton>
        </form>

        <div className="rounded-3xl border border-red-500/20 bg-red-500/[0.04] p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-red-300">Zona de perigo</h2>
            <p className="mt-1 text-sm text-slate-400">Excluir o grupo remove todos os membros, ciclos e histórico permanentemente.</p>
          </div>
          {otherMembers.length > 0 && (
            <div className="space-y-2 border-b border-white/10 pb-4">
              <p className="text-sm font-medium text-amber-300">Transferir administração</p>
              <p className="text-xs text-slate-400">Você deixará de ser admin e o membro selecionado assumirá o controle.</p>
              <TransferOwnership groupId={group.id} members={otherMembers} />
            </div>
          )}
          <DeleteGroupButton groupId={group.id} groupName={group.name} />
        </div>
      </div>
    </AppShell>
  )
}
