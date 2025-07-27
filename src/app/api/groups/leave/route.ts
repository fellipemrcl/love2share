import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function DELETE(request: NextRequest) {
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

    // Verificar se o usuário existe no banco
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Verificar se o usuário faz parte do grupo
    const membership = await prisma.streamingGroupUser.findFirst({
      where: {
        streamingGroupId: groupId,
        userId: dbUser.id,
      },
      include: {
        streamingGroup: {
          include: {
            _count: {
              select: {
                streamingGroupUsers: true,
              },
            },
          },
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Você não faz parte deste grupo" },
        { status: 400 }
      );
    }

    // Verificar se é o único membro ou se é OWNER
    if (membership.streamingGroup._count.streamingGroupUsers === 1) {
      // Se é o único membro, deletar o grupo inteiro
      await prisma.streamingGroupStreaming.deleteMany({
        where: { streamingGroupId: groupId },
      });
      
      await prisma.streamingGroupUser.deleteMany({
        where: { streamingGroupId: groupId },
      });

      await prisma.streamingGroup.delete({
        where: { id: groupId },
      });

      return NextResponse.json({ 
        message: "Grupo excluído com sucesso (você era o último membro)",
        groupDeleted: true 
      });
    }

    // Se é OWNER, precisa transferir a propriedade ou não pode sair
    if (membership.role === 'OWNER') {
      // Verificar se há outro ADMIN que pode assumir
      const otherAdmin = await prisma.streamingGroupUser.findFirst({
        where: {
          streamingGroupId: groupId,
          role: 'ADMIN',
          userId: {
            not: dbUser.id,
          },
        },
      });

      if (otherAdmin) {
        // Transferir propriedade para o ADMIN
        await prisma.streamingGroupUser.update({
          where: { id: otherAdmin.id },
          data: { role: 'OWNER' },
        });

        // Remover o atual OWNER
        await prisma.streamingGroupUser.delete({
          where: { id: membership.id },
        });

        return NextResponse.json({ 
          message: "Você saiu do grupo e a propriedade foi transferida para outro administrador",
          ownershipTransferred: true 
        });
      } else {
        // Se não há ADMIN, promover o membro mais antigo
        const oldestMember = await prisma.streamingGroupUser.findFirst({
          where: {
            streamingGroupId: groupId,
            userId: {
              not: dbUser.id,
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        });

        if (oldestMember) {
          // Promover o membro mais antigo a OWNER
          await prisma.streamingGroupUser.update({
            where: { id: oldestMember.id },
            data: { role: 'OWNER' },
          });

          // Remover o atual OWNER
          await prisma.streamingGroupUser.delete({
            where: { id: membership.id },
          });

          return NextResponse.json({ 
            message: "Você saiu do grupo e a propriedade foi transferida para o membro mais antigo",
            ownershipTransferred: true 
          });
        }
      }
    }

    // Para membros regulares ou ADMINs, simplesmente remover
    await prisma.streamingGroupUser.delete({
      where: { id: membership.id },
    });

    return NextResponse.json({ 
      message: "Você saiu do grupo com sucesso!",
      groupDeleted: false 
    });
  } catch (error) {
    console.error("Erro ao sair do grupo:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
