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
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-2">Carregando...</span>
      </div>
    )
  }

  if (selectedGroup) {
    return (
      <GroupAccessDataManagement 
        groupId={selectedGroup.id}
        groupName={selectedGroup.name}
        onClose={() => setSelectedGroup(null)}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{groups.length}</div>
            <div className="text-sm text-muted-foreground">Total de Grupos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{adminGroups.length}</div>
            <div className="text-sm text-muted-foreground">Administrando</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{memberGroups.length}</div>
            <div className="text-sm text-muted-foreground">Como Membro</div>
          </CardContent>
        </Card>
      </div>

      {/* Conteúdo Principal */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'member' | 'admin')}>
        <TabsList>
          <TabsTrigger value="member" className="flex items-center gap-2">
            <UserIcon className="w-4 h-4" />
            Como Membro ({memberGroups.length})
          </TabsTrigger>
          {adminGroups.length > 0 && (
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Como Administrador ({adminGroups.length})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="member" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Confirmação de Dados de Acesso</CardTitle>
              <CardDescription>
                Confirme o recebimento dos dados de acesso dos grupos onde você é membro
              </CardDescription>
            </CardHeader>
            <CardContent>
              {memberGroups.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <UserIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p>Você não é membro de nenhum grupo</p>
                </div>
              ) : (
                <MemberAccessDataConfirmation />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admin" className="space-y-4">
          {adminGroups.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Nenhum grupo para administrar</h3>
                <p className="text-muted-foreground">
                  Você não é administrador ou proprietário de nenhum grupo
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Grupos que Você Administra</CardTitle>
                  <CardDescription>
                    Gerencie os dados de acesso dos membros dos seus grupos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {adminGroups.map((group) => (
                      <Card key={group.id} className="hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => setSelectedGroup(group)}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">{group.name}</h3>
                              {group.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {group.description}
                                </p>
                              )}
                            </div>
                            <Badge variant={getRoleBadgeVariant(group.userRole)} 
                                   className="flex items-center gap-1">
                              {getRoleIcon(group.userRole)}
                              {group.userRole}
                            </Badge>
                          </div>
                          
                          {group.pendingMembersCount !== undefined && group.pendingMembersCount > 0 && (
                            <Alert className="mt-3">
                              <AlertTriangle className="w-4 h-4" />
                              <AlertDescription>
                                {group.pendingMembersCount} membro(s) precisam de dados de acesso
                              </AlertDescription>
                            </Alert>
                          )}
                          
                          <Button variant="outline" className="w-full mt-3">
                            Gerenciar Dados de Acesso
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
