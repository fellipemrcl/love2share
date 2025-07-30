import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

// GET: Buscar solicitações pendentes de um grupo
export async function GET(
  request: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { groupId } = params;

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
        { error: "Você não tem permissão para ver as solicitações deste grupo" },
        { status: 403 }
      );
    }

    // Buscar solicitações pendentes
    const joinRequests = await prisma.groupJoinRequest.findMany({
      where: {
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
      },
      orderBy: {
        requestedAt: 'asc',
      },
    });

    return NextResponse.json({ joinRequests });
  } catch (error) {
    console.error("Erro ao buscar solicitações:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
