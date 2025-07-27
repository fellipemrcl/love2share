import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

// GET /api/groups/my - Listar todos os grupos do usuário
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
      return NextResponse.json({ groups: [] });
    }

    // Buscar TODOS os grupos onde o usuário é membro (qualquer role)
    const userGroups = await prisma.streamingGroupUser.findMany({
      where: {
        userId: dbUser.id,
      },
      include: {
        streamingGroup: {
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
              orderBy: {
                createdAt: 'asc',
              },
            },
            streamingGroupStreamings: {
              include: {
                streaming: true,
                accountOwner: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
            _count: {
              select: {
                streamingGroupUsers: true,
                streamingGroupStreamings: true,
              },
            },
          },
        },
      },
      orderBy: {
        streamingGroup: {
          createdAt: 'desc',
        },
      },
    });

    const groups = userGroups.map(ug => ({
      ...ug.streamingGroup,
      userRole: ug.role,
      isOwner: ug.role === 'OWNER',
      isAdmin: ug.role === 'ADMIN' || ug.role === 'OWNER',
      canManage: ug.role === 'OWNER' || ug.role === 'ADMIN',
      availableSlots: ug.streamingGroup.maxMembers - ug.streamingGroup._count.streamingGroupUsers,
    }));

    return NextResponse.json({ groups });
  } catch (error) {
    console.error("Erro ao buscar grupos do usuário:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// PUT /api/groups/my - Atualizar grupo (apenas OWNER)
export async function PUT(request: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { groupId, name, description, maxMembers } = body;

    if (!groupId) {
      return NextResponse.json(
        { error: "ID do grupo é obrigatório" },
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

    // Verificar se o usuário é owner do grupo
    const membership = await prisma.streamingGroupUser.findFirst({
      where: {
        streamingGroupId: groupId,
        userId: dbUser.id,
        role: 'OWNER',
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Apenas o dono do grupo pode fazer alterações" },
        { status: 403 }
      );
    }

    // Verificar se o novo maxMembers não é menor que o número atual de membros
    if (maxMembers) {
      const currentMemberCount = await prisma.streamingGroupUser.count({
        where: { streamingGroupId: groupId },
      });

      if (maxMembers < currentMemberCount) {
        return NextResponse.json(
          { error: `Não é possível reduzir o número máximo de membros para ${maxMembers}. O grupo já tem ${currentMemberCount} membros.` },
          { status: 400 }
        );
      }

      // Verificar se não excede o limite do streaming associado
      const groupWithStreaming = await prisma.streamingGroup.findUnique({
        where: { id: groupId },
        include: {
          streamingGroupStreamings: {
            include: {
              streaming: {
                select: {
                  maxSimultaneousScreens: true,
                },
              },
            },
          },
        },
      });

      if (groupWithStreaming?.streamingGroupStreamings.length) {
        const maxAllowed = Math.max(
          ...groupWithStreaming.streamingGroupStreamings.map(s => s.streaming.maxSimultaneousScreens)
        );
        
        if (maxMembers > maxAllowed) {
          return NextResponse.json(
            { error: `Número máximo de membros não pode exceder ${maxAllowed} (limite do streaming)` },
            { status: 400 }
          );
        }
      }
    }

    // Atualizar o grupo
    const updatedGroup = await prisma.streamingGroup.update({
      where: { id: groupId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(maxMembers && { maxMembers }),
      },
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
            streaming: true,
          },
        },
        _count: {
          select: {
            streamingGroupUsers: true,
          },
        },
      },
    });

    return NextResponse.json({ 
      message: "Grupo atualizado com sucesso!",
      group: updatedGroup 
    });
  } catch (error) {
    console.error("Erro ao atualizar grupo:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
