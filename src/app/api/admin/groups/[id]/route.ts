import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import prisma from "@/lib/prisma";

// GET /api/admin/groups/[id] - Buscar grupo específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const group = await prisma.streamingGroup.findUnique({
      where: { id: params.id },
      include: {
        streamingGroupUsers: {
          include: {
            user: true,
          },
        },
        streamingGroupStreamings: {
          include: {
            streaming: true,
            accountOwner: true,
          },
        },
        _count: {
          select: {
            streamingGroupUsers: true,
            streamingGroupStreamings: true,
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

    return NextResponse.json({ group });
  } catch (error) {
    console.error("Erro ao buscar grupo:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno do servidor" },
      { status: error instanceof Error && error.message === "Acesso negado" ? 403 : 500 }
    );
  }
}

// PUT /api/admin/groups/[id] - Atualizar grupo
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { name, description, maxMembers } = body;

    if (!name || !maxMembers) {
      return NextResponse.json(
        { error: "Nome e número máximo de membros são obrigatórios" },
        { status: 400 }
      );
    }

    if (maxMembers < 1) {
      return NextResponse.json(
        { error: "Número máximo de membros deve ser pelo menos 1" },
        { status: 400 }
      );
    }

    // Verificar se o grupo existe
    const existingGroup = await prisma.streamingGroup.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            streamingGroupUsers: true,
          },
        },
      },
    });

    if (!existingGroup) {
      return NextResponse.json(
        { error: "Grupo não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se o novo maxMembers não é menor que o número atual de membros
    if (maxMembers < existingGroup._count.streamingGroupUsers) {
      return NextResponse.json(
        { error: `Não é possível reduzir o limite para ${maxMembers} membros. O grupo atual tem ${existingGroup._count.streamingGroupUsers} membros` },
        { status: 400 }
      );
    }

    const updatedGroup = await prisma.streamingGroup.update({
      where: { id: params.id },
      data: {
        name,
        description: description || null,
        maxMembers,
      },
      include: {
        streamingGroupUsers: {
          include: {
            user: true,
          },
        },
        streamingGroupStreamings: {
          include: {
            streaming: true,
            accountOwner: true,
          },
        },
        _count: {
          select: {
            streamingGroupUsers: true,
            streamingGroupStreamings: true,
          },
        },
      },
    });

    return NextResponse.json({ group: updatedGroup });
  } catch (error) {
    console.error("Erro ao atualizar grupo:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno do servidor" },
      { status: error instanceof Error && error.message === "Acesso negado" ? 403 : 500 }
    );
  }
}

// DELETE /api/admin/groups/[id] - Deletar grupo
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    // Verificar se o grupo existe
    const existingGroup = await prisma.streamingGroup.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            streamingGroupUsers: true,
            streamingGroupStreamings: true,
          },
        },
      },
    });

    if (!existingGroup) {
      return NextResponse.json(
        { error: "Grupo não encontrado" },
        { status: 404 }
      );
    }

    // Deletar todas as relações primeiro
    await prisma.$transaction(async (tx) => {
      // Remover todas as contas de streaming do grupo
      await tx.streamingGroupStreaming.deleteMany({
        where: { streamingGroupId: params.id },
      });

      // Remover todos os usuários do grupo
      await tx.streamingGroupUser.deleteMany({
        where: { streamingGroupId: params.id },
      });

      // Deletar o grupo
      await tx.streamingGroup.delete({
        where: { id: params.id },
      });
    });

    return NextResponse.json({ message: "Grupo deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar grupo:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno do servidor" },
      { status: error instanceof Error && error.message === "Acesso negado" ? 403 : 500 }
    );
  }
}
