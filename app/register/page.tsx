import { AuthForm } from '@/components/auth-form'

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[radial-gradient(circle_at_top,#4c1d95,transparent_35%),#050816] px-4 gap-4">
      <AuthForm mode="register" />
      <p className="text-xs text-slate-600">By Stacio Technologies · v1.0.0</p>
    </main>
  )
}
