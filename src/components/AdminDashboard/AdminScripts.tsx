'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Loader2, 
  Play, 
  Database, 
  Trash2, 
  TestTube, 
  Users, 
  Shield, 
  UserPlus, 
  UsersRound, 
  Settings, 
  AlertTriangle, 
  Activity, 
  CheckCircle, 
  Wrench, 
  Clock,
  FileText
} from 'lucide-react'
import { RemoveUserForm } from './RemoveUserForm'
import { CreateTestGroupForm } from './CreateTestGroupForm'
import { toast } from 'sonner'

interface ScriptResult {
  success: boolean
  message: string
  data?: unknown
}

export function AdminScripts() {
  const [loading, setLoading] = useState<string | null>(null)
  const [results, setResults] = useState<Record<string, ScriptResult>>({})

  const executeScript = async (scriptName: string, endpoint: string, isDestructive = false) => {
    // Confirmação para scripts destrutivos
    if (isDestructive) {
      const confirmed = window.confirm(
        `⚠️ ATENÇÃO: Esta ação é destrutiva e não pode ser desfeita!\n\nTem certeza que deseja executar "${scriptName}"?`
      )
      if (!confirmed) return
    }

    try {
      setLoading(scriptName)
      toast.loading(`Executando ${scriptName}...`, { id: scriptName })
      
      const response = await fetch(`/api/admin/scripts/${endpoint}`, {
        method: 'POST',
      })

      const result = await response.json()
      
      setResults(prev => ({
        ...prev,
        [scriptName]: result
      }))

      if (result.success) {
        toast.success(result.message, { 
          id: scriptName,
          duration: 5000 
        })
        // Auto-clear success messages after 8 seconds
        setTimeout(() => {
          setResults(prev => {
            const newResults = { ...prev }
            delete newResults[scriptName]
            return newResults
          })
        }, 8000)
      } else {
        toast.error(result.message, { 
          id: scriptName,
          duration: 10000 
        })
      }
    } catch (error) {
      console.error('Script execution error:', error)
      const errorMessage = 'Erro de conexão ao executar script'
      toast.error(errorMessage, { 
        id: scriptName,
        duration: 10000 
      })
      setResults(prev => ({
        ...prev,
        [scriptName]: {
          success: false,
          message: errorMessage
        }
      }))
    } finally {
      setLoading(null)
    }
  }

  const scripts = [
    // Configuração Inicial
    {
      id: 'seed-streamings',
      name: 'Configurar Streamings',
      description: 'Adiciona streamings populares (Netflix, Prime Video, Disney+, HBO Max, Spotify)',
      icon: Database,
      endpoint: 'seed-streamings',
      variant: 'default' as const,
      category: 'Configuração',
      isDestructive: false
    },
    {
      id: 'test-database',
      name: 'Testar Conexão',
      description: 'Verifica conexão com banco de dados e status geral',
      icon: TestTube,
      endpoint: 'test-database',
      variant: 'outline' as const,
      category: 'Configuração',
      isDestructive: false
    },

    // Desenvolvimento
    {
      id: 'create-test-user',
      name: 'Criar Usuário de Teste',
      description: 'Gera um usuário de teste para desenvolvimento',
      icon: UserPlus,
      endpoint: 'create-test-user',
      variant: 'default' as const,
      category: 'Desenvolvimento',
      isDestructive: false
    },
    {
      id: 'create-test-group',
      name: 'Criar Grupo de Teste',
      description: 'Cria um grupo aleatório para testes',
      icon: UsersRound,
      endpoint: 'create-test-group',
      variant: 'default' as const,
      category: 'Desenvolvimento',
      isDestructive: false
    },
    {
      id: 'manage-test-users',
      name: 'Visualizar Dados de Teste',
      description: 'Lista usuários e grupos de teste existentes',
      icon: Users,
      endpoint: 'manage-test-users',
      variant: 'outline' as const,
      category: 'Desenvolvimento',
      isDestructive: false
    },
    {
      id: 'generate-sample-data',
      name: 'Gerar Dados Completos',
      description: 'Cria um conjunto completo de dados de exemplo para desenvolvimento',
      icon: FileText,
      endpoint: 'generate-sample-data',
      variant: 'default' as const,
      category: 'Desenvolvimento',
      isDestructive: false
    },

    // Manutenção
    {
      id: 'reset-streaming-status',
      name: 'Ativar Streamings',
      description: 'Reativa todos os streamings desabilitados',
      icon: Shield,
      endpoint: 'reset-streaming-status',
      variant: 'outline' as const,
      category: 'Manutenção',
      isDestructive: false
    },
    {
      id: 'check-overdue-access-data',
      name: 'Verificar Dados Vencidos',
      description: 'Verifica dados de acesso vencidos que precisam de atenção',
      icon: Clock,
      endpoint: 'check-overdue-access-data',
      variant: 'outline' as const,
      category: 'Manutenção',
      isDestructive: false
    },
    {
      id: 'fix-orphaned-data',
      name: 'Corrigir Dados Órfãos',
      description: 'Identifica e corrige dados inconsistentes no sistema',
      icon: Wrench,
      endpoint: 'fix-orphaned-data',
      variant: 'outline' as const,
      category: 'Manutenção',
      isDestructive: false
    },

    // Diagnóstico
    {
      id: 'system-health-check',
      name: 'Verificar Saúde do Sistema',
      description: 'Executa verificações completas de integridade',
      icon: Activity,
      endpoint: 'system-health-check',
      variant: 'outline' as const,
      category: 'Diagnóstico',
      isDestructive: false
    },
    {
      id: 'database-integrity-check',
      name: 'Verificar Integridade dos Dados',
      description: 'Analisa consistência e integridade do banco de dados',
      icon: CheckCircle,
      endpoint: 'database-integrity-check',
      variant: 'outline' as const,
      category: 'Diagnóstico',
      isDestructive: false
    },

    // Limpeza (Destrutivos)
    {
      id: 'clean-test-users',
      name: 'Limpar Dados de Teste',
      description: 'Remove usuários e grupos de teste (apenas dados de desenvolvimento)',
      icon: Trash2,
      endpoint: 'clean-test-users',
      variant: 'destructive' as const,
      category: 'Limpeza',
      isDestructive: true
    },
    {
      id: 'clean-streamings',
      name: 'Resetar Streamings',
      description: '⚠️ Remove TODOS os streamings cadastrados',
      icon: Trash2,
      endpoint: 'clean-streamings',
      variant: 'destructive' as const,
      category: 'Limpeza',
      isDestructive: true
    },
    {
      id: 'clean-groups',
      name: 'Resetar Grupos',
      description: '⚠️ Remove TODOS os grupos e memberships',
      icon: Trash2,
      endpoint: 'clean-groups',
      variant: 'destructive' as const,
      category: 'Limpeza',
      isDestructive: true
    }
  ]

  const categories = [
    'Configuração',
    'Desenvolvimento', 
    'Manutenção',
    'Diagnóstico',
    'Limpeza'
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Scripts de Administração
          </CardTitle>
          <CardDescription>
            Execute scripts organizados para gerenciar o sistema de forma eficiente.
            Scripts destrutivos exigem confirmação antes da execução.
          </CardDescription>
        </CardHeader>
      </Card>

      {categories.map(category => {
        const categoryScripts = scripts.filter(script => script.category === category)
        if (categoryScripts.length === 0) return null

        const getCategoryDescription = (cat: string) => {
          switch (cat) {
            case 'Configuração': return 'Scripts essenciais para configuração inicial do sistema'
            case 'Desenvolvimento': return 'Ferramentas para criação de dados de teste e desenvolvimento'
            case 'Manutenção': return 'Scripts para manutenção regular e correções do sistema'
            case 'Diagnóstico': return 'Verificações de saúde e integridade do sistema'
            case 'Limpeza': return 'Scripts destrutivos para limpeza de dados (use com cuidado!)'
            default: return ''
          }
        }

        const getCategoryIcon = (cat: string) => {
          switch (cat) {
            case 'Configuração': return Database
            case 'Desenvolvimento': return UserPlus
            case 'Manutenção': return Wrench
            case 'Diagnóstico': return Activity
            case 'Limpeza': return AlertTriangle
            default: return Settings
          }
        }

        const CategoryIcon = getCategoryIcon(category)
        const isDestructiveCategory = category === 'Limpeza'

        return (
          <div key={category} className="space-y-4">
            <div className={`border-l-4 pl-4 ${isDestructiveCategory ? 'border-red-500' : 'border-blue-500'}`}>
              <div className="flex items-center gap-2 mb-2">
                <CategoryIcon className={`h-5 w-5 ${isDestructiveCategory ? 'text-red-500' : 'text-blue-500'}`} />
                <h3 className="text-lg font-semibold text-foreground">{category}</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {getCategoryDescription(category)}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoryScripts.map((script) => {
                const Icon = script.icon
                const result = results[script.id]
                const isLoading = loading === script.id

                return (
                  <Card key={script.id} className={`relative transition-all duration-200 hover:shadow-md ${
                    script.isDestructive ? 'border-red-200 dark:border-red-800' : ''
                  }`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center space-x-2">
                        <Icon className={`h-5 w-5 ${script.isDestructive ? 'text-red-500' : ''}`} />
                        <CardTitle className="text-base">{script.name}</CardTitle>
                        {script.isDestructive && (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <CardDescription className="text-sm">
                        {script.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <Button
                          variant={script.variant}
                          size="sm"
                          onClick={() => executeScript(script.id, script.endpoint, script.isDestructive)}
                          disabled={isLoading || loading !== null}
                          className="w-full"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Executando...
                            </>
                          ) : (
                            <>
                              <Play className="mr-2 h-4 w-4" />
                              Executar
                            </>
                          )}
                        </Button>

                        {result && !result.success && (
                          <Alert variant="destructive">
                            <AlertDescription>
                              {result.message}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Formulários de Gestão */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <UsersRound className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-foreground">Criar Grupo Personalizado</h3>
          </div>
          <CreateTestGroupForm />
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-orange-500" />
            <h3 className="text-lg font-semibold text-foreground">Gerenciamento de Usuários</h3>
          </div>
          <RemoveUserForm />
        </div>
      </div>

      {/* Avisos e Informações */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-orange-200 dark:border-orange-800">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-orange-600 dark:text-orange-400 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Scripts Destrutivos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Scripts da categoria &quot;Limpeza&quot; são destrutivos e podem apagar dados permanentemente. 
              Uma confirmação será solicitada antes da execução.
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Notificações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              O sistema usa notificações Sonner para feedback em tempo real. 
              Sucessos desaparecem automaticamente, erros permanecem visíveis.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
