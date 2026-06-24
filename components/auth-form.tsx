'use client'

import Link from 'next/link'
import Image from 'next/image'
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
  const [emailSent, setEmailSent] = useState(false)
  const [forgotPassword, setForgotPassword] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)
    const form = new FormData(event.currentTarget)
    const email = String(form.get('email'))

    if (forgotPassword) {
      const supabase = createClient()
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`
      })
      setLoading(false)
      if (resetError) { setError(resetError.message); return }
      setResetSent(true)
      return
    }

    const password = String(form.get('password'))
    const name = String(form.get('name') || '')

    if (mode === 'register') {
      const confirmPassword = String(form.get('confirmPassword') || '')
      if (password !== confirmPassword) {
        setError('As senhas não coincidem.')
        setLoading(false)
        return
      }
    }

    const supabase = createClient()
    const result = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { data: { name } } })
    setLoading(false)
    if (result.error) {
      setError(result.error.message)
      return
    }
    if (mode === 'register') {
      setEmailSent(true)
      return
    }
    router.replace('/dashboard')
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-md space-y-4 rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30">
      <div className="flex flex-col items-center space-y-2 text-center">
        <Image src="/logo.png" alt="Beckflix" width={80} height={80} className="h-20 w-20 rounded-2xl object-cover" priority />
        <p className="text-sm uppercase tracking-[0.3em] text-violet-300">Beckflix</p>
        <h1 className="text-3xl font-bold text-white">{mode === 'login' ? 'Entrar' : 'Criar conta'}</h1>
        <p className="text-sm text-slate-400">Seu círculo privado de filmes, sem algoritmo idiota no caminho.</p>
      </div>
      {emailSent ? (
        <div className="rounded-xl border border-violet-500/30 bg-violet-500/10 p-4 text-center text-sm text-violet-200">
          <p className="font-semibold text-base mb-1">Conta criada!</p>
          <p>Enviamos um email de verificação para a sua caixa de entrada. Verifique sua conta antes de fazer login.</p>
        </div>
      ) : resetSent ? (
        <div className="rounded-xl border border-violet-500/30 bg-violet-500/10 p-4 text-center text-sm text-violet-200">
          <p className="font-semibold text-base mb-1">Email enviado!</p>
          <p>Verifique sua caixa de entrada e clique no link para redefinir sua senha.</p>
          <button type="button" onClick={() => { setResetSent(false); setForgotPassword(false) }} className="mt-3 text-violet-300 hover:text-violet-200 underline text-xs">Voltar ao login</button>
        </div>
      ) : forgotPassword ? (
        <>
          <p className="text-center text-sm text-slate-400">Insira seu email e enviaremos um link para redefinir sua senha.</p>
          <Input name="email" type="email" placeholder="Email" required />
          {error && <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
          <Button disabled={loading} className="w-full">{loading ? 'Enviando...' : 'Enviar link'}</Button>
          <p className="text-center text-sm text-slate-400">
            <button type="button" onClick={() => { setForgotPassword(false); setError('') }} className="text-violet-300 hover:text-violet-200">Voltar ao login</button>
          </p>
        </>
      ) : (
        <>
          {mode === 'register' && <Input name="name" placeholder="Nome" required minLength={2} />}
          <Input name="email" type="email" placeholder="Email" required />
          <Input name="password" type="password" placeholder="Senha" required minLength={6} />
          {mode === 'register' && <Input name="confirmPassword" type="password" placeholder="Confirmar senha" required minLength={6} />}
          {error && <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
          <Button disabled={loading} className="w-full">{loading ? 'Processando...' : mode === 'login' ? 'Entrar' : 'Cadastrar'}</Button>
          {mode === 'login' && (
            <p className="text-center text-sm text-slate-400">
              <button type="button" onClick={() => { setForgotPassword(true); setError('') }} className="text-violet-300 hover:text-violet-200">Esqueci a senha</button>
            </p>
          )}
          <p className="text-center text-sm text-slate-400">
            {mode === 'login' ? 'Sem conta?' : 'Já tem conta?'} <Link href={mode === 'login' ? '/register' : '/login'} className="text-violet-300 hover:text-violet-200">{mode === 'login' ? 'Cadastre-se' : 'Entrar'}</Link>
          </p>
        </>
      )}
    </form>
  )
}
