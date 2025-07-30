import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

// DELETE /api/groups/[id]/members/[userId] - Remover membro do grupo (apenas OWNER e ADMIN)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const { userId: currentUserId } = await auth();
    
    if (!currentUserId) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { id: groupId, userId: targetUserId } = await params;

    // Buscar o usuário atual no banco
    const currentUser = await prisma.user.findUnique({
      where: { clerkId: currentUserId },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se o usuário atual é membro do grupo e tem permissão
    const currentUserMembership = await prisma.streamingGroupUser.findUnique({
      where: {
        streamingGroupId_userId: {
          streamingGroupId: groupId,
          userId: currentUser.id,
        },
      },
    });

    if (!currentUserMembership) {
      return NextResponse.json(
        { error: "Você não é membro deste grupo" },
        { status: 403 }
      );
    }

    // Apenas OWNER e ADMIN podem remover membros
    if (currentUserMembership.role !== 'OWNER' && currentUserMembership.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "Apenas proprietários e administradores podem remover membros" },
        { status: 403 }
      );
    }

    // Verificar se o membro a ser removido existe no grupo
    const targetMember = await prisma.streamingGroupUser.findUnique({
      where: {
        streamingGroupId_userId: {
          streamingGroupId: groupId,
          userId: targetUserId,
        },
      },
      include: {
        user: true,
      },
    });

    if (!targetMember) {
      return NextResponse.json(
        { error: "Membro não encontrado neste grupo" },
        { status: 404 }
      );
    }

    // OWNER não pode ser removido
    if (targetMember.role === 'OWNER') {
      return NextResponse.json(
        { error: "O proprietário do grupo não pode ser removido" },
        { status: 403 }
      );
    }

    // ADMIN só pode ser removido por OWNER
    if (targetMember.role === 'ADMIN' && currentUserMembership.role !== 'OWNER') {
      return NextResponse.json(
        { error: "Apenas o proprietário pode remover administradores" },
        { status: 403 }
      );
    }

    // Usuário não pode remover a si mesmo (use a API de leave para isso)
    if (targetUserId === currentUser.id) {
      return NextResponse.json(
        { error: "Use a função de sair do grupo para se remover" },
        { status: 400 }
      );
    }

    // Remover membro do grupo
    await prisma.streamingGroupUser.delete({
      where: {
        streamingGroupId_userId: {
          streamingGroupId: groupId,
          userId: targetUserId,
        },
      },
    });

    // Limpar qualquer solicitação de entrada pendente do usuário para este grupo
    await prisma.groupJoinRequest.deleteMany({
      where: {
        streamingGroupId: groupId,
        userId: targetUserId,
      },
    });

    return NextResponse.json({ 
      message: "Membro removido com sucesso",
      removedMember: {
        id: targetMember.user.id,
        name: targetMember.user.name,
        email: targetMember.user.email,
      }
    });
  } catch (error) {
    console.error("Erro ao remover membro do grupo:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
