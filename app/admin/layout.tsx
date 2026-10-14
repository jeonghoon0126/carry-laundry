import type { ReactNode } from 'react'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getOrderAccess } from '@/lib/order-access'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions)
  const { userId, isAdmin } = getOrderAccess(session?.user)
  if (!userId) redirect('/signin')
  if (!isAdmin) redirect('/mypage')
  return children
}
