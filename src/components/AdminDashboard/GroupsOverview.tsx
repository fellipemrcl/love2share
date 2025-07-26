'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Group {
  id: string
  name: string
  description: string | null
  maxMembers: number
  createdAt: string
  _count: {
    streamingGroupUsers: number
    streamingGroupStreamings: number
  }
}

export function GroupsOverview() {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGroups()
  }, [])

  const fetchGroups = async () => {
    try {
      const response = await fetch('/api/admin/groups')
      if (response.ok) {
        const data = await response.json()
        setGroups(data)
      }
    } catch (error) {
      console.error('Error fetching groups:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Grupos</CardTitle>
          <CardDescription>Carregando dados dos grupos...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Visão Geral dos Grupos</CardTitle>
          <CardDescription>
            Total de {groups.length} grupos criados na plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {groups.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum grupo encontrado.
              </p>
            ) : (
              <div className="space-y-3">
                {groups.map((group) => (
                  <div key={group.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">{group.name}</p>
                        <Badge variant="outline">
                          {group._count.streamingGroupUsers}/{group.maxMembers} membros
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {group.description || 'Sem descrição'}
                      </p>
                      <div className="flex items-center space-x-4 mt-2">
                        <p className="text-xs text-muted-foreground">
                          {group._count.streamingGroupStreamings} streamings compartilhados
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Criado em: {new Date(group.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        Ver Detalhes
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
