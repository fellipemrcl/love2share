import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const spendCreditsSchema = z.object({
  amount: z.number().positive(),
  description: z.string().min(1),
});

// Buscar histórico de transações de crédito
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const user = await prisma.user.findFirst({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    const [transactions, total] = await Promise.all([
      prisma.creditTransaction.findMany({
        where: { userId: user.id },
        include: {
          paymentTransaction: {
            select: {
              orderNsu: true,
              paymentMethod: true,
              receiptUrl: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.creditTransaction.count({
        where: { userId: user.id },
      }),
    ]);

    return NextResponse.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error("Erro ao buscar transações de crédito:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// Gastar créditos
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Usuário não autenticado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { amount, description } = spendCreditsSchema.parse(body);

    const user = await prisma.user.findFirst({
      where: { clerkId: userId },
      select: { id: true, credits: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    if (user.credits < amount) {
      return NextResponse.json(
        { error: "Saldo insuficiente" },
        { status: 400 }
      );
    }

    // Processar gasto em transação
    const result = await prisma.$transaction(async (tx) => {
      // Deduzir créditos do usuário
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          credits: {
            decrement: amount,
          },
        },
        select: { credits: true },
      });

      // Criar registro da transação de crédito
      const transaction = await tx.creditTransaction.create({
        data: {
          userId: user.id,
          type: "SPEND",
          amount: -amount, // Valor negativo para indicar gasto
          description,
        },
      });

      return {
        transaction,
        newBalance: updatedUser.credits,
      };
    });

    return NextResponse.json({
      success: true,
      transaction: result.transaction,
      newBalance: result.newBalance,
    });

  } catch (error) {
    console.error("Erro ao gastar créditos:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}