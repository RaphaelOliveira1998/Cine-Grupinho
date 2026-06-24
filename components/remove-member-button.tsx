'use client'

import { removeMemberAction } from '@/lib/actions'

export function RemoveMemberButton({ groupId, memberId, memberName }: { groupId: string; memberId: string; memberName: string }) {
  function handleSubmit(e: React.FormEvent) {
    if (!confirm(`Remover ${memberName} do grupo?`)) {
      e.preventDefault()
    }
  }

  return (
    <form action={removeMemberAction} onSubmit={handleSubmit} className="inline">
      <input type="hidden" name="groupId" value={groupId} />
      <input type="hidden" name="memberId" value={memberId} />
      <button type="submit" className="text-xs text-red-400 hover:text-red-300">Remover</button>
    </form>
  )
}
