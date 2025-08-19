"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, Plus, History, Loader2 } from "lucide-react";
import Link from "next/link";

interface CreditBalanceData {
  credits: number;
  userId: string;
  name: string;
  email: string;
}

export function CreditBalance() {
  const [balance, setBalance] = useState<CreditBalanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const response = await fetch("/api/credits/balance");
      
      if (!response.ok) {
        throw new Error("Erro ao buscar saldo");
      }

      const data = await response.json();
      setBalance(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            <p>{error}</p>
            <Button
              onClick={fetchBalance}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Coins className="h-5 w-5" />
          Seus Créditos
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">
              {balance?.credits.toLocaleString("pt-BR", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              })}
            </div>
            <p className="text-sm text-muted-foreground">créditos disponíveis</p>
          </div>

          <div className="flex gap-2 justify-center">
            <Button asChild size="sm">
              <Link href="/credits">
                <Plus className="h-4 w-4 mr-2" />
                Comprar Créditos
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/credits/history">
                <History className="h-4 w-4 mr-2" />
                Histórico
              </Link>
            </Button>
          </div>

          {balance && balance.credits > 0 && (
            <div className="text-center text-sm text-muted-foreground">
              <p>Equivale a aproximadamente</p>
              <p className="font-medium">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(balance.credits)}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}