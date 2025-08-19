"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Coins, 
  CreditCard, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Loader2, 
  Receipt,
  Plus,
  Minus,
  RefreshCw
} from "lucide-react";
import Link from "next/link";

interface CreditTransaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  createdAt: string;
  paymentTransaction?: {
    orderNsu: string;
    paymentMethod: string;
    receiptUrl: string;
  };
}

interface PaymentTransaction {
  id: string;
  orderNsu: string;
  amount: number;
  status: string;
  paymentMethod: string;
  transactionNsu: string;
  receiptUrl: string;
  creditsAwarded: number;
  createdAt: string;
  creditTransactions: Array<{
    id: string;
    amount: number;
    description: string;
    createdAt: string;
  }>;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function CreditHistory() {
  const [creditTransactions, setCreditTransactions] = useState<CreditTransaction[]>([]);
  const [paymentTransactions, setPaymentTransactions] = useState<PaymentTransaction[]>([]);
  const [creditPagination, setCreditPagination] = useState<PaginationData | null>(null);
  const [paymentPagination, setPaymentPagination] = useState<PaginationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [creditResponse, paymentResponse] = await Promise.all([
        fetch("/api/credits/transactions"),
        fetch("/api/payments/history"),
      ]);

      if (!creditResponse.ok || !paymentResponse.ok) {
        throw new Error("Erro ao buscar dados");
      }

      const creditData = await creditResponse.json();
      const paymentData = await paymentResponse.json();

      setCreditTransactions(creditData.transactions);
      setCreditPagination(creditData.pagination);
      setPaymentTransactions(paymentData.payments);
      setPaymentPagination(paymentData.pagination);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  const getTransactionTypeIcon = (type: string) => {
    switch (type) {
      case "PURCHASE":
        return <Plus className="h-4 w-4 text-green-600" />;
      case "SPEND":
        return <Minus className="h-4 w-4 text-red-600" />;
      case "REFUND":
        return <RefreshCw className="h-4 w-4 text-blue-600" />;
      case "BONUS":
        return <Plus className="h-4 w-4 text-purple-600" />;
      case "ADJUSTMENT":
        return <RefreshCw className="h-4 w-4 text-orange-600" />;
      default:
        return <Coins className="h-4 w-4" />;
    }
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case "PURCHASE":
        return "bg-green-100 text-green-800";
      case "SPEND":
        return "bg-red-100 text-red-800";
      case "REFUND":
        return "bg-blue-100 text-blue-800";
      case "BONUS":
        return "bg-purple-100 text-purple-800";
      case "ADJUSTMENT":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      PENDING: { label: "Pendente", variant: "secondary" as const },
      PAID: { label: "Pago", variant: "default" as const },
      FAILED: { label: "Falhou", variant: "destructive" as const },
      CANCELLED: { label: "Cancelado", variant: "secondary" as const },
      REFUNDED: { label: "Reembolsado", variant: "outline" as const },
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || { 
      label: status, 
      variant: "secondary" as const 
    };

    return (
      <Badge variant={statusInfo.variant}>
        {statusInfo.label}
      </Badge>
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchData} variant="outline">
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Histórico</h1>
          <p className="text-muted-foreground">
            Visualize seu histórico de créditos e pagamentos
          </p>
        </div>
        <Button asChild>
          <Link href="/credits">
            <Plus className="h-4 w-4 mr-2" />
            Comprar Créditos
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="credits" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="credits" className="flex items-center gap-2">
            <Coins className="h-4 w-4" />
            Transações de Crédito
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Pagamentos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="credits">
          <Card>
            <CardHeader>
              <CardTitle>Transações de Crédito</CardTitle>
            </CardHeader>
            <CardContent>
              {creditTransactions.length === 0 ? (
                <div className="text-center py-8">
                  <Coins className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Nenhuma transação de crédito encontrada
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {creditTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        {getTransactionTypeIcon(transaction.type)}
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(transaction.createdAt)}
                          </p>
                          {transaction.paymentTransaction && (
                            <p className="text-xs text-muted-foreground">
                              Pedido: {transaction.paymentTransaction.orderNsu.slice(-8)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-sm font-medium ${getTransactionTypeColor(transaction.type)}`}>
                          {transaction.amount > 0 ? "+" : ""}
                          {transaction.amount.toLocaleString("pt-BR", {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                        {transaction.paymentTransaction?.receiptUrl && (
                          <div className="mt-1">
                            <Button
                              asChild
                              variant="ghost"
                              size="sm"
                            >
                              <a
                                href={transaction.paymentTransaction.receiptUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Receipt className="h-3 w-3" />
                              </a>
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Pagamentos</CardTitle>
            </CardHeader>
            <CardContent>
              {paymentTransactions.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Nenhum pagamento encontrado
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {paymentTransactions.map((payment) => (
                    <div
                      key={payment.id}
                      className="p-4 border rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          <span className="font-medium">
                            Pedido: {payment.orderNsu.slice(-8)}
                          </span>
                        </div>
                        {getStatusBadge(payment.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Valor</p>
                          <p className="font-medium">
                            {formatCurrency(payment.amount / 100)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Método</p>
                          <p className="font-medium">
                            {payment.paymentMethod || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Créditos</p>
                          <p className="font-medium text-green-600">
                            +{payment.creditsAwarded.toLocaleString("pt-BR")}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3 pt-2 border-t">
                        <p className="text-xs text-muted-foreground">
                          {formatDate(payment.createdAt)}
                        </p>
                        {payment.receiptUrl && (
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                          >
                            <a
                              href={payment.receiptUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Receipt className="h-3 w-3 mr-1" />
                              Comprovante
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}