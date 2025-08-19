import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createPaymentLinkSchema = z.object({
  amount: z.number().min(100).max(100000), // Valor em centavos (R$ 1,00 - R$ 1.000,00)
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(10),
  address: z.object({
    cep: z.string().min(8).max(9),
    number: z.string().min(1),
    complement: z.string().optional(),
    street: z.string().min(1),
    neighborhood: z.string().min(1),
    city: z.string().min(1),
    state: z.string().length(2),
  }),
});

const INFINITEPAY_BASE_URL = "https://infinitepay-invoice-api.services.staging.capybaras.dev";
const MERCHANT_HANDLE = "formacao_atletas";

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
    const validatedData = createPaymentLinkSchema.parse(body);

    // Buscar usuário no banco
    const user = await prisma.user.findFirst({
      where: { clerkId: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Gerar NSU único para o pedido
    const orderNsu = crypto.randomUUID();
    
    // Criar transação de pagamento no banco
    const paymentTransaction = await prisma.paymentTransaction.create({
      data: {
        userId: user.id,
        orderNsu,
        amount: validatedData.amount,
        status: "PENDING",
        creditsAwarded: validatedData.amount / 100, // R$ 1,00 = 1 crédito
      },
    });

    // Preparar dados para a InfinitePay
    const infinitePayData = {
      handle: MERCHANT_HANDLE,
      redirect_url: `${request.nextUrl.origin}/payments/callback`,
      webhook_url: `${request.nextUrl.origin}/api/payments/webhook`,
      order_nsu: orderNsu,
      customer: {
        name: validatedData.customerName,
        email: validatedData.customerEmail,
        phone_number: validatedData.customerPhone,
      },
      address: {
        cep: validatedData.address.cep.replace(/\D/g, ""),
        number: validatedData.address.number,
        complement: validatedData.address.complement || "",
        street: validatedData.address.street,
        neighborhood: validatedData.address.neighborhood,
        city: validatedData.address.city,
        state: validatedData.address.state,
      },
      items: [
        {
          quantity: 1,
          price: validatedData.amount,
          description: `${validatedData.amount / 100} créditos Love2Share`,
        },
      ],
    };

    // Fazer requisição para a InfinitePay
    const infinitePayResponse = await fetch(`${INFINITEPAY_BASE_URL}/public/checkout/links`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(infinitePayData),
    });

    if (!infinitePayResponse.ok) {
      const errorText = await infinitePayResponse.text();
      console.error("Erro da InfinitePay:", errorText);
      
      // Marcar transação como falha
      await prisma.paymentTransaction.update({
        where: { id: paymentTransaction.id },
        data: { status: "FAILED" },
      });

      return NextResponse.json(
        { error: "Erro ao criar link de pagamento" },
        { status: 500 }
      );
    }

    const infinitePayResult = await infinitePayResponse.json();

    return NextResponse.json({
      paymentUrl: infinitePayResult.url,
      orderNsu,
      amount: validatedData.amount,
      credits: validatedData.amount / 100,
    });

  } catch (error) {
    console.error("Erro ao criar link de pagamento:", error);
    
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