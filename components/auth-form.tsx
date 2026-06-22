'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/button'
import { Input } from '@/components/input'
import { createClient } from '@/lib/supabase/browser'

type AuthFormProps = {
  mode: 'login' | 'register'
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)
    const form = new FormData(event.currentTarget)
    const email = String(form.get('email'))
    const password = String(form.get('password'))
    const name = String(form.get('name') || '')
    const supabase = createClient()
    const result = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { data: { name } } })
    setLoading(false)
    if (result.error) {
      setError(result.error.message)
      return
    }
    router.replace('/dashboard')
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-md space-y-4 rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.3em] text-violet-300">Cine Grupinho</p>
        <h1 className="text-3xl font-bold text-white">{mode === 'login' ? 'Entrar' : 'Criar conta'}</h1>
        <p className="text-sm text-slate-400">Seu círculo privado de filmes, sem algoritmo idiota no caminho.</p>
      </div>
      {mode === 'register' && <Input name="name" placeholder="Nome" required minLength={2} />}
      <Input name="email" type="email" placeholder="Email" required />
      <Input name="password" type="password" placeholder="Senha" required minLength={6} />
      {error && <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
      <Button disabled={loading} className="w-full">{loading ? 'Processando...' : mode === 'login' ? 'Entrar' : 'Cadastrar'}</Button>
      <p className="text-center text-sm text-slate-400">
        {mode === 'login' ? 'Sem conta?' : 'Já tem conta?'} <Link href={mode === 'login' ? '/register' : '/login'} className="text-violet-300 hover:text-violet-200">{mode === 'login' ? 'Cadastre-se' : 'Entrar'}</Link>
      </p>
    </form>
  )
}
