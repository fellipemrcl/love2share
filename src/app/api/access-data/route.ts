import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { createAccessDataDelivery } from "@/lib/access-data-helpers";
import { AccessDataDeliveryType } from "@/app/generated/prisma";

// POST - Enviar dados de acesso para um membro
export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { 
      streamingGroupUserId, 
      deliveryType, 
      content, 
      isInviteLink = false, 
      notes 
    } = body;

    if (!streamingGroupUserId || !deliveryType || !content) {
      return NextResponse.json(
        { error: "streamingGroupUserId, deliveryType e content são obrigatórios" },
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

    // Verificar se o usuário do grupo existe e se quem está enviando é admin
    const streamingGroupUser = await prisma.streamingGroupUser.findUnique({
      where: { id: streamingGroupUserId },
      include: {
        streamingGroup: {
          include: {
            streamingGroupUsers: {
              where: {
                userId: dbUser.id,
                role: { in: ['OWNER', 'ADMIN'] },
              },
            },
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!streamingGroupUser) {
      return NextResponse.json(
        { error: "Membro do grupo não encontrado" },
        { status: 404 }
      );
    }

    if (streamingGroupUser.streamingGroup.streamingGroupUsers.length === 0) {
      return NextResponse.json(
        { error: "Você não tem permissão para enviar dados de acesso para este grupo" },
        { status: 403 }
      );
    }

    // Verificar se é um tipo de entrega válido
    if (!Object.values(AccessDataDeliveryType).includes(deliveryType)) {
      return NextResponse.json(
        { error: "Tipo de entrega inválido" },
        { status: 400 }
      );
    }

    // Criar a entrega de dados
    const delivery = await createAccessDataDelivery({
      streamingGroupUserId,
      deliveryType,
      content,
      isInviteLink,
      notes,
    });

    return NextResponse.json({
      message: "Dados de acesso enviados com sucesso!",
      delivery: {
        id: delivery.id,
        deliveryType: delivery.deliveryType,
        isInviteLink: delivery.isInviteLink,
        sentAt: delivery.sentAt,
        notes: delivery.notes,
      },
      recipient: {
        name: streamingGroupUser.user.name,
        email: streamingGroupUser.user.email,
      },
    });
  } catch (error) {
    console.error("Erro ao enviar dados de acesso:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// GET - Listar dados de acesso pendentes para admin
export async function GET() {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Buscar todos os membros pendentes dos grupos que o usuário administra
    const pendingAccessData = await prisma.streamingGroupUser.findMany({
      where: {
        streamingGroup: {
          OR: [
            { createdById: dbUser.id },
            {
              streamingGroupUsers: {
                some: {
                  userId: dbUser.id,
                  role: { in: ['OWNER', 'ADMIN'] },
                },
              },
            },
          ],
        },
        accessDataStatus: { in: ['PENDING', 'SENT'] },
        role: 'MEMBER',
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
          select: {
            id: true,
            name: true,
          },
        },
        accessDataDeliveries: {
          orderBy: { sentAt: 'desc' },
          take: 1,
        },
      },
      orderBy: [
        { accessDataDeadline: 'asc' },
        { createdAt: 'asc' },
      ],
    });

    const now = new Date();

    const formattedData = pendingAccessData.map((item) => {
      const deadline = item.accessDataDeadline;
      const hoursRemaining = deadline
        ? Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60))
        : null;
      const isOverdue = deadline ? now > deadline : false;

      return {
        id: item.id,
        user: item.user,
        streamingGroup: item.streamingGroup,
        status: item.accessDataStatus,
        deadline,
        hoursRemaining: hoursRemaining || undefined,
        isOverdue,
        lastDelivery: item.accessDataDeliveries[0] || null,
      };
    });

    return NextResponse.json({
      pendingAccessData: formattedData,
      summary: {
        total: formattedData.length,
        pending: formattedData.filter(item => item.status === 'PENDING').length,
        sent: formattedData.filter(item => item.status === 'SENT').length,
        overdue: formattedData.filter(item => item.isOverdue).length,
      },
    });
  } catch (error) {
    console.error("Erro ao listar dados de acesso:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
