import { currentUser } from '@clerk/nextjs/server'

const ADMIN_EMAILS = [
  'fellipemarcelmaiasilva@gmail.com',
  'test@admin.com'
]

export async function isAdmin(): Promise<boolean> {
  try {
    const user = await currentUser()
    if (!user) return false
    
    const primaryEmail = user.primaryEmailAddress?.emailAddress
    return primaryEmail ? ADMIN_EMAILS.includes(primaryEmail) : false
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

export function getAdminEmails(): string[] {
  return ADMIN_EMAILS
}

export function addAdminEmail(email: string): void {
  if (!ADMIN_EMAILS.includes(email)) {
    ADMIN_EMAILS.push(email)
  }
}

export function removeAdminEmail(email: string): void {
  const index = ADMIN_EMAILS.indexOf(email)
  if (index > -1) {
    ADMIN_EMAILS.splice(index, 1)
  }
}

export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email)
}
