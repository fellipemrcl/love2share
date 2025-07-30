'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Clock, User, Send, CheckCircle, AlertTriangle } from 'lucide-react'
import { AccessDataDeliveryType } from '@/app/generated/prisma'

interface PendingAccessData {
  id: string
  user: {
    id: string
    name: string
    email: string
  }
  streamingGroup: {
    id: string
    name: string
  }
  status: string
  deadline?: Date
  hoursRemaining?: number
  isOverdue: boolean
  lastDelivery?: {
    id: string
    deliveryType: string
    sentAt: Date
    confirmedAt?: Date
  } | null
}

export default function AccessDataManagement() {
  const [pendingData, setPendingData] = useState<PendingAccessData[]>([])
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState({ total: 0, pending: 0, sent: 0, overdue: 0 })
  const [sendingData, setSendingData] = useState<string | null>(null)

  // Formulário de envio
  const [selectedUser, setSelectedUser] = useState<string>('')
  const [deliveryType, setDeliveryType] = useState<AccessDataDeliveryType>()
  const [content, setContent] = useState('')
  const [isInviteLink, setIsInviteLink] = useState(false)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    fetchPendingData()
  }, [])

  const fetchPendingData = async () => {
    try {
      const response = await fetch('/api/access-data')
      if (response.ok) {
        const data = await response.json()
        setPendingData(data.pendingAccessData)
        setSummary(data.summary)
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendAccessData = async () => {
    if (!selectedUser || !deliveryType || !content) {
      alert('Preencha todos os campos obrigatórios')
      return
    }

    setSendingData(selectedUser)
    try {
      const response = await fetch('/api/access-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          streamingGroupUserId: selectedUser,
          deliveryType,
          content,
          isInviteLink,
          notes,
        }),
      })

      if (response.ok) {
        alert('Dados enviados com sucesso!')
        setSelectedUser('')
        setDeliveryType(undefined)
        setContent('')
        setIsInviteLink(false)
        setNotes('')
        fetchPendingData()
      } else {
        const error = await response.json()
        alert(`Erro: ${error.error}`)
      }
    } catch (error) {
      console.error('Erro ao enviar dados:', error)
      alert('Erro ao enviar dados')
    } finally {
      setSendingData(null)
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
        return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="w-3 h-3" />Pendente</Badge>
      case 'SENT':
        return <Badge variant="outline" className="flex items-center gap-1"><Send className="w-3 h-3" />Enviado</Badge>
      case 'CONFIRMED':
        return <Badge variant="default" className="flex items-center gap-1"><CheckCircle className="w-3 h-3" />Confirmado</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
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
            <div className="text-sm text-muted-foreground">Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{summary.pending}</div>
            <div className="text-sm text-muted-foreground">Pendentes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{summary.sent}</div>
            <div className="text-sm text-muted-foreground">Enviados</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{summary.overdue}</div>
            <div className="text-sm text-muted-foreground">Vencidos</div>
          </CardContent>
        </Card>
      </div>

      {/* Formulário de envio */}
      <Card>
        <CardHeader>
          <CardTitle>Enviar Dados de Acesso</CardTitle>
          <CardDescription>
            Selecione um membro e envie os dados de acesso para o serviço de streaming
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Membro</label>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um membro" />
              </SelectTrigger>
              <SelectContent>
                {pendingData
                  .filter(item => item.status === 'PENDING' || item.status === 'SENT')
                  .map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{item.user.name} - {item.streamingGroup.name}</span>
                        {item.isOverdue && <AlertTriangle className="w-4 h-4 text-red-500" />}
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tipo de Entrega</label>
            <Select value={deliveryType} onValueChange={(value) => setDeliveryType(value as AccessDataDeliveryType)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CREDENTIALS">Credenciais (Login/Senha)</SelectItem>
                <SelectItem value="INVITE_LINK">Link de Convite</SelectItem>
                <SelectItem value="ACCOUNT_SHARING">Compartilhamento de Conta</SelectItem>
                <SelectItem value="INSTRUCTIONS">Instruções Especiais</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Conteúdo *</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                deliveryType === 'CREDENTIALS' 
                  ? "Email: exemplo@email.com\nSenha: minhasenha123"
                  : deliveryType === 'INVITE_LINK'
                  ? "https://link-de-convite-do-servico.com"
                  : "Digite o conteúdo dos dados de acesso..."
              }
              rows={4}
            />
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isInviteLink}
                onChange={(e) => setIsInviteLink(e.target.checked)}
              />
              <span className="text-sm">É um link de convite</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Notas (opcional)</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Instruções adicionais para o membro..."
              rows={2}
            />
          </div>

          <Button 
            onClick={handleSendAccessData}
            disabled={!selectedUser || !deliveryType || !content || sendingData === selectedUser}
            className="w-full"
          >
            {sendingData === selectedUser ? 'Enviando...' : 'Enviar Dados de Acesso'}
          </Button>
        </CardContent>
      </Card>

      {/* Lista de membros pendentes */}
      <Card>
        <CardHeader>
          <CardTitle>Membros Aguardando Dados de Acesso</CardTitle>
          <CardDescription>
            Membros que precisam receber os dados de acesso dos serviços de streaming
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum membro aguardando dados de acesso
            </div>
          ) : (
            <div className="space-y-4">
              {pendingData.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 border rounded-lg ${item.isOverdue ? 'border-red-200 bg-red-50' : 'border-border'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5" />
                      <div>
                        <div className="font-medium">{item.user.name}</div>
                        <div className="text-sm text-muted-foreground">{item.user.email}</div>
                        <div className="text-sm text-muted-foreground">
                          Grupo: {item.streamingGroup.name}
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      {getStatusBadge(item.status, item.isOverdue)}
                      <div className="text-sm text-muted-foreground">
                        {formatTimeRemaining(item.hoursRemaining)}
                      </div>
                    </div>
                  </div>
                  
                  {item.isOverdue && (
                    <Alert className="mt-3">
                      <AlertTriangle className="w-4 h-4" />
                      <AlertDescription>
                        O prazo de 24 horas para envio dos dados de acesso expirou!
                      </AlertDescription>
                    </Alert>
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
