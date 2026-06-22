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
          <p className="mt-2 text-slate-400">Crie uma comunidade pública ou privada e compartilhe o código de convite.</p>
        </div>
        <form action={createGroupAction} className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <Input name="name" placeholder="Nome do grupo" required minLength={2} />
          <Textarea name="description" placeholder="Descrição" rows={4} maxLength={240} />
          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-slate-300">
            <input type="checkbox" name="isPublic" className="h-4 w-4 accent-violet-500" />
            Público, sem PIN obrigatório para entrar
          </label>
          <Input name="accessPin" placeholder="PIN de acesso para grupo privado" minLength={4} maxLength={12} />
          <Button>Criar grupo</Button>
        </form>
      </div>
    </AppShell>
  )
}
