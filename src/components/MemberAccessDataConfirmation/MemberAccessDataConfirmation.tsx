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
    return <div className="flex justify-center p-8">Carregando...</div>
  }

  return (
    <div className="space-y-6">
      {/* Resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{summary.total}</div>
            <div className="text-sm text-muted-foreground">Total de Grupos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{summary.needingConfirmation}</div>
            <div className="text-sm text-muted-foreground">Precisam Confirmação</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{summary.confirmed}</div>
            <div className="text-sm text-muted-foreground">Confirmados</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{summary.pending}</div>
            <div className="text-sm text-muted-foreground">Aguardando Dados</div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de grupos */}
      <Card>
        <CardHeader>
          <CardTitle>Meus Grupos de Streaming</CardTitle>
          <CardDescription>
            Confirme o recebimento dos dados de acesso dos serviços de streaming
          </CardDescription>
        </CardHeader>
        <CardContent>
          {memberData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Você não está em nenhum grupo como membro
            </div>
          ) : (
            <div className="space-y-6">
              {memberData.map((item) => (
                <div
                  key={item.id}
                  className={`p-6 border rounded-lg ${
                    item.needsAction ? 'border-blue-200 bg-blue-50' : 
                    item.isOverdue ? 'border-red-200 bg-red-50' : 'border-border'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{item.streamingGroup.name}</h3>
                      {item.streamingGroup.description && (
                        <p className="text-sm text-muted-foreground">{item.streamingGroup.description}</p>
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

                  {/* Histórico de entregas recentes */}
                  {item.recentDeliveries.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">Entregas Recentes:</h4>
                      <div className="space-y-2">
                        {item.recentDeliveries.map((delivery) => (
                          <div key={delivery.id} className="text-sm p-2 bg-gray-50 rounded">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{getDeliveryTypeLabel(delivery.deliveryType)}</span>
                              <span className="text-muted-foreground">
                                {new Date(delivery.sentAt).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                            {delivery.isInviteLink && (
                              <Badge variant="outline" className="mt-1">Link de Convite</Badge>
                            )}
                            {delivery.confirmedAt && (
                              <div className="text-green-600 mt-1 flex items-center gap-1">
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
                      <Alert>
                        <AlertTriangle className="w-4 h-4" />
                        <AlertDescription>
                          Você recebeu dados de acesso! Por favor, confirme se conseguiu acessar o serviço.
                        </AlertDescription>
                      </Alert>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Comentários (opcional)
                        </label>
                        <Textarea
                          value={notes[item.id] || ''}
                          onChange={(e) => setNotes(prev => ({ ...prev, [item.id]: e.target.value }))}
                          placeholder="Adicione comentários sobre os dados recebidos..."
                          rows={3}
                        />
                      </div>

                      <div className="flex gap-3">
                        <Button
                          onClick={() => handleConfirmAccess(item.id, true)}
                          disabled={confirmingData === item.id}
                          className="flex-1"
                        >
                          {confirmingData === item.id ? 'Confirmando...' : (
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
                        >
                          <X className="w-4 h-4 mr-2" />
                          Reportar Problema
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Status para itens já confirmados */}
                  {item.status === 'CONFIRMED' && item.confirmedAt && (
                    <div className="pt-4 border-t">
                      <div className="text-green-600 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm">
                          Confirmado em {new Date(item.confirmedAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Status para itens pendentes */}
                  {item.status === 'PENDING' && (
                    <div className="pt-4 border-t">
                      <div className="text-yellow-600 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">
                          Aguardando o administrador enviar os dados de acesso
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
