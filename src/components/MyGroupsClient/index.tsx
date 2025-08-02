"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Settings, Users, Crown, Shield, User, Plus, UserMinus, Loader2 } from "lucide-react";
import { CreateGroupForm } from "../CreateGroupForm";

interface User {
  id: string;
  name: string;
  email: string;
}

interface StreamingGroupUser {
  id: string;
  userId: string;
  role: string;
  user: User;
  createdAt: string;
  updatedAt: string;
}

interface StreamingGroupStreaming {
  streaming: {
    id: string;
    name: string;
    logoUrl?: string;
    monthlyPrice?: number;
  };
}

interface ManagedGroup {
  id: string;
  name: string;
  description?: string;
  maxMembers: number;
  createdAt: string;
  createdBy: User;
  streamingGroupUsers: StreamingGroupUser[];
  streamingGroupStreamings: StreamingGroupStreaming[];
  userRole: string;
  isOwner: boolean;
  isAdmin: boolean;
  canManage: boolean;
  availableSlots: number;
  currentUserId: string; // ID do usuário atual
  _count: {
    streamingGroupUsers: number;
    streamingGroupStreamings: number;
  };
}

export default function MyGroupsClient() {
  const [groups, setGroups] = useState<ManagedGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ManagedGroup | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    maxMembers: 2,
  });
  const [saving, setSaving] = useState(false);
  const [leavingGroup, setLeavingGroup] = useState<string | null>(null);
  const [removingMember, setRemovingMember] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/groups/my');
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
  }, []);

  const openEditDialog = (group: ManagedGroup) => {
    setEditingGroup(group);
    setEditForm({
      name: group.name, // Manter para não quebrar a interface, mas não será editável
      description: group.description || "",
      maxMembers: group.maxMembers,
    });
    setIsEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setEditingGroup(null);
    setEditForm({
      name: "",
      description: "",
      maxMembers: 2,
    });
    setIsEditDialogOpen(false);
  };

  const saveGroup = async () => {
    if (!editingGroup) return;

    setSaving(true);
    try {
      const response = await fetch('/api/groups/my', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupId: editingGroup.id,
          description: editForm.description,
          maxMembers: editForm.maxMembers,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log(data.message);
        toast("Configurações atualizadas!", {
          description: "As alterações do grupo foram salvas com sucesso.",
        });
        fetchGroups(); // Recarregar a lista
        closeEditDialog();
      } else {
        console.error(data.error || "Erro ao atualizar grupo");
        toast.error("Erro ao atualizar grupo", {
          description: data.error || "Ocorreu um erro inesperado. Tente novamente.",
        });
      }
    } catch (error) {
      console.error("Erro ao atualizar grupo:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateGroup = async (values: { streamingId: string; maxMembers: number }) => {
    try {
      setIsCreatingGroup(true);
      console.log("Criando grupo:", values);
      
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      
      if (response.ok) {
        await response.json();
        console.log("Grupo criado com sucesso!");
        setIsCreateDialogOpen(false); // Fechar o modal
        toast("Grupo criado com sucesso!", {
          description: `Seu grupo foi criado e está pronto para receber membros.`,
        });
        fetchGroups(); // Recarregar a lista de grupos
      } else {
        const errorData = await response.json();
        console.error("Erro ao criar grupo:", errorData.error);
        toast.error("Erro ao criar grupo", {
          description: errorData.error || "Ocorreu um erro inesperado. Tente novamente.",
        });
      }
    } catch (error) {
      console.error("Erro ao criar grupo:", error);
      toast.error("Erro ao criar grupo", {
        description: "Ocorreu um erro inesperado. Verifique sua conexão e tente novamente.",
      });
    } finally {
      setIsCreatingGroup(false);
    }
  };

  const leaveGroup = async (groupId: string) => {
    setLeavingGroup(groupId);
    try {
      const response = await fetch('/api/groups/leave', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ groupId }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log(data.message);
        toast("Você saiu do grupo", {
          description: "Você foi removido do grupo com sucesso.",
        });
        fetchGroups(); // Recarregar a lista
      } else {
        console.error(data.error || "Erro ao sair do grupo");
        toast.error("Erro ao sair do grupo", {
          description: data.error || "Ocorreu um erro inesperado. Tente novamente.",
        });
      }
    } catch (error) {
      console.error("Erro ao sair do grupo:", error);
      toast.error("Erro ao sair do grupo", {
        description: "Ocorreu um erro inesperado. Verifique sua conexão e tente novamente.",
      });
    } finally {
      setLeavingGroup(null);
    }
  };

  const removeMember = async (groupId: string, userId: string, memberName: string) => {
    if (!confirm(`Tem certeza que deseja remover ${memberName} do grupo?`)) {
      return;
    }

    setRemovingMember(userId);
    try {
      const response = await fetch(`/api/groups/${groupId}/members/${userId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        toast("Membro removido", {
          description: `${memberName} foi removido do grupo com sucesso.`,
        });
        fetchGroups(); // Recarregar a lista
      } else {
        console.error(data.error || "Erro ao remover membro");
        toast.error("Erro ao remover membro", {
          description: data.error || "Ocorreu um erro inesperado. Tente novamente.",
        });
      }
    } catch (error) {
      console.error("Erro ao remover membro:", error);
      toast.error("Erro ao remover membro", {
        description: "Ocorreu um erro inesperado. Verifique sua conexão e tente novamente.",
      });
    } finally {
      setRemovingMember(null);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'OWNER':
        return <Crown className="h-4 w-4 text-yellow-600" />;
      case 'ADMIN':
        return <Shield className="h-4 w-4 text-blue-600" />;
      default:
        return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'OWNER':
        return "default" as const;
      case 'ADMIN':
        return "secondary" as const;
      default:
        return "outline" as const;
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  return (
    <div>
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando grupos...</p>
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum grupo encontrado</h3>
          <p className="text-muted-foreground mb-4">
            Você ainda não faz parte de nenhum grupo
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Criar Primeiro Grupo
          </Button>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Seus Grupos</h2>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Novo Grupo
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <Card key={group.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex flex-col gap-2">
                      <CardTitle className="text-lg">
                        {group.name}
                      </CardTitle>
                      <Badge variant={getRoleBadgeVariant(group.userRole)} className="flex items-center gap-1 w-fit">
                        {getRoleIcon(group.userRole)}
                        {group.userRole}
                      </Badge>
                    </div>
                    <CardDescription className="mt-2">
                      Criado por {group.createdBy.name || group.createdBy.email}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {group.canManage && (
                      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
                        if (!open) {
                          closeEditDialog();
                        }
                        setIsEditDialogOpen(open);
                      }}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => openEditDialog(group)}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Editar Grupo</DialogTitle>
                            <DialogDescription>
                              Faça alterações no seu grupo
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-6">
                            <div className="space-y-2">
                              <Label htmlFor="description">Descrição</Label>
                              <Textarea
                                id="description"
                                value={editForm.description}
                                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Descrição opcional do grupo"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="maxMembers">Máximo de Membros</Label>
                              <Input
                                id="maxMembers"
                                type="number"
                                min="2"
                                max="10"
                                value={editForm.maxMembers}
                                onChange={(e) => setEditForm(prev => ({ ...prev, maxMembers: parseInt(e.target.value) || 2 }))}
                              />
                              <p className="text-xs text-muted-foreground">
                                Limite baseado no streaming associado. Você pode escolher quantas vagas disponibilizar.
                              </p>
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                              <Button variant="outline" onClick={closeEditDialog}>
                                Cancelar
                              </Button>
                              <Button onClick={saveGroup} disabled={saving}>
                                {saving ? "Salvando..." : "Salvar"}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                    {!group.isOwner && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => leaveGroup(group.id)}
                        disabled={leavingGroup === group.id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        {leavingGroup === group.id ? "Saindo..." : "Sair"}
                      </Button>
                    )}
                  </div>
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
                      {group.streamingGroupStreamings.map((sgs, index) => (
                        <Badge key={index} variant="secondary">
                          {sgs.streaming.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Membros do grupo */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">Membros ({group._count.streamingGroupUsers}/{group.maxMembers}):</h4>
                  <div className="space-y-2">
                    {/* Se for owner ou admin, mostrar todos os membros com opção de remoção */}
                    {group.canManage ? (
                      group.streamingGroupUsers.map((member) => (
                        <div key={member.id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">
                              {member.user.name || member.user.email}
                            </span>
                            <Badge variant={getRoleBadgeVariant(member.role)} className="flex items-center gap-1 text-xs">
                              {getRoleIcon(member.role)}
                              {member.role}
                            </Badge>
                          </div>
                          {/* Mostrar botão de remoção apenas se não for o próprio usuário e não for OWNER */}
                          {member.role !== 'OWNER' && member.userId !== group.currentUserId && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeMember(group.id, member.userId, member.user.name || member.user.email)}
                              disabled={removingMember === member.userId}
                              className="h-6 w-6 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
                            >
                              {removingMember === member.userId ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <UserMinus className="h-3 w-3" />
                              )}
                            </Button>
                          )}
                        </div>
                      ))
                    ) : (
                      /* Se não for owner ou admin, mostrar apenas os primeiros 3 membros */
                      <>
                        {group.streamingGroupUsers.slice(0, 3).map((member) => (
                          <div key={member.id} className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              {member.user.name || member.user.email}
                            </span>
                            <Badge variant={getRoleBadgeVariant(member.role)} className="flex items-center gap-1 text-xs">
                              {getRoleIcon(member.role)}
                              {member.role}
                            </Badge>
                          </div>
                        ))}
                        {group.streamingGroupUsers.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            +{group.streamingGroupUsers.length - 3} mais
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Vagas disponíveis:</span>
                    <span className="font-medium">{group.availableSlots}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Criado em:</span>
                    <span>{new Date(group.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        </>
      )}

      {/* Diálogo de criação de grupos */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Criar Novo Grupo</DialogTitle>
            <DialogDescription>
              Preencha as informações abaixo para criar um grupo e compartilhar sua conta de streaming.
            </DialogDescription>
          </DialogHeader>
          <CreateGroupForm onSubmit={handleCreateGroup} isSubmitting={isCreatingGroup} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
