import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface StreamingSavings {
  streamingName: string;
  logoUrl?: string;
  originalPrice: number;
  sharedPrice: number;
  savings: number;
  groupSize: number;
  maxMembers: number;
}

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Buscar o usuário no banco de dados
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Buscar todos os grupos do usuário com suas informações de streaming
    const userGroups = await prisma.streamingGroupUser.findMany({
      where: {
        userId: user.id,
      },
      include: {
        streamingGroup: {
          include: {
            streamingGroupStreamings: {
              include: {
                streaming: true,
              },
            },
            streamingGroupUsers: true,
          },
        },
      },
    });

    let totalMonthlySavings = 0;
    let totalOriginalPrice = 0;
    let totalSharedPrice = 0;
    const streamingSavings: StreamingSavings[] = [];

    // Calcular economia para cada streaming
    for (const userGroup of userGroups) {
      const group = userGroup.streamingGroup;
      
      for (const groupStreaming of group.streamingGroupStreamings) {
        const streaming = groupStreaming.streaming;
        const groupSize = group.streamingGroupUsers.length;
        
        if (streaming.monthlyPrice && groupSize > 0) {
          const originalPrice = streaming.monthlyPrice;
          const sharedPrice = originalPrice / groupSize;
          const savings = originalPrice - sharedPrice;

          totalOriginalPrice += originalPrice;
          totalSharedPrice += sharedPrice;
          totalMonthlySavings += savings;

          streamingSavings.push({
            streamingName: streaming.name,
            logoUrl: streaming.logoUrl || undefined,
            originalPrice,
            sharedPrice,
            savings,
            groupSize,
            maxMembers: group.maxMembers,
          });
        }
      }
    }

    const totalYearlySavings = totalMonthlySavings * 12;

    return NextResponse.json({
      totalMonthlySavings,
      totalYearlySavings,
      totalOriginalPrice,
      totalSharedPrice,
      streamingSavings,
    });
  } catch (error) {
    console.error("Erro ao buscar economias:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
