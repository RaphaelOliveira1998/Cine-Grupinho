'use client'

import { leaveGroupAction } from '@/lib/actions'
import { Button } from '@/components/button'

export function LeaveGroupButton({ groupId, groupName }: { groupId: string; groupName: string }) {
  function handleSubmit(e: React.FormEvent) {
    if (!confirm(`Tem certeza que deseja sair de "${groupName}"?`)) {
      e.preventDefault()
    }
  }

  return (
    <form action={leaveGroupAction} onSubmit={handleSubmit}>
      <input type="hidden" name="groupId" value={groupId} />
      <Button className="bg-white/10 hover:bg-white/15 border border-white/10">Sair do grupo</Button>
    </form>
  )
}
