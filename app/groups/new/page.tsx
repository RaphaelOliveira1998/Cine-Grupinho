import { Button } from '@/components/button'
import { Input, Textarea } from '@/components/input'
import { AppShell } from '@/components/shell'
import { createGroupAction } from '@/lib/actions'

export const dynamic = 'force-dynamic'

export default function NewGroupPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-xl space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-white">Novo grupo</h1>
          <p className="mt-2 text-slate-400">Crie uma comunidade privada e compartilhe o código de convite.</p>
        </div>
        <form action={createGroupAction} className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <Input name="name" placeholder="Nome do grupo" required minLength={2} />
          <Textarea name="description" placeholder="Descrição" rows={4} maxLength={240} />
          <Button>Criar grupo</Button>
        </form>
      </div>
    </AppShell>
  )
}

