import { NextResponse } from 'next/server'
import { requireAdmin, getAdminEmails, addAdminEmail, isAdminEmail } from '@/lib/admin'
import prisma from '@/lib/prisma'

export async function POST() {
  try {
    await requireAdmin()
    
    // Buscar um usuário não-admin aleatório
    const nonAdminUsers = await prisma.user.findMany({
      where: {
        email: {
          notIn: getAdminEmails()
        }
      },
      select: {
        email: true,
        name: true
      },
      take: 10
    })
    
    if (nonAdminUsers.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Nenhum usuário não-admin encontrado para promover'
      })
    }
    
    // Selecionar um usuário aleatório
    const randomUser = nonAdminUsers[Math.floor(Math.random() * nonAdminUsers.length)]
    
    // Verificar se já é admin (dupla verificação)
    if (isAdminEmail(randomUser.email)) {
      return NextResponse.json({
        success: false,
        message: `Usuário ${randomUser.email} já é administrador`
      })
    }
    
    // Adicionar como admin
    addAdminEmail(randomUser.email)
    
    return NextResponse.json({
      success: true,
      message: `✅ Usuário ${randomUser.name || randomUser.email} (${randomUser.email}) foi promovido a administrador com sucesso!`,
      data: {
        email: randomUser.email,
        name: randomUser.name,
        totalAdmins: getAdminEmails().length
      }
    })
    
  } catch (error) {
    console.error('Error managing admin access:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro interno do servidor'
      },
      { status: 500 }
    )
  }
}
