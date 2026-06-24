'use client'

import { useRef } from 'react'
import { deleteGroupAction } from '@/lib/actions'
import { Button } from '@/components/button'

export function DeleteGroupButton({ groupId, groupName }: { groupId: string; groupName: string }) {
  const formRef = useRef<HTMLFormElement>(null)

  function handleSubmit(e: React.FormEvent) {
    if (!confirm(`Tem certeza que deseja excluir "${groupName}"? Esta ação não pode ser desfeita.`)) {
      e.preventDefault()
    }
  }

  return (
    <form ref={formRef} action={deleteGroupAction} onSubmit={handleSubmit}>
      <input type="hidden" name="groupId" value={groupId} />
      <Button className="bg-red-600/80 hover:bg-red-600 border-red-500/30">Excluir grupo</Button>
    </form>
  )
}
