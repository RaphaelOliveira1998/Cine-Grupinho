import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const privateRoutes = ['/dashboard', '/groups']
const authRoutes = ['/login', '/register']

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        }
      }
    }
  )
  const { data } = await supabase.auth.getUser().catch((err: unknown) => {
    // Silencia erros de token inválido/expirado — tratados como usuário não autenticado
    const code = (err as { code?: string })?.code
    if (code !== 'refresh_token_not_found' && code !== 'bad_refresh_token') {
      console.error('[proxy] auth error:', err)
    }
    return { data: { user: null } }
  })
  const path = request.nextUrl.pathname
  const isPrivate = privateRoutes.some((route) => path.startsWith(route))
  const isAuth = authRoutes.some((route) => path.startsWith(route))

  if (isPrivate && !data.user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isAuth && data.user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)']
}
