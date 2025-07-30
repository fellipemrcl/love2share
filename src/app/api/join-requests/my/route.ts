import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verificar se o usuário existe no banco
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ joinRequests: [] });
    }

    // Buscar todas as solicitações do usuário
    const joinRequests = await prisma.groupJoinRequest.findMany({
      where: {
        userId: dbUser.id,
      },
      include: {
        streamingGroup: {
          select: {
            id: true,
            name: true,
            description: true,
            maxMembers: true,
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            streamingGroupStreamings: {
              include: {
                streaming: {
                  select: {
                    id: true,
                    name: true,
                    platform: true,
                    logoUrl: true,
                  },
                },
              },
            },
            _count: {
              select: {
                streamingGroupUsers: true,
              },
            },
          },
        },
        respondedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        requestedAt: 'desc',
      },
    });

    return NextResponse.json({ joinRequests });
  } catch (error) {
    console.error("Erro ao buscar minhas solicitações:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
