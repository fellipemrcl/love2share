import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import prisma from "@/lib/prisma";

// DELETE /api/admin/groups/[id]/members/[userId] - Remover membro específico do grupo
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    await requireAdmin();

    const { id, userId } = await params;

    // Verificar se o membro existe no grupo
    const member = await prisma.streamingGroupUser.findUnique({
      where: {
        streamingGroupId_userId: {
          streamingGroupId: id,
          userId: userId,
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
          streamingGroupId: id,
          userId: userId,
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
