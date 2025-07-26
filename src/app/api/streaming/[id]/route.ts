import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

// Schema de validação para atualizar um streaming
const updateStreamingSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").optional(),
  description: z.string().optional(),
  platform: z.string().min(1, "Plataforma é obrigatória").optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  monthlyPrice: z.number().positive().optional(),
  maxUsers: z.number().int().positive().optional(),
  maxSimultaneousScreens: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
});

// GET - Buscar um streaming específico por ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id } = await params;
    
    if (!userId) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const streaming = await prisma.streaming.findUnique({
      where: {
        id,
      },
      include: {
        streamingGroupStreamings: {
          include: {
            streamingGroup: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            streamingGroupStreamings: true,
          },
        },
      },
    });

    if (!streaming) {
      return NextResponse.json(
        { error: "Streaming não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(streaming);
  } catch (error) {
    console.error("Erro ao buscar streaming:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// PUT - Atualizar um streaming específico
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id } = await params;
    
    if (!userId) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const body = await req.json();
    
    // Validar dados de entrada
    const validationResult = updateStreamingSchema.safeParse(body);
    
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

    // Verificar se o streaming existe
    const existingStreaming = await prisma.streaming.findUnique({
      where: { id },
    });

    if (!existingStreaming) {
      return NextResponse.json(
        { error: "Streaming não encontrado" },
        { status: 404 }
      );
    }

    // Se nome e plataforma foram alterados, verificar duplicatas
    if (data.name || data.platform) {
      const duplicateCheck = await prisma.streaming.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            { name: data.name || existingStreaming.name },
            { platform: data.platform || existingStreaming.platform },
          ],
        },
      });

      if (duplicateCheck) {
        return NextResponse.json(
          { error: "Já existe um streaming com este nome nesta plataforma" },
          { status: 409 }
        );
      }
    }

    // Atualizar o streaming
    const updatedStreaming = await prisma.streaming.update({
      where: { id },
      data: {
        ...data,
        logoUrl: data.logoUrl === "" ? null : data.logoUrl,
        websiteUrl: data.websiteUrl === "" ? null : data.websiteUrl,
      },
    });

    return NextResponse.json(updatedStreaming);
  } catch (error) {
    console.error("Erro ao atualizar streaming:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Deletar um streaming específico
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id } = await params;
    
    if (!userId) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    // Verificar se o streaming existe
    const existingStreaming = await prisma.streaming.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            streamingGroupStreamings: true,
          },
        },
      },
    });

    if (!existingStreaming) {
      return NextResponse.json(
        { error: "Streaming não encontrado" },
        { status: 404 }
      );
    }

    // Verificar se há grupos usando este streaming
    if (existingStreaming._count.streamingGroupStreamings > 0) {
      // Em vez de deletar, desativar o streaming
      const deactivatedStreaming = await prisma.streaming.update({
        where: { id },
        data: { isActive: false },
      });

      return NextResponse.json({
        message: "Streaming desativado pois está sendo usado por grupos",
        streaming: deactivatedStreaming,
      });
    }

    // Se não há dependências, deletar permanentemente
    await prisma.streaming.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Streaming deletado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao deletar streaming:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
