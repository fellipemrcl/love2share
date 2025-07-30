'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Users, User as UserIcon, Crown, Shield, AlertTriangle } from 'lucide-react'
import MemberAccessDataConfirmation from '@/components/MemberAccessDataConfirmation/MemberAccessDataConfirmation'
import GroupAccessDataManagement from '@/components/GroupAccessDataManagement/GroupAccessDataManagement'

interface GroupInfo {
  id: string
  name: string
  description?: string
  userRole: 'OWNER' | 'ADMIN' | 'MEMBER'
  isAdmin: boolean
  pendingMembersCount?: number
}

export default function GroupAccessDataDashboard() {
  const [groups, setGroups] = useState<GroupInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedGroup, setSelectedGroup] = useState<GroupInfo | null>(null)
  const [activeTab, setActiveTab] = useState<'member' | 'admin'>('member')

  const fetchUserGroups = useCallback(async () => {
    try {
      const response = await fetch('/api/groups/my')
      if (response.ok) {
        const data = await response.json()
        setGroups(data.groups || [])
        
        // Determinar aba inicial baseada nos papéis do usuário
        const hasAdminRole = data.groups.some((group: GroupInfo) => 
          group.userRole === 'OWNER' || group.userRole === 'ADMIN'
        )
        
        if (hasAdminRole) {
          setActiveTab('admin')
        } else {
          setActiveTab('member')
        }
      }
    } catch (error) {
      console.error('Erro ao buscar grupos:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUserGroups()
  }, [fetchUserGroups])

  const adminGroups = groups.filter(group => 
    group.userRole === 'OWNER' || group.userRole === 'ADMIN'
  )
  
  const memberGroups = groups.filter(group => 
    group.userRole === 'MEMBER'
  )

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'OWNER':
        return <Crown className="h-4 w-4 text-yellow-600" />
      case 'ADMIN':
        return <Shield className="h-4 w-4 text-blue-600" />
      default:
        return <UserIcon className="h-4 w-4 text-gray-600" />
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'OWNER':
        return "default" as const
      case 'ADMIN':
        return "secondary" as const
      default:
        return "outline" as const
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3 text-muted-foreground">Carregando dados...</span>
        </div>
      </div>
    )
  }

  if (selectedGroup) {
    return (
      <div className="container mx-auto p-6">
        <GroupAccessDataManagement 
          groupId={selectedGroup.id}
          groupName={selectedGroup.name}
          onClose={() => setSelectedGroup(null)}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Dados de Acesso</h1>
          <p className="text-muted-foreground">
            Gerencie e confirme dados de acesso dos grupos de streaming
          </p>
        </div>
        <Badge variant="outline" className="h-8 px-3">
          <Users className="h-4 w-4 mr-2" />
          {groups.length} {groups.length === 1 ? 'Grupo' : 'Grupos'}
        </Badge>
      </div>

      {/* Dashboard Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Grupos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{groups.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Todos os grupos que você participa
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administrando</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminGroups.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Grupos onde você é admin/proprietário
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Como Membro</CardTitle>
            <UserIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{memberGroups.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Grupos onde você é apenas membro
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Conteúdo Principal */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'member' | 'admin')} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="member" className="flex items-center gap-2">
            <UserIcon className="w-4 h-4" />
            Como Membro ({memberGroups.length})
          </TabsTrigger>
          {adminGroups.length > 0 && (
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Como Administrador ({adminGroups.length})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="member" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Confirmação de Dados de Acesso
              </CardTitle>
              <CardDescription>
                Confirme o recebimento dos dados de acesso dos grupos onde você é membro
              </CardDescription>
            </CardHeader>
            <CardContent>
              {memberGroups.length === 0 ? (
                <div className="text-center py-12">
                  <UserIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-medium mb-2">Nenhum grupo como membro</h3>
                  <p className="text-muted-foreground">
                    Você não é membro de nenhum grupo atualmente
                  </p>
                </div>
              ) : (
                <MemberAccessDataConfirmation />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admin" className="space-y-6">
          {adminGroups.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-medium mb-2">Nenhum grupo para administrar</h3>
                <p className="text-muted-foreground">
                  Você não é administrador ou proprietário de nenhum grupo
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Grupos que Você Administra
                </CardTitle>
                <CardDescription>
                  Gerencie os dados de acesso dos membros dos seus grupos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {adminGroups.map((group) => (
                    <Card key={group.id} className="hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-primary/20"
                          onClick={() => setSelectedGroup(group)}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{group.name}</CardTitle>
                            {group.description && (
                              <CardDescription className="mt-2">
                                {group.description}
                              </CardDescription>
                            )}
                          </div>
                          <Badge variant={getRoleBadgeVariant(group.userRole)} 
                                 className="flex items-center gap-1 shrink-0 ml-2">
                            {getRoleIcon(group.userRole)}
                            {group.userRole}
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-3">
                        {group.pendingMembersCount !== undefined && group.pendingMembersCount > 0 && (
                          <Alert className="border-destructive/50 bg-destructive/5">
                            <AlertTriangle className="w-4 h-4 text-destructive" />
                            <AlertDescription className="text-destructive">
                              {group.pendingMembersCount} membro(s) precisam de dados de acesso
                            </AlertDescription>
                          </Alert>
                        )}
                        
                        <Button variant="outline" className="w-full group">
                          Gerenciar Dados de Acesso
                          <Shield className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
