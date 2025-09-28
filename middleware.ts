import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Only protect /admin route
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return new NextResponse('Authentication required', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Admin Access"',
        },
      })
    }

    // Decode base64 credentials
    const base64Credentials = authHeader.split(' ')[1]
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii')
    const [username, password] = credentials.split(':')

    // Get credentials from environment variables
    const adminUser = process.env.ADMIN_USER
    const adminPass = process.env.ADMIN_PASS

    // Check if credentials are configured
    if (!adminUser || !adminPass) {
      return new NextResponse('Admin credentials not configured', {
        status: 500,
      })
    }

    // Validate credentials
    if (username !== adminUser || password !== adminPass) {
      return new NextResponse('Invalid credentials', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Admin Access"',
        },
      })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*'
}
