import prisma from './prisma';
import { calculatePricePerScreen } from './streaming-utils';
import { StreamingWithPricing } from '@/types/streaming';

type Streaming = NonNullable<Awaited<ReturnType<typeof prisma.streaming.findFirst>>>;

/**
 * Adiciona cálculos de preço seguros aos dados do streaming
 * @param streaming - Dados do streaming do banco
 * @returns Streaming com cálculos de preço
 */
export function addPricingCalculations(streaming: Streaming): StreamingWithPricing {
  const calculation = calculatePricePerScreen(
    streaming.monthlyPrice,
    streaming.maxSimultaneousScreens
  );

  return {
    ...streaming,
    pricePerScreen: calculation.pricePerScreen,
    isValidPricing: calculation.isValidCalculation
  };
}

/**
 * Adiciona cálculos de preço para uma lista de streamings
 * @param streamings - Lista de streamings do banco
 * @returns Lista de streamings com cálculos de preço
 */
export function addPricingCalculationsToList(streamings: Streaming[]): StreamingWithPricing[] {
  return streamings.map(addPricingCalculations);
}

/**
 * Middleware para APIs que trabalham com streamings
 * Automaticamente adiciona os cálculos de preço na resposta
 */
export function withPricingCalculations<T extends Streaming>(data: T): T & { pricePerScreen: number | null; isValidPricing: boolean };
export function withPricingCalculations<T extends Streaming>(data: T[]): Array<T & { pricePerScreen: number | null; isValidPricing: boolean }>;
export function withPricingCalculations<T extends Streaming>(data: T | T[]) {
  if (Array.isArray(data)) {
    return addPricingCalculationsToList(data);
  }
  return addPricingCalculations(data);
}
