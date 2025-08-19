import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const webhookSchema = z.object({
  invoice_slug: z.string(),
  amount: z.number(),
  paid_amount: z.number(),
  installments: z.number(),
  capture_method: z.enum(["credit_card", "pix"]),
  transaction_nsu: z.string(),
  order_nsu: z.string(),
  receipt_url: z.string(),
  items: z.array(z.object({
    quantity: z.number(),
    price: z.number(),
    description: z.string(),
  })),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log("Webhook recebido da InfinitePay:", body);
    
    const validatedData = webhookSchema.parse(body);

    // Buscar a transação pelo orderNsu
    const paymentTransaction = await prisma.paymentTransaction.findUnique({
      where: { orderNsu: validatedData.order_nsu },
      include: { user: true },
    });

    if (!paymentTransaction) {
      console.error("Transação não encontrada:", validatedData.order_nsu);
      return NextResponse.json(
        { error: "Transação não encontrada" },
        { status: 400 }
      );
    }

    // Verificar se a transação já foi processada
    if (paymentTransaction.status === "PAID") {
      console.log("Transação já processada:", validatedData.order_nsu);
      return NextResponse.json({ success: true });
    }

    // Traduzir método de pagamento
    const paymentMethodMap = {
      credit_card: "Cartão de crédito",
      pix: "Pix",
    };

    // Atualizar transação de pagamento
    const updatedPaymentTransaction = await prisma.paymentTransaction.update({
      where: { id: paymentTransaction.id },
      data: {
        status: "PAID",
        paymentMethod: paymentMethodMap[validatedData.capture_method],
        transactionNsu: validatedData.transaction_nsu,
        invoiceSlug: validatedData.invoice_slug,
        receiptUrl: validatedData.receipt_url,
        infinitePayData: body,
      },
    });

    // Processar créditos em uma transação
    await prisma.$transaction(async (tx) => {
      // Adicionar créditos ao usuário
      await tx.user.update({
        where: { id: paymentTransaction.userId },
        data: {
          credits: {
            increment: paymentTransaction.creditsAwarded,
          },
        },
      });

      // Criar registro da transação de crédito
      await tx.creditTransaction.create({
        data: {
          userId: paymentTransaction.userId,
          type: "PURCHASE",
          amount: paymentTransaction.creditsAwarded,
          description: `Compra de ${paymentTransaction.creditsAwarded} créditos - ${paymentMethodMap[validatedData.capture_method]}`,
          paymentTransactionId: paymentTransaction.id,
        },
      });
    });

    console.log(`Pagamento processado com sucesso para usuário ${paymentTransaction.user.email}, ${paymentTransaction.creditsAwarded} créditos adicionados`);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Erro ao processar webhook:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos do webhook", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// Verificar status de pagamento (para integração sem webhook)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNsu = searchParams.get("orderNsu");
    const transactionNsu = searchParams.get("transactionNsu");
    const slug = searchParams.get("slug");

    if (!orderNsu || !transactionNsu || !slug) {
      return NextResponse.json(
        { error: "Parâmetros obrigatórios: orderNsu, transactionNsu, slug" },
        { status: 400 }
      );
    }

    // Verificar status na InfinitePay
    const infinitePayResponse = await fetch(
      `https://infinitepay-invoice-api.services.staging.capybaras.dev/public/checkout/payment_check/formacao_atletas`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          external_order_nsu: orderNsu,
          transaction_nsu: transactionNsu,
          slug: slug,
        }),
      }
    );

    if (!infinitePayResponse.ok) {
      return NextResponse.json(
        { error: "Erro ao verificar status do pagamento" },
        { status: 500 }
      );
    }

    const result = await infinitePayResponse.json();

    return NextResponse.json({
      success: result.success,
      paid: result.paid,
    });

  } catch (error) {
    console.error("Erro ao verificar status do pagamento:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}