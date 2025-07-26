import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import prisma from "@/lib/prisma";

// POST /api/admin/groups/[id]/members - Adicionar membro ao grupo
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "ID do usuário é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se o grupo existe
    const group = await prisma.streamingGroup.findUnique({
      where: { id: params.id },
      include: {
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

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se o grupo não está cheio
    if (group._count.streamingGroupUsers >= group.maxMembers) {
      return NextResponse.json(
        { error: "Grupo já atingiu o limite máximo de membros" },
        { status: 400 }
      );
    }

    // Verificar se o usuário já está no grupo
    const existingMember = await prisma.streamingGroupUser.findUnique({
      where: {
        streamingGroupId_userId: {
          streamingGroupId: params.id,
          userId: userId,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "Usuário já é membro deste grupo" },
        { status: 400 }
      );
    }

    // Adicionar usuário ao grupo
    const member = await prisma.streamingGroupUser.create({
      data: {
        streamingGroupId: params.id,
        userId: userId,
      },
      include: {
        user: true,
      },
    });

    return NextResponse.json({ member }, { status: 201 });
  } catch (error) {
    console.error("Erro ao adicionar membro ao grupo:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno do servidor" },
      { status: error instanceof Error && error.message === "Acesso negado" ? 403 : 500 }
    );
  }
}

// DELETE /api/admin/groups/[id]/members/[userId] - Remover membro do grupo
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; userId: string } }
) {
  try {
    await requireAdmin();

    // Verificar se o membro existe no grupo
    const member = await prisma.streamingGroupUser.findUnique({
      where: {
        streamingGroupId_userId: {
          streamingGroupId: params.id,
          userId: params.userId,
        },
      },
      include: {
        user: true,
      },
    });

    if (!member) {
      return NextResponse.json(
        { error: "Membro não encontrado neste grupo" },
        { status: 404 }
      );
    }

    // Remover membro do grupo
    await prisma.streamingGroupUser.delete({
      where: {
        streamingGroupId_userId: {
          streamingGroupId: params.id,
          userId: params.userId,
        },
      },
    });

    return NextResponse.json({ message: "Membro removido com sucesso" });
  } catch (error) {
    console.error("Erro ao remover membro do grupo:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno do servidor" },
      { status: error instanceof Error && error.message === "Acesso negado" ? 403 : 500 }
    );
  }
}
