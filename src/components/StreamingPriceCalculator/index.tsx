"use client"

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { calculatePricePerScreen, formatPrice } from "@/lib/streaming-utils";

interface StreamingPriceCalculatorProps {
  initialMonthlyPrice?: number;
  initialMaxScreens?: number;
  onPriceChange?: (monthlyPrice: number | null) => void;
  onScreensChange?: (maxScreens: number) => void;
  disabled?: boolean;
}

export function StreamingPriceCalculator({
  initialMonthlyPrice = 0,
  initialMaxScreens = 1,
  onPriceChange,
  onScreensChange,
  disabled = false
}: StreamingPriceCalculatorProps) {
  const [monthlyPrice, setMonthlyPrice] = useState<string>(
    initialMonthlyPrice ? initialMonthlyPrice.toString() : ""
  );
  const [maxScreens, setMaxScreens] = useState<string>(
    initialMaxScreens.toString()
  );

  // Calcular o preço por tela sempre que os valores mudarem
  const calculation = calculatePricePerScreen(
    monthlyPrice ? parseFloat(monthlyPrice) : null,
    parseInt(maxScreens) || 1
  );

  useEffect(() => {
    onPriceChange?.(monthlyPrice ? parseFloat(monthlyPrice) : null);
  }, [monthlyPrice, onPriceChange]);

  useEffect(() => {
    onScreensChange?.(parseInt(maxScreens) || 1);
  }, [maxScreens, onScreensChange]);

  const handlePriceChange = (value: string) => {
    // Permitir apenas números e ponto decimal
    const sanitized = value.replace(/[^0-9.]/g, '');
    // Evitar múltiplos pontos decimais
    const parts = sanitized.split('.');
    const formatted = parts.length > 2 
      ? parts[0] + '.' + parts.slice(1).join('')
      : sanitized;
    
    setMonthlyPrice(formatted);
  };

  const handleScreensChange = (value: string) => {
    // Permitir apenas números inteiros
    const sanitized = value.replace(/[^0-9]/g, '');
    // Limitar a um valor mínimo de 1
    const num = parseInt(sanitized) || 1;
    setMaxScreens(Math.max(1, num).toString());
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="monthlyPrice">Preço mensal (R$)</Label>
          <Input
            id="monthlyPrice"
            type="text"
            value={monthlyPrice}
            onChange={(e) => handlePriceChange(e.target.value)}
            placeholder="0.00"
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxScreens">Telas simultâneas</Label>
          <Input
            id="maxScreens"
            type="text"
            value={maxScreens}
            onChange={(e) => handleScreensChange(e.target.value)}
            placeholder="1"
            disabled={disabled}
          />
        </div>
      </div>

      {/* Resultado do cálculo */}
      <div className="p-4 bg-muted rounded-lg border">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-sm">Preço por tela individual:</h4>
          <div className="text-right">
            {calculation.isValidCalculation && calculation.pricePerScreen ? (
              <div className="text-lg font-semibold text-primary">
                {formatPrice(calculation.pricePerScreen)}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                Não disponível
              </div>
            )}
          </div>
        </div>

        {calculation.isValidCalculation && calculation.pricePerScreen && (
          <div className="mt-2 pt-2 border-t border-muted-foreground/20">
            <p className="text-xs text-muted-foreground">
              Cada pessoa pagará {formatPrice(calculation.pricePerScreen)} por tela.
              {parseInt(maxScreens) > 1 && (
                <span>
                  {" "}Para usar todas as {maxScreens} telas: {formatPrice(calculation.monthlyPrice || 0)}.
                </span>
              )}
            </p>
          </div>
        )}

        {!calculation.isValidCalculation && (
          <div className="mt-2 pt-2 border-t border-muted-foreground/20">
            <p className="text-xs text-red-500">
              ⚠️ Informe um preço mensal válido e pelo menos 1 tela simultânea.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
