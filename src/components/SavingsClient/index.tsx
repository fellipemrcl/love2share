"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Users, TrendingDown, Calendar, PiggyBank } from "lucide-react";

interface StreamingSavings {
  streamingName: string;
  logoUrl?: string;
  originalPrice: number;
  sharedPrice: number;
  savings: number;
  groupSize: number;
  maxMembers: number;
}

interface SavingsData {
  totalMonthlySavings: number;
  totalYearlySavings: number;
  totalOriginalPrice: number;
  totalSharedPrice: number;
  streamingSavings: StreamingSavings[];
}

export default function SavingsClient() {
  const [savingsData, setSavingsData] = useState<SavingsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavingsData();
  }, []);

  const fetchSavingsData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/savings");
      
      if (!response.ok) {
        throw new Error("Erro ao carregar dados de economia");
      }

      const data = await response.json();
      setSavingsData(data);
    } catch (error) {
      console.error("Erro ao carregar economias:", error);
      toast.error("Erro ao carregar suas economias");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getSavingsPercentage = (original: number, shared: number) => {
    return Math.round(((original - shared) / original) * 100);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!savingsData) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <PiggyBank className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma economia encontrada</h3>
              <p className="text-muted-foreground">
                Você ainda não participa de nenhum grupo de compartilhamento.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <PiggyBank className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Minhas Economias</h1>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Economia Mensal</CardTitle>
            <TrendingDown className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(savingsData.totalMonthlySavings)}
            </div>
            <p className="text-xs text-muted-foreground">
              {getSavingsPercentage(savingsData.totalOriginalPrice, savingsData.totalSharedPrice)}% de economia
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Economia Anual</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(savingsData.totalYearlySavings)}
            </div>
            <p className="text-xs text-muted-foreground">
              Projeção baseada na economia mensal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gasto Atual</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(savingsData.totalSharedPrice)}
            </div>
            <p className="text-xs text-muted-foreground">
              Por mês em compartilhamentos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Seria sem Compartilhar</CardTitle>
            <DollarSign className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(savingsData.totalOriginalPrice)}
            </div>
            <p className="text-xs text-muted-foreground">
              Custo individual das assinaturas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detalhes por streaming */}
      <Card>
        <CardHeader>
          <CardTitle>Economia por Streaming</CardTitle>
          <CardDescription>
            Veja quanto você está economizando em cada serviço
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {savingsData.streamingSavings.map((streaming, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  {streaming.logoUrl && (
                    <Image
                      src={streaming.logoUrl}
                      alt={streaming.streamingName}
                      width={40}
                      height={40}
                      className="rounded object-cover"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold">{streaming.streamingName}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{streaming.groupSize}/{streaming.maxMembers} membros</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-red-600">
                      {formatCurrency(streaming.originalPrice)}
                    </Badge>
                    <span className="text-muted-foreground">→</span>
                    <Badge variant="outline" className="text-blue-600">
                      {formatCurrency(streaming.sharedPrice)}
                    </Badge>
                  </div>
                  <div className="text-sm font-semibold text-green-600">
                    Economia: {formatCurrency(streaming.savings)}/mês
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {getSavingsPercentage(streaming.originalPrice, streaming.sharedPrice)}% de desconto
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Projeção de economia */}
      <Card>
        <CardHeader>
          <CardTitle>Projeção de Economia</CardTitle>
          <CardDescription>
            Veja o impacto das suas economias ao longo do tempo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {formatCurrency(savingsData.totalMonthlySavings * 3)}
              </div>
              <div className="text-sm text-muted-foreground">Em 3 meses</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {formatCurrency(savingsData.totalMonthlySavings * 6)}
              </div>
              <div className="text-sm text-muted-foreground">Em 6 meses</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {formatCurrency(savingsData.totalYearlySavings)}
              </div>
              <div className="text-sm text-muted-foreground">Em 1 ano</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
