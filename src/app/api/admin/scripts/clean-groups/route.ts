import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import prisma from '@/lib/prisma'

export async function POST() {
  try {
    await requireAdmin()

    // Contar antes de deletar
    const countBefore = await prisma.streamingGroup.count()
    const countUsersInGroups = await prisma.streamingGroupUser.count()
    const countGroupStreamings = await prisma.streamingGroupStreaming.count()

    // Deletar em ordem para evitar problemas de foreign key
    // 1. Primeiro deletar as relações de streaming dos grupos
    const deletedGroupStreamings = await prisma.streamingGroupStreaming.deleteMany({})
    
    // 2. Depois deletar os usuários dos grupos
    const deletedGroupUsers = await prisma.streamingGroupUser.deleteMany({})
    
    // 3. Por último, deletar os grupos
    const deletedGroups = await prisma.streamingGroup.deleteMany({})

    return NextResponse.json({
      success: true,
      message: `${countBefore} grupos foram removidos do banco de dados, incluindo ${countUsersInGroups} membros e ${countGroupStreamings} streamings associados.`,
      data: {
        deletedGroups: deletedGroups.count,
        deletedGroupUsers: deletedGroupUsers.count,
        deletedGroupStreamings: deletedGroupStreamings.count,
        previousGroupCount: countBefore,
        previousUserCount: countUsersInGroups,
        previousStreamingCount: countGroupStreamings
      }
    })
  } catch (error) {
    console.error('Error cleaning groups:', error)
    return NextResponse.json({
      success: false,
      message: 'Erro ao limpar grupos: ' + (error as Error).message
    })
  }
}
