'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface SystemHealthData {
  database: {
    status: 'healthy' | 'error'
    responseTime: number
  }
  api: {
    status: 'healthy' | 'error'
    uptime: string
  }
  services: {
    clerk: 'healthy' | 'error'
    prisma: 'healthy' | 'error'
  }
}

export function SystemHealth() {
  const [healthData, setHealthData] = useState<SystemHealthData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHealthData()
    // Refresh every 30 seconds
    const interval = setInterval(fetchHealthData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchHealthData = async () => {
    try {
      const response = await fetch('/api/admin/health')
      if (response.ok) {
        const data = await response.json()
        setHealthData(data)
      }
    } catch (error) {
      console.error('Error fetching health data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Status do Sistema</CardTitle>
          <CardDescription>Carregando dados de saúde do sistema...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const getStatusBadge = (status: 'healthy' | 'error') => (
    <Badge variant={status === 'healthy' ? 'default' : 'destructive'}>
      {status === 'healthy' ? 'Saudável' : 'Erro'}
    </Badge>
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Saúde do Sistema</CardTitle>
          <CardDescription>
            Status dos principais componentes da aplicação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Database Status */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Banco de Dados</h3>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">PostgreSQL</p>
                  <p className="text-sm text-muted-foreground">
                    {healthData?.database.responseTime 
                      ? `Tempo de resposta: ${healthData.database.responseTime}ms`
                      : 'Verificando...'}
                  </p>
                </div>
                {healthData && getStatusBadge(healthData.database.status)}
              </div>
            </div>

            {/* API Status */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">API</h3>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Next.js API Routes</p>
                  <p className="text-sm text-muted-foreground">
                    {healthData?.api.uptime 
                      ? `Uptime: ${healthData.api.uptime}`
                      : 'Verificando...'}
                  </p>
                </div>
                {healthData && getStatusBadge(healthData.api.status)}
              </div>
            </div>

            {/* Services Status */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Serviços Externos</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Clerk (Autenticação)</p>
                    <p className="text-sm text-muted-foreground">Serviço de autenticação</p>
                  </div>
                  {healthData && getStatusBadge(healthData.services.clerk)}
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Prisma ORM</p>
                    <p className="text-sm text-muted-foreground">Acesso ao banco de dados</p>
                  </div>
                  {healthData && getStatusBadge(healthData.services.prisma)}
                </div>
              </div>
            </div>

            {/* Overall Status */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Status Geral</p>
                  <p className="text-sm text-muted-foreground">
                    Última verificação: {new Date().toLocaleTimeString('pt-BR')}
                  </p>
                </div>
                <Badge variant="default" className="bg-green-500">
                  Sistema Operacional
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
