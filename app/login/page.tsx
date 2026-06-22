import { AuthForm } from '@/components/auth-form'

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#4c1d95,transparent_35%),#050816] px-4">
      <AuthForm mode="login" />
    </main>
  )
}
