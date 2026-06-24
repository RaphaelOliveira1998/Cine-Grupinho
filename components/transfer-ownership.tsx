'use client'

import { useState } from 'react'
import { transferOwnershipAction } from '@/lib/actions'
import { Button } from '@/components/button'

type Member = { id: string; name: string; username: string | null }

export function TransferOwnership({ groupId, members }: { groupId: string; members: Member[] }) {
  const [selected, setSelected] = useState('')

  function handleSubmit(e: React.FormEvent) {
    const member = members.find((m) => m.id === selected)
    if (!member) { e.preventDefault(); return }
    if (!confirm(`Transferir administração do grupo para ${member.name}? Você se tornará um membro comum.`)) {
      e.preventDefault()
    }
  }

  return (
    <form action={transferOwnershipAction} onSubmit={handleSubmit} className="space-y-3">
      <input type="hidden" name="groupId" value={groupId} />
      <select
        name="newOwnerId"
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        required
        className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white focus:border-violet-500 focus:outline-none"
      >
        <option value="">Selecionar membro...</option>
        {members.map((m) => (
          <option key={m.id} value={m.id}>{m.name}{m.username ? ` (@${m.username})` : ''}</option>
        ))}
      </select>
      <Button type="submit" disabled={!selected} className="bg-amber-600/80 hover:bg-amber-600 border border-amber-500/30">
        Transferir administração
      </Button>
    </form>
  )
}
