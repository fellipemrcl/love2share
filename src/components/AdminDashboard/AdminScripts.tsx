'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Play, Database, Trash2, TestTube, Users, Shield, Download } from 'lucide-react'

interface ScriptResult {
  success: boolean
  message: string
  data?: unknown
}

export function AdminScripts() {
  const [loading, setLoading] = useState<string | null>(null)
  const [results, setResults] = useState<Record<string, ScriptResult>>({})

  const executeScript = async (scriptName: string, endpoint: string) => {
    try {
      setLoading(scriptName)
      
      const response = await fetch(`/api/admin/scripts/${endpoint}`, {
        method: 'POST',
      })

      const result = await response.json()
      
      setResults(prev => ({
        ...prev,
        [scriptName]: result
      }))

      if (result.success) {
        // Auto-clear success messages after 5 seconds
        setTimeout(() => {
          setResults(prev => {
            const newResults = { ...prev }
            delete newResults[scriptName]
            return newResults
          })
        }, 5000)
      }
    } catch (error) {
      console.error('Script execution error:', error)
      setResults(prev => ({
        ...prev,
        [scriptName]: {
          success: false,
          message: 'Erro de conexão ao executar script'
        }
      }))
    } finally {
      setLoading(null)
    }
  }

  const scripts = [
    {
      id: 'seed-streamings',
      name: 'Criar Streamings de Exemplo',
      description: 'Adiciona streamings populares (Netflix, Prime Video, Disney+, HBO Max, Spotify)',
      icon: Database,
      endpoint: 'seed-streamings',
      variant: 'default' as const,
      category: 'Dados'
    },
    {
      id: 'test-database',
      name: 'Testar Banco de Dados',
      description: 'Verifica conexão e lista dados atuais do banco',
      icon: TestTube,
      endpoint: 'test-database',
      variant: 'outline' as const,
      category: 'Diagnóstico'
    },
    {
      id: 'clean-streamings',
      name: 'Limpar Todos os Streamings',
      description: 'Remove TODOS os streamings do banco (cuidado!)',
      icon: Trash2,
      endpoint: 'clean-streamings',
      variant: 'destructive' as const,
      category: 'Limpeza'
    },
    {
      id: 'reset-streaming-status',
      name: 'Ativar Todos os Streamings',
      description: 'Define todos os streamings como ativos',
      icon: Shield,
      endpoint: 'reset-streaming-status',
      variant: 'outline' as const,
      category: 'Manutenção'
    },
    {
      id: 'count-users',
      name: 'Contar Usuários',
      description: 'Mostra estatísticas detalhadas de usuários, grupos e streamings',
      icon: Users,
      endpoint: 'count-users',
      variant: 'outline' as const,
      category: 'Estatísticas'
    },
    {
      id: 'backup-data',
      name: 'Gerar Backup',
      description: 'Cria um backup simples dos dados principais do sistema',
      icon: Download,
      endpoint: 'backup-data',
      variant: 'outline' as const,
      category: 'Backup'
    }
  ]

  const categories = Array.from(new Set(scripts.map(s => s.category)))

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Scripts de Administração</CardTitle>
          <CardDescription>
            Execute scripts úteis para gerenciar o banco de dados e sistema
          </CardDescription>
        </CardHeader>
      </Card>

      {categories.map(category => (
        <div key={category} className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground">{category}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scripts.filter(script => script.category === category).map((script) => {
              const Icon = script.icon
              const result = results[script.id]
              const isLoading = loading === script.id

              return (
                <Card key={script.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-2">
                      <Icon className="h-5 w-5" />
                      <CardTitle className="text-base">{script.name}</CardTitle>
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
                        onClick={() => executeScript(script.id, script.endpoint)}
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

                      {result && (
                        <Alert variant={result.success ? "default" : "destructive"}>
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
      ))}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            ⚠️ Aviso Importante
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Scripts marcados em vermelho são destrutivos e podem apagar dados permanentemente. 
            Use com cuidado, especialmente em produção.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
