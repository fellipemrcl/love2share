'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, X, Clock, User, AlertTriangle } from 'lucide-react'

interface MemberAccessData {
  id: string
  streamingGroup: {
    id: string
    name: string
    description?: string
  }
  status: string
  deadline?: Date
  hoursRemaining?: number
  isOverdue: boolean
  sentAt?: Date
  confirmedAt?: Date
  recentDeliveries: {
    id: string
    deliveryType: string
    content: string // Dados de acesso reais
    isInviteLink: boolean
    sentAt: Date
    confirmedAt?: Date
    notes?: string
  }[]
  needsAction: boolean
}

export default function MemberAccessDataConfirmation() {
  const [memberData, setMemberData] = useState<MemberAccessData[]>([])
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState({ 
    total: 0, 
    needingConfirmation: 0, 
    confirmed: 0, 
    pending: 0 
  })
  const [confirmingData, setConfirmingData] = useState<string | null>(null)
  const [notes, setNotes] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchMemberData()
  }, [])

  const fetchMemberData = async () => {
    try {
      const response = await fetch('/api/access-data/confirm')
      if (response.ok) {
        const data = await response.json()
        setMemberData(data.memberAccessData)
        setSummary(data.summary)
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmAccess = async (streamingGroupUserId: string, confirmed: boolean) => {
    setConfirmingData(streamingGroupUserId)
    try {
      const response = await fetch('/api/access-data/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          streamingGroupUserId,
          confirmed,
          notes: notes[streamingGroupUserId] || '',
        }),
      })

      if (response.ok) {
        const result = await response.json()
        alert(result.message)
        setNotes(prev => ({ ...prev, [streamingGroupUserId]: '' }))
        fetchMemberData()
      } else {
        const error = await response.json()
        alert(`Erro: ${error.error}`)
      }
    } catch (error) {
      console.error('Erro ao confirmar dados:', error)
      alert('Erro ao confirmar dados')
    } finally {
      setConfirmingData(null)
    }
  }

  const formatTimeRemaining = (hours?: number) => {
    if (!hours) return 'Sem prazo definido'
    if (hours <= 0) return 'Vencido'
    if (hours < 24) return `${hours}h restantes`
    const days = Math.floor(hours / 24)
    const remainingHours = hours % 24
    return `${days}d ${remainingHours}h restantes`
  }

  const getStatusBadge = (status: string, isOverdue: boolean) => {
    if (isOverdue) {
      return <Badge variant="destructive" className="flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Vencido</Badge>
    }
    
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="w-3 h-3" />Aguardando Dados</Badge>
      case 'SENT':
        return <Badge variant="outline" className="flex items-center gap-1"><User className="w-3 h-3" />Aguardando Confirmação</Badge>
      case 'CONFIRMED':
        return <Badge variant="default" className="flex items-center gap-1"><CheckCircle className="w-3 h-3" />Confirmado</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getDeliveryTypeLabel = (type: string) => {
    switch (type) {
      case 'CREDENTIALS': return 'Credenciais'
      case 'INVITE_LINK': return 'Link de Convite'
      case 'ACCOUNT_SHARING': return 'Compartilhamento'
      case 'INSTRUCTIONS': return 'Instruções'
      default: return type
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3 text-muted-foreground">Carregando dados...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Grupos</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Grupos onde você é membro
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Precisam Confirmação</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{summary.needingConfirmation}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Dados recebidos aguardando confirmação
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmados</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{summary.confirmed}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Dados confirmados como funcionais
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aguardando Dados</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">{summary.pending}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Aguardando dados do administrador
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de grupos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Meus Grupos de Streaming
          </CardTitle>
          <CardDescription>
            Confirme o recebimento dos dados de acesso dos serviços de streaming
          </CardDescription>
        </CardHeader>
        <CardContent>
          {memberData.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-medium mb-2">Nenhum grupo como membro</h3>
              <p className="text-muted-foreground">
                Você não está em nenhum grupo como membro atualmente
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {memberData.map((item) => (
                <Card
                  key={item.id}
                  className={`${
                    item.needsAction ? 'border-primary/50 bg-primary/5' : 
                    item.isOverdue ? 'border-destructive/50 bg-destructive/5' : ''
                  }`}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{item.streamingGroup.name}</CardTitle>
                        {item.streamingGroup.description && (
                          <CardDescription className="mt-1">
                            {item.streamingGroup.description}
                          </CardDescription>
                        )}
                      </div>
                      <div className="text-right space-y-2">
                        {getStatusBadge(item.status, item.isOverdue)}
                        {item.hoursRemaining && (
                          <div className="text-sm text-muted-foreground">
                            {formatTimeRemaining(item.hoursRemaining)}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Dados de acesso atuais - para itens que precisam confirmação */}
                    {item.needsAction && item.recentDeliveries.length > 0 && (
                      <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                          <h4 className="font-semibold text-green-800 dark:text-green-200">Dados de Acesso Recebidos</h4>
                        </div>
                        {(() => {
                          const latestDelivery = item.recentDeliveries[0];
                          return (
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
                                <span className="font-medium">{getDeliveryTypeLabel(latestDelivery.deliveryType)}</span>
                                {latestDelivery.isInviteLink && (
                                  <Badge variant="outline" className="text-xs">Link de Convite</Badge>
                                )}
                              </div>
                              
                              <div className="bg-background p-3 rounded border">
                                <div className="text-xs font-medium text-muted-foreground mb-2">Dados de Acesso:</div>
                                <div className="text-sm font-mono bg-muted/50 p-3 rounded border whitespace-pre-wrap break-all">
                                  {latestDelivery.content}
                                </div>
                              </div>
                              
                              {latestDelivery.notes && (
                                <div className="text-sm text-green-700 dark:text-green-300">
                                  <strong>Observações:</strong> {latestDelivery.notes}
                                </div>
                              )}
                              
                              <div className="text-xs text-green-600 dark:text-green-400">
                                Enviado em {new Date(latestDelivery.sentAt).toLocaleDateString('pt-BR')} às {new Date(latestDelivery.sentAt).toLocaleTimeString('pt-BR')}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {/* Histórico de entregas recentes */}
                    {item.recentDeliveries.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-3">Entregas Recentes</h4>
                        <div className="space-y-2">
                          {item.recentDeliveries.map((delivery) => (
                            <div key={delivery.id} className="p-3 bg-muted/50 rounded-lg border">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-sm">{getDeliveryTypeLabel(delivery.deliveryType)}</span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(delivery.sentAt).toLocaleDateString('pt-BR')}
                                </span>
                              </div>
                              {delivery.isInviteLink && (
                                <Badge variant="outline" className="text-xs mb-2">Link de Convite</Badge>
                              )}
                              
                              {/* Dados de acesso */}
                              <div className="mt-3 p-3 bg-background rounded border border-primary/20">
                                <div className="text-xs font-medium text-muted-foreground mb-2">Dados de Acesso:</div>
                                <div className="text-sm font-mono bg-muted/50 p-2 rounded border whitespace-pre-wrap break-all">
                                  {delivery.content}
                                </div>
                              </div>
                              
                              {delivery.notes && (
                                <div className="mt-2 text-xs text-muted-foreground">
                                  <strong>Observações:</strong> {delivery.notes}
                                </div>
                              )}
                              
                              {delivery.confirmedAt && (
                                <div className="text-green-600 dark:text-green-400 text-xs flex items-center gap-1 mt-2">
                                  <CheckCircle className="w-3 h-3" />
                                  Confirmado em {new Date(delivery.confirmedAt).toLocaleDateString('pt-BR')}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Ações para confirmar/reportar problemas */}
                    {item.needsAction && (
                      <div className="space-y-4 pt-4 border-t">
                        <Alert className="border-primary/50 bg-primary/5">
                          <AlertTriangle className="w-4 h-4 text-primary" />
                          <AlertDescription className="text-primary">
                            Você recebeu dados de acesso! Por favor, confirme se conseguiu acessar o serviço.
                          </AlertDescription>
                        </Alert>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Comentários (opcional)
                            </label>
                            <Textarea
                              value={notes[item.id] || ''}
                              onChange={(e) => setNotes(prev => ({ ...prev, [item.id]: e.target.value }))}
                              placeholder="Adicione comentários sobre os dados recebidos..."
                              rows={3}
                              className="resize-none"
                            />
                          </div>

                          <div className="flex gap-3">
                            <Button
                              onClick={() => handleConfirmAccess(item.id, true)}
                              disabled={confirmingData === item.id}
                              className="flex-1"
                              size="lg"
                            >
                              {confirmingData === item.id ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  Confirmando...
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Confirmar - Funcionou!
                                </>
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleConfirmAccess(item.id, false)}
                              disabled={confirmingData === item.id}
                              className="flex-1"
                              size="lg"
                            >
                              <X className="w-4 h-4 mr-2" />
                              Reportar Problema
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Status para itens já confirmados */}
                    {item.status === 'CONFIRMED' && item.confirmedAt && (
                      <div className="pt-4 border-t">
                        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                          <span className="text-sm text-green-700 dark:text-green-300">
                            Confirmado em {new Date(item.confirmedAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Status para itens pendentes */}
                    {item.status === 'PENDING' && (
                      <div className="pt-4 border-t">
                        <div className="flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg">
                          <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                          <span className="text-sm text-orange-700 dark:text-orange-300">
                            Aguardando o administrador enviar os dados de acesso
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
