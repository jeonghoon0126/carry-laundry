export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import OrderHistory from '@/components/mypage/OrderHistory'
import AddressManager from '@/components/mypage/AddressManager'
import { Metadata } from 'next'
import { ArrowLeft, Home, Package, MapPin } from 'lucide-react'
import Link from 'next/link'
import MyPageClient from '@/components/mypage/MyPageClient'

export const metadata: Metadata = {
  title: '마이페이지 - carry',
  description: '내 주문 내역을 확인하세요'
}

export default async function MyPage() {
  const session = await getServerSession(authOptions)
  
  // Redirect to sign-in if not authenticated
  if (!session?.user?.id) {
    redirect('/signin?from=mypage')
  }

  return <MyPageClient user={session.user} />
}



