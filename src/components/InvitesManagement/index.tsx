"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, CheckCircle, XCircle, Users, Calendar } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
}

interface Streaming {
  id: string;
  name: string;
  platform: string;
  logoUrl?: string;
}

interface StreamingGroup {
  id: string;
  name: string;
  description?: string;
  maxMembers: number;
  createdBy: User;
  streamingGroupStreamings: Array<{
    streaming: Streaming;
  }>;
  _count: {
    streamingGroupUsers: number;
  };
}

interface JoinRequest {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestMessage?: string;
  responseMessage?: string;
  requestedAt: string;
  respondedAt?: string;
  user?: User;
  streamingGroup: StreamingGroup;
  respondedBy?: User;
}

interface GroupWithRole {
  id: string;
  name: string;
  description?: string;
  maxMembers: number;
  isAdmin: boolean;
  isOwner: boolean;
  streamingGroupStreamings: Array<{
    streaming: Streaming;
  }>;
  _count: {
    streamingGroupUsers: number;
  };
}

export default function InvitesManagement() {
  const [myRequests, setMyRequests] = useState<JoinRequest[]>([]);
  const [pendingRequests, setPendingRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const loadMyRequests = async () => {
    try {
      const response = await fetch('/api/join-requests/my');
      if (response.ok) {
        const data = await response.json();
        setMyRequests(data.joinRequests || []);
      }
    } catch (error) {
      console.error("Erro ao carregar minhas solicitações:", error);
    }
  };

  const loadPendingRequests = async () => {
    try {
      // Buscar solicitações pendentes de todos os grupos que o usuário administra
      const response = await fetch('/api/groups');
      if (response.ok) {
        const data = await response.json();
        const adminGroups = data.groups?.filter((group: GroupWithRole) => 
          group.isAdmin || group.isOwner
        ) || [];

        // Para cada grupo administrado, buscar as solicitações pendentes
        const allPendingRequests: JoinRequest[] = [];
        for (const group of adminGroups) {
          const requestsResponse = await fetch(`/api/groups/${group.id}/join-requests`);
          if (requestsResponse.ok) {
            const requestsData = await requestsResponse.json();
            const groupRequests = requestsData.joinRequests?.map((req: JoinRequest) => ({
              ...req,
              streamingGroup: group,
            })) || [];
            allPendingRequests.push(...groupRequests);
          }
        }
        setPendingRequests(allPendingRequests);
      }
    } catch (error) {
      console.error("Erro ao carregar solicitações pendentes:", error);
    }
  };

  const handleRequest = async (requestId: string, groupId: string, action: 'approve' | 'reject', responseMessage?: string) => {
    setProcessing(requestId);
    try {
      const response = await fetch(`/api/groups/${groupId}/join-requests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, responseMessage }),
      });

      const data = await response.json();

      if (response.ok) {
        toast(action === 'approve' ? "Solicitação aprovada!" : "Solicitação rejeitada!", {
          description: data.message,
        });
        // Recarregar as solicitações
        loadPendingRequests();
      } else {
        toast.error("Erro ao processar solicitação", {
          description: data.error || "Ocorreu um erro inesperado.",
        });
      }
    } catch (error) {
      console.error("Erro ao processar solicitação:", error);
      toast.error("Erro ao processar solicitação", {
        description: "Ocorreu um erro inesperado. Tente novamente.",
      });
    } finally {
      setProcessing(null);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadMyRequests(), loadPendingRequests()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
      case 'APPROVED':
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="w-3 h-3 mr-1" />Aprovado</Badge>;
      case 'REJECTED':
        return <Badge variant="outline" className="text-red-600 border-red-600"><XCircle className="w-3 h-3 mr-1" />Rejeitado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="text-gray-500">Carregando...</div>
      </div>
    );
  }

  return (
    <Tabs defaultValue="my-requests" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="my-requests">Minhas Solicitações ({myRequests.length})</TabsTrigger>
        <TabsTrigger value="manage-requests">Gerenciar Solicitações ({pendingRequests.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="my-requests" className="space-y-4">
        <div className="space-y-4">
          {myRequests.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 text-center">
                  Você não possui solicitações de participação em grupos.
                </p>
              </CardContent>
            </Card>
          ) : (
            myRequests.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{request.streamingGroup.name}</CardTitle>
                      <CardDescription>
                        {request.streamingGroup.description}
                      </CardDescription>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      Solicitado em: {formatDate(request.requestedAt)}
                    </div>
                    
                    {request.streamingGroup.streamingGroupStreamings.length > 0 && (
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="font-medium">Streaming:</span>
                        <span className="ml-1">
                          {request.streamingGroup.streamingGroupStreamings[0].streaming.name}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      {request.streamingGroup._count.streamingGroupUsers}/{request.streamingGroup.maxMembers} membros
                    </div>

                    {request.requestMessage && (
                      <div className="p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Sua mensagem:</span> {request.requestMessage}
                        </p>
                      </div>
                    )}

                    {request.responseMessage && (
                      <div className="p-3 bg-blue-50 rounded-md">
                        <p className="text-sm text-blue-700">
                          <span className="font-medium">Resposta do administrador:</span> {request.responseMessage}
                        </p>
                      </div>
                    )}

                    {request.respondedAt && (
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="w-3 h-3 mr-1" />
                        Respondido em: {formatDate(request.respondedAt)}
                        {request.respondedBy && (
                          <span className="ml-2">por {request.respondedBy.name}</span>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </TabsContent>

      <TabsContent value="manage-requests" className="space-y-4">
        <div className="space-y-4">
          {pendingRequests.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Users className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 text-center">
                  Não há solicitações pendentes para seus grupos.
                </p>
              </CardContent>
            </Card>
          ) : (
            pendingRequests.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {request.user?.name} quer participar de &quot;{request.streamingGroup.name}&quot;
                      </CardTitle>
                      <CardDescription>
                        {request.user?.email}
                      </CardDescription>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      Solicitado em: {formatDate(request.requestedAt)}
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      Grupo: {request.streamingGroup._count.streamingGroupUsers}/{request.streamingGroup.maxMembers} membros
                    </div>

                    {request.requestMessage && (
                      <div className="p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Mensagem:</span> {request.requestMessage}
                        </p>
                      </div>
                    )}

                    {request.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleRequest(request.id, request.streamingGroup.id, 'approve')}
                          disabled={processing === request.id}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          {processing === request.id ? "Processando..." : "Aprovar"}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRequest(request.id, request.streamingGroup.id, 'reject')}
                          disabled={processing === request.id}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          {processing === request.id ? "Processando..." : "Rejeitar"}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}
