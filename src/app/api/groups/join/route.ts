import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { groupId } = body;

    if (!groupId) {
      return NextResponse.json(
        { error: "ID do grupo é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se o usuário existe no banco, se não criar
    let dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          clerkId: user.id,
          email: user.emailAddresses[0]?.emailAddress || "",
          name: user.firstName && user.lastName 
            ? `${user.firstName} ${user.lastName}` 
            : user.firstName || user.username || "Usuário",
        },
      });
    }

    // Verificar se o grupo existe
    const group = await prisma.streamingGroup.findUnique({
      where: { id: groupId },
      include: {
        streamingGroupUsers: true,
        _count: {
          select: {
            streamingGroupUsers: true,
          },
        },
      },
    });

    if (!group) {
      return NextResponse.json(
        { error: "Grupo não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se o usuário já faz parte do grupo
    const existingMembership = group.streamingGroupUsers.find(
      member => member.userId === dbUser.id
    );

    if (existingMembership) {
      return NextResponse.json(
        { error: "Você já faz parte deste grupo" },
        { status: 400 }
      );
    }

    // Verificar se o grupo ainda tem vagas
    if (group._count.streamingGroupUsers >= group.maxMembers) {
      return NextResponse.json(
        { error: "Este grupo já está completo" },
        { status: 400 }
      );
    }

    // Adicionar o usuário ao grupo como membro
    const membership = await prisma.streamingGroupUser.create({
      data: {
        streamingGroupId: groupId,
        userId: dbUser.id,
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
          include: {
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            streamingGroupStreamings: {
              include: {
                streaming: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ 
      message: "Você se juntou ao grupo com sucesso!",
      membership 
    }, { status: 201 });
  } catch (error) {
    console.error("Erro ao entrar no grupo:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
