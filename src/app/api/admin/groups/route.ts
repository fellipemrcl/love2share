import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import prisma from "@/lib/prisma";

// GET /api/admin/groups - Listar todos os grupos
export async function GET() {
  try {
    await requireAdmin();

    const groups = await prisma.streamingGroup.findMany({
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
            user: true,
          },
          orderBy: {
            role: 'desc', // OWNER primeiro, depois ADMIN, depois MEMBER
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ groups });
  } catch (error) {
    console.error("Erro ao buscar grupos:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno do servidor" },
      { status: error instanceof Error && error.message === "Acesso negado" ? 403 : 500 }
    );
  }
}

// POST /api/admin/groups - Criar novo grupo
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { name, description, maxMembers, createdById } = body;

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

    // Se não foi especificado um criador, usar o admin atual
    let finalCreatedById = createdById;
    if (!finalCreatedById) {
      const { currentUser } = await import("@clerk/nextjs/server");
      const user = await currentUser();
      
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Verificar se o usuário admin existe no banco, se não criar
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
              : user.firstName || user.username || "Admin",
          },
        });
      }
      
      finalCreatedById = dbUser.id;
    }

    const group = await prisma.streamingGroup.create({
      data: {
        name,
        description: description || null,
        maxMembers,
        createdById: finalCreatedById,
      },
      include: {
        createdBy: true,
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

    return NextResponse.json({ group }, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar grupo:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro interno do servidor" },
      { status: error instanceof Error && error.message === "Acesso negado" ? 403 : 500 }
    );
  }
}
