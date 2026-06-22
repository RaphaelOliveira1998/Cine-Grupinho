import Link from 'next/link'
import { Film, User } from 'lucide-react'
import { eq } from 'drizzle-orm'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { profiles } from '@/lib/db/schema'

export async function AppShell({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  const profile = data.user ? await db.query.profiles.findFirst({ where: eq(profiles.id, data.user.id) }) : null
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#312e81,transparent_35%),#050816]">
      <header className="border-b border-white/10 bg-black/20 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/dashboard" className="flex items-center gap-3 font-semibold tracking-tight text-white">
            <span className="rounded-2xl bg-violet-500/20 p-2 text-violet-200"><Film size={22} /></span>
            Cine Grupinho
          </Link>
          <div className="flex items-center gap-3 text-sm text-slate-300">
            {profile?.username && <Link href={`/profile/${profile.username}`} className="hidden items-center gap-2 rounded-xl border border-white/10 px-3 py-2 hover:bg-white/10 sm:flex"><User size={16} /> @{profile.username}</Link>}
            <span className="hidden md:block">{data.user?.email}</span>
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
