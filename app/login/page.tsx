import { AuthForm } from '@/components/auth-form'

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[radial-gradient(circle_at_top,#4c1d95,transparent_35%),#050816] px-4 gap-4">
      <AuthForm mode="login" />
      <p className="text-xs text-slate-600">By Stacio Technologies · v1.1.0</p>
    </main>
  )
}
