"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Plus, Edit, Trash2, Users, UserPlus, UserMinus, Eye, Calendar, Crown, Shield } from "lucide-react";

interface User {
  id: string;
  name: string | null;
  email: string;
}

interface Streaming {
  id: string;
  name: string;
  platform: string;
}

interface StreamingGroupStreaming {
  id: string;
  streaming: Streaming;
  accountEmail: string;
  isActive: boolean;
  accountOwner: User | null;
}

interface StreamingGroupUser {
  id: string;
  role: string;
  user: User;
  createdAt: string;
}

interface Group {
  id: string;
  name: string;
  description: string | null;
  maxMembers: number;
  createdAt: string;
  updatedAt: string;
  streamingGroupUsers: StreamingGroupUser[];
  streamingGroupStreamings: StreamingGroupStreaming[];
  _count: {
    streamingGroupUsers: number;
    streamingGroupStreamings: number;
  };
}

interface NewGroup {
  name: string;
  description: string;
  maxMembers: number;
}

export default function GroupManagement() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [newGroup, setNewGroup] = useState<NewGroup>({
    name: "",
    description: "",
    maxMembers: 2,
  });

  useEffect(() => {
    fetchGroups();
    fetchUsers();
  }, []);

  const fetchGroups = async () => {
    try {
      setError("");
      const response = await fetch("/api/admin/groups");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao carregar grupos");
      }

      setGroups(data.groups || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar grupos");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      const data = await response.json();

      if (response.ok) {
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error("Erro ao carregar usuários:", err);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/admin/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newGroup),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao criar grupo");
      }

      setSuccess("Grupo criado com sucesso!");
      setIsCreateDialogOpen(false);
      setNewGroup({ name: "", description: "", maxMembers: 2 });
      fetchGroups();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar grupo");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup) return;

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/admin/groups/${selectedGroup.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newGroup),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao atualizar grupo");
      }

      setSuccess("Grupo atualizado com sucesso!");
      setIsEditDialogOpen(false);
      setSelectedGroup(null);
      setNewGroup({ name: "", description: "", maxMembers: 2 });
      fetchGroups();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar grupo");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGroup = async (group: Group) => {
    if (!confirm(`Tem certeza que deseja deletar o grupo "${group.name}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/admin/groups/${group.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao deletar grupo");
      }

      setSuccess("Grupo deletado com sucesso!");
      fetchGroups();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao deletar grupo");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddMember = async (userId: string) => {
    if (!selectedGroup) return;

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/admin/groups/${selectedGroup.id}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao adicionar membro");
      }

      setSuccess("Membro adicionado com sucesso!");
      setIsAddMemberDialogOpen(false);
      fetchGroups();
      // Atualizar o grupo selecionado
      const updatedGroupResponse = await fetch(`/api/admin/groups/${selectedGroup.id}`);
      if (updatedGroupResponse.ok) {
        const updatedGroupData = await updatedGroupResponse.json();
        setSelectedGroup(updatedGroupData.group);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao adicionar membro");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!selectedGroup) return;

    if (!confirm("Tem certeza que deseja remover este membro do grupo?")) {
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/admin/groups/${selectedGroup.id}/members/${userId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao remover membro");
      }

      setSuccess("Membro removido com sucesso!");
      fetchGroups();
      // Atualizar o grupo selecionado
      const updatedGroupResponse = await fetch(`/api/admin/groups/${selectedGroup.id}`);
      if (updatedGroupResponse.ok) {
        const updatedGroupData = await updatedGroupResponse.json();
        setSelectedGroup(updatedGroupData.group);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao remover membro");
    } finally {
      setSubmitting(false);
    }
  };

  const openEditDialog = (group: Group) => {
    setSelectedGroup(group);
    setNewGroup({
      name: group.name,
      description: group.description || "",
      maxMembers: group.maxMembers,
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (group: Group) => {
    setSelectedGroup(group);
    setIsViewDialogOpen(true);
  };

  const openAddMemberDialog = (group: Group) => {
    setSelectedGroup(group);
    setIsAddMemberDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando grupos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gerenciamento de Grupos</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="cursor-pointer">
              <Plus className="h-4 w-4 mr-2" />
              Novo Grupo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Grupo</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateGroup} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Grupo</Label>
                <Input
                  id="name"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  placeholder="Descrição opcional do grupo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxMembers">Máximo de Membros</Label>
                <Input
                  id="maxMembers"
                  type="number"
                  min="1"
                  max="20"
                  value={newGroup.maxMembers}
                  onChange={(e) => setNewGroup({ ...newGroup, maxMembers: parseInt(e.target.value) })}
                  required
                />
              </div>
              <Button type="submit" disabled={submitting} className="w-full cursor-pointer">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Criar Grupo
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <Card key={group.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{group.name}</CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openViewDialog(group)}
                    className="cursor-pointer"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(group)}
                    className="cursor-pointer"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteGroup(group)}
                    disabled={submitting}
                    className="cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {group.description && (
                  <p className="text-sm text-muted-foreground">{group.description}</p>
                )}
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span className="text-sm">
                      {group._count.streamingGroupUsers}/{group.maxMembers} membros
                    </span>
                  </div>
                  <Badge variant={group._count.streamingGroupUsers === group.maxMembers ? "destructive" : "default"}>
                    {group._count.streamingGroupUsers === group.maxMembers ? "Cheio" : "Disponível"}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Criado em {formatDate(group.createdAt)}
                </div>

                <div className="flex gap-1 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openAddMemberDialog(group)}
                    disabled={group._count.streamingGroupUsers >= group.maxMembers}
                    className="cursor-pointer"
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    Adicionar Membro
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {groups.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Nenhum grupo encontrado</p>
            <p className="text-muted-foreground mb-4">Comece criando seu primeiro grupo</p>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="cursor-pointer">
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Grupo
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Grupo</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditGroup} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome do Grupo</Label>
              <Input
                id="edit-name"
                value={newGroup.name}
                onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                value={newGroup.description}
                onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                placeholder="Descrição opcional do grupo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-maxMembers">Máximo de Membros</Label>
              <Input
                id="edit-maxMembers"
                type="number"
                min={selectedGroup?._count.streamingGroupUsers || 1}
                max="20"
                value={newGroup.maxMembers}
                onChange={(e) => setNewGroup({ ...newGroup, maxMembers: parseInt(e.target.value) })}
                required
              />
              {selectedGroup && (
                <p className="text-sm text-muted-foreground mt-1">
                  Mínimo: {selectedGroup._count.streamingGroupUsers} (membros atuais)
                </p>
              )}
            </div>
            <Button type="submit" disabled={submitting} className="w-full cursor-pointer">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Salvar Alterações
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Grupo</DialogTitle>
          </DialogHeader>
          {selectedGroup && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg">{selectedGroup.name}</h3>
                {selectedGroup.description && (
                  <p className="text-muted-foreground">{selectedGroup.description}</p>
                )}
                <div className="flex items-center gap-4 mt-2">
                  <Badge>
                    {selectedGroup._count.streamingGroupUsers}/{selectedGroup.maxMembers} membros
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Criado em {formatDate(selectedGroup.createdAt)}
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">Membros</h4>
                  <Button
                    size="sm"
                    onClick={() => {
                      setIsViewDialogOpen(false);
                      openAddMemberDialog(selectedGroup);
                    }}
                    disabled={selectedGroup._count.streamingGroupUsers >= selectedGroup.maxMembers}
                    className="cursor-pointer"
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    Adicionar
                  </Button>
                </div>
                {selectedGroup.streamingGroupUsers.length > 0 ? (
                  <div className="space-y-2">
                    {selectedGroup.streamingGroupUsers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{member.user.name || "Sem nome"}</p>
                            {member.role === 'OWNER' && (
                              <Crown className="h-4 w-4 text-yellow-600" />
                            )}
                            {member.role === 'ADMIN' && (
                              <Shield className="h-4 w-4 text-blue-600" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{member.user.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            Desde {formatDate(member.createdAt)}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveMember(member.user.id)}
                            disabled={submitting || member.role === 'OWNER'}
                            className="cursor-pointer"
                          >
                            <UserMinus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Nenhum membro no grupo</p>
                )}
              </div>

              <div>
                <h4 className="font-semibold mb-3">Serviços de Streaming</h4>
                {selectedGroup.streamingGroupStreamings.length > 0 ? (
                  <div className="space-y-2">
                    {selectedGroup.streamingGroupStreamings.map((streaming) => (
                      <div key={streaming.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="font-medium">{streaming.streaming.name}</p>
                          <p className="text-sm text-muted-foreground">{streaming.accountEmail}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={streaming.isActive ? "default" : "secondary"}>
                            {streaming.isActive ? "Ativo" : "Inativo"}
                          </Badge>
                          {streaming.accountOwner && (
                            <span className="text-xs text-muted-foreground">
                              Dono: {streaming.accountOwner.name || streaming.accountOwner.email}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Nenhum serviço de streaming vinculado</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={isAddMemberDialogOpen} onOpenChange={setIsAddMemberDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Membro ao Grupo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Selecione um usuário para adicionar ao grupo &quot;{selectedGroup?.name}&quot;
            </p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {users
                .filter(user => !selectedGroup?.streamingGroupUsers.some(member => member.user.id === user.id))
                .map((user) => (
                <div key={user.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="font-medium">{user.name || "Sem nome"}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleAddMember(user.id)}
                    disabled={submitting}
                    className="cursor-pointer"
                  >
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                  </Button>
                </div>
              ))}
            </div>
            {users.filter(user => !selectedGroup?.streamingGroupUsers.some(member => member.user.id === user.id)).length === 0 && (
              <p className="text-muted-foreground text-center py-4">
                Todos os usuários já são membros deste grupo ou não há usuários disponíveis
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
