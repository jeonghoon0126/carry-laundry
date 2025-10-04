import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import SignInForm from './SignInForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '로그인 - carry',
  description: '카카오로 간편하게 로그인하세요'
}

interface SignInPageProps {
  searchParams: Promise<{ from?: string; error?: string }>
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams
  const session = await getServerSession(authOptions)
  
  // If already authenticated, redirect to destination
  if (session?.user?.id) {
    const from = params.from
    let destination = '/mypage' // default
    
    // Sanitize and validate 'from' parameter
    if (from) {
      const allowedRoutes = ['mypage', 'order', 'home']
      const cleanFrom = from.startsWith('/') ? from.slice(1) : from
      if (allowedRoutes.includes(cleanFrom)) {
        destination = `/${cleanFrom}`
      }
    }
    
    redirect(destination)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-4" style={{ fontFamily: 'Pretendard, sans-serif' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          {/* Logo */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">carry</h1>
            <div className="w-12 h-1 bg-blue-600 mx-auto mt-2 rounded-full"></div>
          </div>
          
          {/* Heading */}
          <h2 className="text-3xl font-bold text-gray-900 mb-2">로그인</h2>
          <p className="text-gray-600">주문 내역을 보려면 로그인하세요</p>
        </div>

        {/* Error message */}
        {params.error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600 text-center">
              로그인에 실패했어요. 다시 시도해주세요.
            </p>
          </div>
        )}

        {/* Sign in form */}
        <SignInForm from={params.from} />
        
        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            로그인하면 carry의 서비스 약관에 동의하게 됩니다.
          </p>
        </div>
      </div>
    </main>
  )
}
