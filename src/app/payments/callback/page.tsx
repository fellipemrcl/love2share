"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, Receipt, Coins } from "lucide-react";
import Link from "next/link";

interface PaymentResult {
  success: boolean;
  paid: boolean;
  paymentMethod?: string;
  amount?: number;
  credits?: number;
  receiptUrl?: string;
}

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const [result, setResult] = useState<PaymentResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const orderNsu = searchParams.get("order_nsu");
  const transactionId = searchParams.get("transaction_id");
  const slug = searchParams.get("slug");
  const receiptUrl = searchParams.get("receipt_url");
  const captureMethod = searchParams.get("capture_method");

  useEffect(() => {
    if (!orderNsu || !transactionId || !slug) {
      setError("Parâmetros de pagamento inválidos");
      setLoading(false);
      return;
    }

    checkPaymentStatus();
  }, [orderNsu, transactionId, slug]);

  const checkPaymentStatus = async () => {
    try {
      const response = await fetch(
        `/api/payments/webhook?orderNsu=${orderNsu}&transactionNsu=${transactionId}&slug=${slug}`
      );

      if (!response.ok) {
        throw new Error("Erro ao verificar status do pagamento");
      }

      const data = await response.json();
      
      // Traduzir método de captura
      const paymentMethodMap: Record<string, string> = {
        credit_card: "Cartão de crédito",
        pix: "Pix",
      };

      setResult({
        success: data.success,
        paid: data.paid,
        paymentMethod: captureMethod ? paymentMethodMap[captureMethod] : undefined,
        receiptUrl: receiptUrl || undefined,
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <h2 className="text-xl font-semibold mb-2">Verificando Pagamento</h2>
            <p className="text-muted-foreground">
              Aguarde enquanto confirmamos seu pagamento...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <XCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-semibold mb-2 text-red-500">Erro</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button asChild>
              <Link href="/credits">Tentar Novamente</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (result?.paid) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
            <CardTitle className="text-2xl text-green-600">
              Pagamento Aprovado!
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="text-center space-y-2">
              <p className="text-lg">
                Seus créditos foram adicionados com sucesso!
              </p>
              
              {result.paymentMethod && (
                <p className="text-sm text-muted-foreground">
                  Método: {result.paymentMethod}
                </p>
              )}

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center justify-center gap-2 text-green-700">
                  <Coins className="h-5 w-5" />
                  <span className="font-semibold">
                    Créditos disponíveis em sua conta
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/groups">
                  <Coins className="mr-2 h-4 w-4" />
                  Ver Meus Créditos
                </Link>
              </Button>
              
              {result.receiptUrl && (
                <Button asChild variant="outline" className="w-full">
                  <a href={result.receiptUrl} target="_blank" rel="noopener noreferrer">
                    <Receipt className="mr-2 h-4 w-4" />
                    Ver Comprovante
                  </a>
                </Button>
              )}

              <Button asChild variant="ghost" className="w-full">
                <Link href="/credits/history">Ver Histórico de Pagamentos</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <XCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
          <CardTitle className="text-2xl text-red-600">
            Pagamento Não Aprovado
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="text-center">
            <p className="text-lg mb-2">
              Seu pagamento não foi processado com sucesso.
            </p>
            <p className="text-sm text-muted-foreground">
              Isso pode ter acontecido por diversos motivos, como dados incorretos 
              ou problemas na operadora do cartão.
            </p>
          </div>

          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/credits">
                Tentar Novamente
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full">
              <Link href="/help">
                Preciso de Ajuda
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <PaymentCallbackContent />
    </Suspense>
  );
}