/**
 * Utilidades para cálculos relacionados a streaming
 * Garante que os cálculos sejam sempre consistentes e seguros
 */

export interface StreamingPriceCalculation {
  monthlyPrice: number | null;
  maxSimultaneousScreens: number;
  pricePerScreen: number | null;
  isValidCalculation: boolean;
}

/**
 * Calcula o preço por tela de forma segura
 * @param monthlyPrice - Preço mensal do streaming
 * @param maxSimultaneousScreens - Número máximo de telas simultâneas
 * @returns Objeto com o cálculo e validação
 */
export function calculatePricePerScreen(
  monthlyPrice: number | null | undefined,
  maxSimultaneousScreens: number
): StreamingPriceCalculation {
  // Validações de segurança
  if (!monthlyPrice || monthlyPrice <= 0) {
    return {
      monthlyPrice: monthlyPrice || null,
      maxSimultaneousScreens,
      pricePerScreen: null,
      isValidCalculation: false
    };
  }

  if (!maxSimultaneousScreens || maxSimultaneousScreens <= 0) {
    return {
      monthlyPrice,
      maxSimultaneousScreens,
      pricePerScreen: null,
      isValidCalculation: false
    };
  }

  // Cálculo seguro
  const pricePerScreen = monthlyPrice / maxSimultaneousScreens;

  return {
    monthlyPrice,
    maxSimultaneousScreens,
    pricePerScreen: Math.round(pricePerScreen * 100) / 100, // Arredonda para 2 casas decimais
    isValidCalculation: true
  };
}

/**
 * Calcula o total que um usuário deve pagar baseado no número de telas que usa
 * @param monthlyPrice - Preço mensal do streaming
 * @param maxSimultaneousScreens - Número máximo de telas simultâneas
 * @param userScreens - Número de telas que o usuário irá usar
 * @returns Valor que o usuário deve pagar
 */
export function calculateUserPayment(
  monthlyPrice: number | null | undefined,
  maxSimultaneousScreens: number,
  userScreens: number = 1
): number | null {
  const calculation = calculatePricePerScreen(monthlyPrice, maxSimultaneousScreens);
  
  if (!calculation.isValidCalculation || !calculation.pricePerScreen) {
    return null;
  }

  if (userScreens <= 0 || userScreens > maxSimultaneousScreens) {
    return null;
  }

  return Math.round(calculation.pricePerScreen * userScreens * 100) / 100;
}

/**
 * Formata o preço para exibição
 * @param price - Preço a ser formatado
 * @param currency - Moeda (padrão: BRL)
 * @returns String formatada do preço
 */
export function formatPrice(price: number | null, currency: string = 'BRL'): string {
  if (!price) return 'Preço não disponível';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency
  }).format(price);
}
