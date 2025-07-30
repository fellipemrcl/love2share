import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

// GET - Buscar dados de acesso dos membros de um grupo específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: groupId } = await params;

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
        { error: "Você não tem permissão para gerenciar este grupo" },
        { status: 403 }
      );
    }

    // Buscar todos os membros do grupo com seus dados de acesso
    const groupMembers = await prisma.streamingGroupUser.findMany({
      where: {
        streamingGroupId: groupId,
        role: 'MEMBER', // Apenas membros, não admins
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        accessDataDeliveries: {
          orderBy: { sentAt: 'desc' },
          take: 1,
          select: {
            id: true,
            deliveryType: true,
            sentAt: true,
            confirmedAt: true,
          },
        },
      },
      orderBy: [
        { accessDataDeadline: 'asc' },
        { createdAt: 'asc' },
      ],
    });

    const now = new Date();

    const formattedMembers = groupMembers.map((member) => {
      const deadline = member.accessDataDeadline;
      const hoursRemaining = deadline
        ? Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60))
        : null;
      const isOverdue = deadline ? now > deadline : false;

      return {
        id: member.id,
        user: member.user,
        status: member.accessDataStatus,
        deadline,
        hoursRemaining: hoursRemaining || undefined,
        isOverdue,
        lastDelivery: member.accessDataDeliveries[0] || null,
      };
    });

    return NextResponse.json({
      members: formattedMembers,
      summary: {
        total: formattedMembers.length,
        pending: formattedMembers.filter(m => m.status === 'PENDING').length,
        sent: formattedMembers.filter(m => m.status === 'SENT').length,
        confirmed: formattedMembers.filter(m => m.status === 'CONFIRMED').length,
        overdue: formattedMembers.filter(m => m.isOverdue).length,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar dados de acesso do grupo:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
