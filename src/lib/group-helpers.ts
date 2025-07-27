import prisma from './prisma';

/**
 * Calcula o número máximo de membros para um grupo baseado nos streamings associados
 * Fórmula: número máximo de telas simultâneas do streaming (admin já incluído)
 */
export async function calculateMaxMembersForGroup(groupId: string): Promise<number> {
  // Buscar todos os streamings associados ao grupo
  const groupStreamings = await prisma.streamingGroupStreaming.findMany({
    where: { streamingGroupId: groupId },
    include: {
      streaming: {
        select: {
          maxSimultaneousScreens: true,
          maxUsers: true,
        },
      },
    },
  });

  if (groupStreamings.length === 0) {
    // Se não há streamings associados, usar um valor padrão de 2
    return 2;
  }

  // Encontrar o streaming com maior número de telas simultâneas
  const maxScreens = Math.max(
    ...groupStreamings.map((gs) => gs.streaming.maxSimultaneousScreens)
  );

  // Retornar número de telas (admin já está incluído no número de telas)
  return maxScreens;
}

/**
 * Atualiza automaticamente o maxMembers de um grupo baseado nos streamings associados
 */
export async function updateGroupMaxMembers(groupId: string): Promise<void> {
  const newMaxMembers = await calculateMaxMembersForGroup(groupId);
  
  // Verificar o número atual de membros para não reduzir abaixo do necessário
  const currentMemberCount = await prisma.streamingGroupUser.count({
    where: { streamingGroupId: groupId },
  });

  // Usar o maior valor entre o calculado e o número atual de membros
  const finalMaxMembers = Math.max(newMaxMembers, currentMemberCount);

  await prisma.streamingGroup.update({
    where: { id: groupId },
    data: { maxMembers: finalMaxMembers },
  });
}

/**
 * Valida se um grupo pode ter um determinado número de membros baseado nos streamings
 */
export async function validateGroupMemberLimit(groupId: string, requestedMembers: number): Promise<{ valid: boolean; maxAllowed: number; reason?: string }> {
  const calculatedMax = await calculateMaxMembersForGroup(groupId);
  
  if (requestedMembers <= calculatedMax) {
    return { valid: true, maxAllowed: calculatedMax };
  }

  return {
    valid: false,
    maxAllowed: calculatedMax,
    reason: `O número máximo de membros permitido é ${calculatedMax} (baseado no número de telas simultâneas do streaming)`,
  };
}
