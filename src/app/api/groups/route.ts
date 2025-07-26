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
    const { streamingId, maxMembers } = body;

    // Validação básica
    if (!streamingId) {
      return NextResponse.json(
        { error: "Streaming é obrigatório" },
        { status: 400 }
      );
    }

    if (!maxMembers || maxMembers < 2) {
      return NextResponse.json(
        { error: "Número de membros deve ser pelo menos 2" },
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

    // Buscar informações do streaming
    const streaming = await prisma.streaming.findUnique({
      where: { id: streamingId },
    });

    if (!streaming) {
      return NextResponse.json(
        { error: "Serviço de streaming não encontrado" },
        { status: 404 }
      );
    }

    // Validar se o maxMembers não excede o limite do streaming
    if (maxMembers > streaming.maxUsers) {
      return NextResponse.json(
        { error: `Número de membros não pode exceder ${streaming.maxUsers} para este streaming` },
        { status: 400 }
      );
    }

    // Criar o grupo com os dados gerados automaticamente
    const userName = user.firstName || user.username || dbUser.name || "Usuário";
    const groupName = `Grupo de ${streaming.name} de ${userName}`;
    const groupDescription = `Compartilhamento da conta ${streaming.name}`;
    
    const group = await prisma.streamingGroup.create({
      data: {
        name: groupName,
        description: groupDescription,
        maxMembers: maxMembers,
      },
    });

    // Adicionar o usuário como membro do grupo
    await prisma.streamingGroupUser.create({
      data: {
        streamingGroupId: group.id,
        userId: dbUser.id,
      },
    });

    return NextResponse.json({ group }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar grupo:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

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

    // Buscar grupos do usuário
    const userGroups = await prisma.streamingGroupUser.findMany({
      where: {
        userId: dbUser.id,
      },
      include: {
        streamingGroup: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const groups = userGroups.map(ug => ug.streamingGroup);

    return NextResponse.json({ groups });
  } catch (error) {
    console.error("Erro ao buscar grupos:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
