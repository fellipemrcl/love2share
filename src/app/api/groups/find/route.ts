import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
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
      return NextResponse.json({ groups: [] });
    }

    const { searchParams } = new URL(request.url);
    const streamingId = searchParams.get('streamingId');
    const search = searchParams.get('search');

    // Buscar grupos que o usuário NÃO faz parte e que ainda têm vagas
    const baseWhereConditions = {
      // Excluir grupos que o usuário já faz parte
      streamingGroupUsers: {
        none: {
          userId: dbUser.id,
        },
      },
    };

    const additionalConditions: Record<string, unknown>[] = [];

    // Filtro por streaming específico
    if (streamingId) {
      additionalConditions.push({
        streamingGroupStreamings: {
          some: {
            streamingId: streamingId,
          },
        },
      });
    }

    // Busca por nome ou descrição
    if (search) {
      additionalConditions.push({
        OR: [
          {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
      });
    }

    const whereConditions = {
      ...baseWhereConditions,
      AND: additionalConditions.length > 0 ? additionalConditions : undefined,
    };

    const groups = await prisma.streamingGroup.findMany({
      where: whereConditions,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        streamingGroupUsers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        streamingGroupStreamings: {
          include: {
            streaming: {
              select: {
                id: true,
                name: true,
                logoUrl: true,
                monthlyPrice: true,
                maxUsers: true,
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Filtrar apenas grupos que ainda têm vagas
    const availableGroups = groups.filter(group => 
      group._count.streamingGroupUsers < group.maxMembers
    );

    // Calcular informações adicionais
    const groupsWithDetails = availableGroups.map(group => ({
      ...group,
      availableSlots: group.maxMembers - group._count.streamingGroupUsers,
      pricePerMember: group.streamingGroupStreamings.length > 0 
        ? (group.streamingGroupStreamings[0].streaming.monthlyPrice || 0) / group.maxMembers 
        : 0,
    }));

    return NextResponse.json({ groups: groupsWithDetails });
  } catch (error) {
    console.error("Erro ao buscar grupos:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
