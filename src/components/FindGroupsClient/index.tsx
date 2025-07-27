"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Users, DollarSign } from "lucide-react";

interface Streaming {
  id: string;
  name: string;
  logoUrl?: string;
  monthlyPrice?: number;
  maxUsers: number;
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface GroupWithDetails {
  id: string;
  name: string;
  description?: string;
  maxMembers: number;
  createdAt: string;
  createdBy: User;
  streamingGroupStreamings: Array<{
    streaming: Streaming;
  }>;
  streamingGroupUsers: Array<{
    user: User;
    role: string;
  }>;
  _count: {
    streamingGroupUsers: number;
  };
  availableSlots: number;
  pricePerMember: number;
}

interface FindGroupsClientProps {
  initialStreamings: Streaming[];
}

export default function FindGroupsClient({ initialStreamings }: FindGroupsClientProps) {
  const [groups, setGroups] = useState<GroupWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [joining, setJoining] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedStreaming, setSelectedStreaming] = useState<string>("all");

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedStreaming && selectedStreaming !== "all") params.append('streamingId', selectedStreaming);

      const response = await fetch(`/api/groups/find?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setGroups(data.groups);
      } else {
        console.error(data.error || "Erro ao buscar grupos");
      }
    } catch (error) {
      console.error("Erro ao buscar grupos:", error);
    } finally {
      setLoading(false);
    }
  }, [search, selectedStreaming]);

  const joinGroup = async (groupId: string) => {
    setJoining(groupId);
    try {
      const response = await fetch('/api/groups/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ groupId }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log(data.message);
        toast("Você entrou no grupo!", {
          description: "Parabéns! Agora você faz parte do grupo.",
          action: {
            label: "Ver meus grupos",
            onClick: () => window.location.href = '/groups/my',
          },
        });
        // Remover o grupo da lista após entrar
        setGroups(groups.filter(g => g.id !== groupId));
      } else {
        console.error(data.error || "Erro ao entrar no grupo");
        toast.error("Erro ao entrar no grupo", {
          description: data.error || "Ocorreu um erro inesperado. Tente novamente.",
        });
      }
    } catch (error) {
      console.error("Erro ao entrar no grupo:", error);
      toast.error("Erro ao entrar no grupo", {
        description: "Ocorreu um erro inesperado. Verifique sua conexão e tente novamente.",
      });
    } finally {
      setJoining(null);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchGroups();
    }, 500);

    return () => clearTimeout(debounce);
  }, [fetchGroups]);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Encontrar Grupos</h1>
        <p className="text-muted-foreground">
          Encontre grupos de streaming criados por outros usuários e participe!
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar grupos por nome ou descrição..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedStreaming} onValueChange={setSelectedStreaming}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filtrar por streaming" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os streamings</SelectItem>
            {initialStreamings.map((streaming) => (
              <SelectItem key={streaming.id} value={streaming.id}>
                {streaming.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Lista de grupos */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Buscando grupos...</p>
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum grupo encontrado</h3>
          <p className="text-muted-foreground">
            {search || (selectedStreaming && selectedStreaming !== "all") 
              ? "Tente ajustar os filtros para encontrar grupos"
              : "Não há grupos disponíveis no momento"
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <Card key={group.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{group.name}</CardTitle>
                    <CardDescription className="mt-1">
                      Criado por {group.createdBy.name || group.createdBy.email}
                    </CardDescription>
                  </div>
                  {group.availableSlots <= 2 && (
                    <Badge variant="destructive" className="ml-2">
                      {group.availableSlots === 1 ? "Última vaga!" : "Poucas vagas!"}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {group.description && (
                  <p className="text-sm text-muted-foreground mb-4">
                    {group.description}
                  </p>
                )}

                {/* Streamings do grupo */}
                {group.streamingGroupStreamings.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">Streamings:</h4>
                    <div className="flex flex-wrap gap-2">
                      {group.streamingGroupStreamings.map((sgs) => (
                        <Badge key={sgs.streaming.id} variant="secondary">
                          {sgs.streaming.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Membros:</span>
                    <span>
                      {group._count.streamingGroupUsers}/{group.maxMembers}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Vagas disponíveis:</span>
                    <span className="font-medium">{group.availableSlots}</span>
                  </div>
                  {group.pricePerMember > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Preço estimado/mês:</span>
                      <span className="font-medium flex items-center">
                        <DollarSign className="h-3 w-3 mr-1" />
                        {group.pricePerMember.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => joinGroup(group.id)}
                  disabled={joining === group.id}
                  className="w-full"
                >
                  {joining === group.id ? "Entrando..." : "Participar do Grupo"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
