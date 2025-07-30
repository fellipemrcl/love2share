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
    const { groupId, message } = body;

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
        joinRequests: {
          where: {
            userId: dbUser.id,
            status: 'PENDING'
          }
        },
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

    // Verificar se já existe uma solicitação pendente
    if (group.joinRequests.length > 0) {
      return NextResponse.json(
        { error: "Você já possui uma solicitação pendente para este grupo" },
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

    // Criar a solicitação de participação
    const joinRequest = await prisma.groupJoinRequest.create({
      data: {
        streamingGroupId: groupId,
        userId: dbUser.id,
        requestMessage: message || null,
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
            description: true,
          },
        },
      },
    });

    return NextResponse.json({ 
      message: "Solicitação enviada com sucesso! Aguarde a aprovação do administrador.",
      joinRequest 
    }, { status: 201 });
  } catch (error) {
    console.error("Erro ao solicitar entrada no grupo:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
