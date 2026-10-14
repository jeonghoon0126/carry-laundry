import 'server-only'

// Only use a user from getServerSession(authOptions), never request input.
export function getOrderAccess(user: unknown) {
  const id = user && typeof user === 'object' && 'id' in user ? user.id : null
  const userId = typeof id === 'string' && id.trim()
    ? id
    : typeof id === 'number' && Number.isSafeInteger(id) && id > 0
      ? String(id)
      : null

  // Existing explicit Kakao account from the order status route; no new admins.
  // Names, email domains, and caller-provided roles cannot grant privileges.
  return { userId, isAdmin: userId === '4475158066' }
}
