import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; requestId: string }> }
) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: groupId, requestId } = await params;
    const body = await request.json();
    const { action, responseMessage } = body; // action: 'approve' | 'reject'

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: "Ação inválida. Use 'approve' ou 'reject'" },
        { status: 400 }
      );
    }

    // Verificar se o usuário existe no banco
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Verificar se o usuário é admin/owner do grupo
    const membership = await prisma.streamingGroupUser.findUnique({
      where: {
        streamingGroupId_userId: {
          streamingGroupId: groupId,
          userId: dbUser.id,
        },
      },
    });

    if (!membership || (membership.role !== 'OWNER' && membership.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: "Você não tem permissão para gerenciar solicitações deste grupo" },
        { status: 403 }
      );
    }

    // Buscar a solicitação
    const joinRequest = await prisma.groupJoinRequest.findUnique({
      where: {
        id: requestId,
        streamingGroupId: groupId,
        status: 'PENDING',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        streamingGroup: {
          include: {
            _count: {
              select: {
                streamingGroupUsers: true,
              },
            },
          },
        },
      },
    });

    if (!joinRequest) {
      return NextResponse.json(
        { error: "Solicitação não encontrada ou já foi processada" },
        { status: 404 }
      );
    }

    if (action === 'approve') {
      // Verificar se o grupo ainda tem vagas
      if (joinRequest.streamingGroup._count.streamingGroupUsers >= joinRequest.streamingGroup.maxMembers) {
        return NextResponse.json(
          { error: "O grupo já está completo" },
          { status: 400 }
        );
      }

      // Verificar se o usuário já não faz parte do grupo
      const existingMembership = await prisma.streamingGroupUser.findUnique({
        where: {
          streamingGroupId_userId: {
            streamingGroupId: groupId,
            userId: joinRequest.userId,
          },
        },
      });

      if (existingMembership) {
        // Atualizar a solicitação como aprovada mesmo assim
        await prisma.groupJoinRequest.update({
          where: { id: requestId },
          data: {
            status: 'APPROVED',
            responseMessage,
            respondedAt: new Date(),
            respondedById: dbUser.id,
          },
        });

        return NextResponse.json(
          { error: "O usuário já faz parte do grupo" },
          { status: 400 }
        );
      }

      // Usar transação para aprovar a solicitação e adicionar o usuário ao grupo
      const result = await prisma.$transaction(async (tx) => {
        // Atualizar o status da solicitação
        const updatedRequest = await tx.groupJoinRequest.update({
          where: { id: requestId },
          data: {
            status: 'APPROVED',
            responseMessage,
            respondedAt: new Date(),
            respondedById: dbUser.id,
          },
        });

        // Adicionar o usuário ao grupo com prazo de 24h para envio dos dados
        const deadline = new Date();
        deadline.setHours(deadline.getHours() + 24);

        const membership = await tx.streamingGroupUser.create({
          data: {
            streamingGroupId: groupId,
            userId: joinRequest.userId,
            role: 'MEMBER',
            accessDataStatus: 'PENDING',
            accessDataDeadline: deadline,
          },
        });

        return [updatedRequest, membership];
      });

      return NextResponse.json({
        message: "Solicitação aprovada com sucesso!",
        joinRequest: result[0],
        membership: result[1],
      });
    } else {
      // Rejeitar a solicitação
      const updatedRequest = await prisma.groupJoinRequest.update({
        where: { id: requestId },
        data: {
          status: 'REJECTED',
          responseMessage,
          respondedAt: new Date(),
          respondedById: dbUser.id,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return NextResponse.json({
        message: "Solicitação rejeitada",
        joinRequest: updatedRequest,
      });
    }
  } catch (error) {
    console.error("Erro ao processar solicitação:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
