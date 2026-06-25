import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED_PATHS = ['/dashboard', '/recruiter', '/candidate', '/profile', '/messages', '/jobs/apply']
const AUTH_PATHS = ['/login', '/register']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check for the presence of the session indicator cookie
  // (The actual httpOnly refresh token is set on /v1/auth/refresh path,
  // so we use a non-httpOnly indicator cookie set at login/register)
  const isLoggedIn = request.cookies.has('logged_in')

  const isProtectedPath = PROTECTED_PATHS.some((path) => pathname.startsWith(path))
  const isAuthPath = AUTH_PATHS.some((path) => pathname.startsWith(path))

  if (isProtectedPath && !isLoggedIn) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('from', pathname)
    return NextResponse.redirect(url)
  }

  // If user explicitly visits /login or /register, allow them to sign in as a different user
  // without redirecting them to the dashboard automatically.
  // if (isAuthPath && isLoggedIn) {
  //   return NextResponse.redirect(new URL('/dashboard', request.url))
  // }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
