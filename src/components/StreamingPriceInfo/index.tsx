import { calculatePricePerScreen, formatPrice } from "@/lib/streaming-utils";

interface StreamingPriceInfoProps {
  monthlyPrice?: number | null;
  maxSimultaneousScreens: number;
  maxUsers?: number;
  className?: string;
  showAllInfo?: boolean;
}

export function StreamingPriceInfo({
  monthlyPrice,
  maxSimultaneousScreens,
  maxUsers,
  className = "",
  showAllInfo = true,
}: StreamingPriceInfoProps) {
  const calculation = calculatePricePerScreen(
    monthlyPrice,
    maxSimultaneousScreens
  );

  return (
    <div className={`space-y-4 p-4 bg-muted rounded-lg ${className}`}>
      <h3 className="font-semibold text-sm">Informações de Preço</h3>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-medium">Preço mensal:</span>
          <p className="text-muted-foreground">
            {monthlyPrice ? formatPrice(monthlyPrice) : "Não informado"}
          </p>
        </div>
        <div>
          <span className="font-medium">Preço por tela:</span>
          <p className="text-muted-foreground">
            {calculation.isValidCalculation && calculation.pricePerScreen
              ? formatPrice(calculation.pricePerScreen)
              : "Não disponível"}
          </p>
        </div>

        {showAllInfo && (
          <>
            {maxUsers && (
              <div>
                <span className="font-medium">Máx. usuários:</span>
                <p className="text-muted-foreground">{maxUsers}</p>
              </div>
            )}
            <div>
              <span className="font-medium">Telas simultâneas:</span>
              <p className="text-muted-foreground">{maxSimultaneousScreens}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
