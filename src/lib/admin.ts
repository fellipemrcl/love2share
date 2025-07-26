import { currentUser } from '@clerk/nextjs/server'

const ADMIN_EMAIL = 'fellipemarcelmaiasilva@gmail.com'

export async function isAdmin(): Promise<boolean> {
  try {
    const user = await currentUser()
    if (!user) return false
    
    const primaryEmail = user.primaryEmailAddress?.emailAddress
    return primaryEmail === ADMIN_EMAIL
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}

export async function requireAdmin() {
  const adminStatus = await isAdmin()
  if (!adminStatus) {
    throw new Error('Access denied. Admin privileges required.')
  }
  return adminStatus
}
