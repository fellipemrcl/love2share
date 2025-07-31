import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { confirmAccessDataReceipt } from "@/lib/access-data-helpers";

// POST - Confirmar recebimento dos dados de acesso
export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { streamingGroupUserId, confirmed, notes } = body;

    if (streamingGroupUserId === undefined || confirmed === undefined) {
      return NextResponse.json(
        { error: "streamingGroupUserId e confirmed são obrigatórios" },
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

    // Verificar se o streamingGroupUser pertence ao usuário atual
    const streamingGroupUser = await prisma.streamingGroupUser.findUnique({
      where: { 
        id: streamingGroupUserId,
        userId: dbUser.id,
      },
      include: {
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
    });

    if (!streamingGroupUser) {
      return NextResponse.json(
        { error: "Membro do grupo não encontrado ou não pertence a você" },
        { status: 404 }
      );
    }

    // Verificar se há dados enviados para confirmar
    if (streamingGroupUser.accessDataStatus !== 'SENT') {
      return NextResponse.json(
        { error: "Não há dados de acesso para confirmar" },
        { status: 400 }
      );
    }

    // Confirmar ou rejeitar o recebimento dos dados
    const updatedUser = await confirmAccessDataReceipt(
      streamingGroupUserId,
      confirmed,
      notes
    );

    return NextResponse.json({
      message: confirmed 
        ? "Recebimento dos dados confirmado com sucesso!"
        : "Problemas com os dados reportados. O administrador será notificado.",
      status: updatedUser.accessDataStatus,
      confirmedAt: updatedUser.accessDataConfirmedAt,
      streamingGroup: streamingGroupUser.streamingGroup,
    });
  } catch (error) {
    console.error("Erro ao confirmar recebimento:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// GET - Buscar dados de acesso do membro
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

    // Buscar todos os grupos onde o usuário é membro
    const memberAccessData = await prisma.streamingGroupUser.findMany({
      where: {
        userId: dbUser.id,
        role: 'MEMBER',
      },
      include: {
        streamingGroup: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        accessDataDeliveries: {
          orderBy: { sentAt: 'desc' },
          take: 3, // Últimas 3 entregas
          select: {
            id: true,
            deliveryType: true,
            content: true, // Campo com os dados de acesso reais
            isInviteLink: true,
            sentAt: true,
            confirmedAt: true,
            notes: true,
          },
        },
      },
      orderBy: [
        { accessDataDeadline: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    const now = new Date();

    const formattedData = memberAccessData.map((item) => {
      const deadline = item.accessDataDeadline;
      const hoursRemaining = deadline
        ? Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60))
        : null;
      
      return {
        id: item.id,
        streamingGroup: item.streamingGroup,
        status: item.accessDataStatus,
        deadline,
        hoursRemaining: hoursRemaining || undefined,
        isOverdue: deadline ? now > deadline : false,
        sentAt: item.accessDataSentAt,
        confirmedAt: item.accessDataConfirmedAt,
        recentDeliveries: item.accessDataDeliveries,
        needsAction: item.accessDataStatus === 'SENT',
      };
    });

    return NextResponse.json({
      memberAccessData: formattedData,
      summary: {
        total: formattedData.length,
        needingConfirmation: formattedData.filter(item => item.needsAction).length,
        confirmed: formattedData.filter(item => item.status === 'CONFIRMED').length,
        pending: formattedData.filter(item => item.status === 'PENDING').length,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar dados de acesso do membro:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
