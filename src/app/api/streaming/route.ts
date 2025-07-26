import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

// Schema de validação para criar um streaming
const createStreamingSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  platform: z.string().min(1, "Plataforma é obrigatória"),
  logoUrl: z.string().url().optional().or(z.literal("")),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  monthlyPrice: z.number().positive().optional(),
  maxUsers: z.number().int().positive().default(1),
  maxSimultaneousScreens: z.number().int().positive().default(1),
  isActive: z.boolean().default(true),
});

// GET - Listar todos os streamings ativos
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const streamings = await prisma.streaming.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
      include: {
        _count: {
          select: {
            streamingGroupStreamings: true,
          },
        },
      },
    });

    return NextResponse.json(streamings);
  } catch (error) {
    console.error("Erro ao buscar streamings:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// POST - Criar um novo streaming
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const body = await req.json();
    
    // Validar dados de entrada
    const validationResult = createStreamingSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Dados inválidos",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Verificar se já existe um streaming com o mesmo nome e plataforma
    const existingStreaming = await prisma.streaming.findFirst({
      where: {
        name: data.name,
        platform: data.platform,
      },
    });

    if (existingStreaming) {
      return NextResponse.json(
        { error: "Já existe um streaming com este nome nesta plataforma" },
        { status: 409 }
      );
    }

    // Criar o streaming
    const streaming = await prisma.streaming.create({
      data: {
        name: data.name,
        description: data.description,
        platform: data.platform,
        logoUrl: data.logoUrl || null,
        websiteUrl: data.websiteUrl || null,
        monthlyPrice: data.monthlyPrice,
        maxUsers: data.maxUsers,
        maxSimultaneousScreens: data.maxSimultaneousScreens,
        isActive: data.isActive,
      },
    });

    return NextResponse.json(streaming, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar streaming:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
