import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, getAdminEmails, addAdminEmail, removeAdminEmail, isAdminEmail } from '@/lib/admin'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    await requireAdmin()
    
    const adminEmails = getAdminEmails()
    
    return NextResponse.json({
      success: true,
      admins: adminEmails
    })
  } catch (error) {
    console.error('Error fetching admin list:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch admin list' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    
    const body = await request.json()
    const { action, email } = body
    
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }
    
    // Verificar se o usuário existe no banco de dados
    const user = await prisma.user.findFirst({
      where: {
        email: email
      }
    })
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuário não encontrado no sistema' },
        { status: 404 }
      )
    }
    
    switch (action) {
      case 'add':
        if (isAdminEmail(email)) {
          return NextResponse.json(
            { success: false, error: 'Usuário já é administrador' },
            { status: 400 }
          )
        }
        
        addAdminEmail(email)
        
        return NextResponse.json({
          success: true,
          message: `Usuário ${email} foi promovido a administrador`,
          admins: getAdminEmails()
        })
        
      case 'remove':
        if (!isAdminEmail(email)) {
          return NextResponse.json(
            { success: false, error: 'Usuário não é administrador' },
            { status: 400 }
          )
        }
        
        // Não permitir remover o último admin
        const currentAdmins = getAdminEmails()
        if (currentAdmins.length <= 1) {
          return NextResponse.json(
            { success: false, error: 'Não é possível remover o último administrador' },
            { status: 400 }
          )
        }
        
        removeAdminEmail(email)
        
        return NextResponse.json({
          success: true,
          message: `Usuário ${email} foi removido dos administradores`,
          admins: getAdminEmails()
        })
        
      default:
        return NextResponse.json(
          { success: false, error: 'Ação inválida. Use "add" ou "remove"' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error managing admin:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to manage admin permissions' },
      { status: 500 }
    )
  }
}
