"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Settings, Users, Crown, Shield, User, Plus } from "lucide-react";

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
  availableSlots: number;
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
      name: group.name,
      description: group.description || "",
      maxMembers: group.maxMembers,
    });
  };

  const closeEditDialog = () => {
    setEditingGroup(null);
    setEditForm({
      name: "",
      description: "",
      maxMembers: 2,
    });
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
          ...editForm,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log(data.message);
        fetchGroups(); // Recarregar a lista
        closeEditDialog();
      } else {
        console.error(data.error || "Erro ao atualizar grupo");
      }
    } catch (error) {
      console.error("Erro ao atualizar grupo:", error);
    } finally {
      setSaving(false);
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
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Meus Grupos</h1>
        <p className="text-muted-foreground">
          Gerencie os grupos que você criou ou administra
        </p>
      </div>

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
            Você ainda não criou ou administra nenhum grupo
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Criar Primeiro Grupo
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <Card key={group.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {group.name}
                      <Badge variant={getRoleBadgeVariant(group.userRole)} className="flex items-center gap-1">
                        {getRoleIcon(group.userRole)}
                        {group.userRole}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Criado por {group.createdBy.name || group.createdBy.email}
                    </CardDescription>
                  </div>
                  {group.isOwner && (
                    <Dialog>
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
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="name">Nome do Grupo</Label>
                            <Input
                              id="name"
                              value={editForm.name}
                              onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="description">Descrição</Label>
                            <Textarea
                              id="description"
                              value={editForm.description}
                              onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="maxMembers">Máximo de Membros</Label>
                            <Input
                              id="maxMembers"
                              type="number"
                              min="2"
                              max="10"
                              value={editForm.maxMembers}
                              onChange={(e) => setEditForm(prev => ({ ...prev, maxMembers: parseInt(e.target.value) || 2 }))}
                            />
                          </div>
                          <div className="flex justify-end gap-2">
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
      )}
    </div>
  );
}
