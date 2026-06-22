import Link from 'next/link'
import { Film } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export async function AppShell({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#312e81,transparent_35%),#050816]">
      <header className="border-b border-white/10 bg-black/20 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/dashboard" className="flex items-center gap-3 font-semibold tracking-tight text-white">
            <span className="rounded-2xl bg-violet-500/20 p-2 text-violet-200"><Film size={22} /></span>
            Cine Grupinho
          </Link>
          <div className="flex items-center gap-3 text-sm text-slate-300">
            <span className="hidden sm:block">{data.user?.email}</span>
            <form action="/auth/signout" method="post">
              <button className="rounded-xl border border-white/10 px-3 py-2 hover:bg-white/10">Sair</button>
            </form>
          </div>
        </div>
      </header>
      <section className="mx-auto max-w-6xl px-4 py-8">{children}</section>
    </main>
  )
}
