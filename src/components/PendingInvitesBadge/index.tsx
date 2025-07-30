"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";

interface GroupWithRole {
  id: string;
  isAdmin: boolean;
  isOwner: boolean;
}

export default function PendingInvitesBadge() {
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadPendingCount = async () => {
    try {
      // Buscar grupos que o usuário administra
      const groupsResponse = await fetch('/api/groups');
      if (groupsResponse.ok) {
        const groupsData = await groupsResponse.json();
        const adminGroups = groupsData.groups?.filter((group: GroupWithRole) => 
          group.isAdmin || group.isOwner
        ) || [];

        // Contar solicitações pendentes de todos os grupos
        let totalPending = 0;
        for (const group of adminGroups) {
          const requestsResponse = await fetch(`/api/groups/${group.id}/join-requests`);
          if (requestsResponse.ok) {
            const requestsData = await requestsResponse.json();
            totalPending += requestsData.joinRequests?.length || 0;
          }
        }
        setPendingCount(totalPending);
      }
    } catch (error) {
      console.error("Erro ao carregar contagem de solicitações pendentes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingCount();
    // Recarregar a cada 30 segundos
    const interval = setInterval(loadPendingCount, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading || pendingCount === 0) {
    return null;
  }

  return (
    <Badge variant="destructive" className="ml-1 text-xs">
      {pendingCount}
    </Badge>
  );
}
