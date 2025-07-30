'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Clock, User, Send, CheckCircle, AlertTriangle, Users } from 'lucide-react'
import { AccessDataDeliveryType } from '@/app/generated/prisma'

interface GroupAccessData {
  id: string
  user: {
    id: string
    name: string
    email: string
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

interface GroupAccessDataManagementProps {
  groupId: string
  groupName: string
  onClose?: () => void
}

export default function GroupAccessDataManagement({ 
  groupId, 
  groupName, 
  onClose 
}: GroupAccessDataManagementProps) {
  const [pendingData, setPendingData] = useState<GroupAccessData[]>([])
  const [loading, setLoading] = useState(true)
  const [sendingData, setSendingData] = useState<string | null>(null)

  // Formulário de envio
  const [selectedUser, setSelectedUser] = useState<string>('')
  const [deliveryType, setDeliveryType] = useState<AccessDataDeliveryType>()
  const [content, setContent] = useState('')
  const [isInviteLink, setIsInviteLink] = useState(false)
  const [notes, setNotes] = useState('')
  const [showSendForm, setShowSendForm] = useState(false)

  const fetchGroupAccessData = useCallback(async () => {
    try {
      const response = await fetch(`/api/groups/${groupId}/access-data`)
      if (response.ok) {
        const data = await response.json()
        setPendingData(data.members)
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }, [groupId])

  useEffect(() => {
    fetchGroupAccessData()
  }, [fetchGroupAccessData])

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
        setShowSendForm(false)
        fetchGroupAccessData()
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

  const getDeliveryTypeLabel = (type: string) => {
    switch (type) {
      case 'CREDENTIALS': return 'Credenciais'
      case 'INVITE_LINK': return 'Link de Convite'
      case 'ACCOUNT_SHARING': return 'Compartilhamento'
      case 'INSTRUCTIONS': return 'Instruções'
      default: return type
    }
  }

  const pendingMembers = pendingData.filter(item => item.status === 'PENDING' || item.status === 'SENT')
  const overdueMembers = pendingData.filter(item => item.isOverdue)

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Users className="w-6 h-6" />
              Dados de Acesso - {groupName}
            </h2>
            <p className="text-muted-foreground">Carregando informações dos membros...</p>
          </div>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Voltar
            </Button>
          )}
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3 text-muted-foreground">Carregando dados...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6" />
            Dados de Acesso - {groupName}
          </h2>
          <p className="text-muted-foreground">
            Gerencie os dados de acesso dos membros do seu grupo
          </p>
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Voltar
          </Button>
        )}
      </div>

      {/* Dashboard Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Membros</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingData.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Membros no grupo
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Precisam Dados</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingMembers.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Aguardando dados de acesso
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencidos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{overdueMembers.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Prazo de 24h expirado
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmados</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {pendingData.filter(item => item.status === 'CONFIRMED').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Dados confirmados pelos membros
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Formulário para enviar dados */}
      {pendingMembers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Enviar Dados de Acesso
            </CardTitle>
            <CardDescription>
              Envie os dados de acesso para os membros que estão aguardando
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={showSendForm} onOpenChange={setShowSendForm}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Dados de Acesso
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Enviar Dados de Acesso</DialogTitle>
                  <DialogDescription>
                    Selecione um membro e envie os dados de acesso do serviço de streaming
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Membro</label>
                    <Select value={selectedUser} onValueChange={setSelectedUser}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um membro" />
                      </SelectTrigger>
                      <SelectContent>
                        {pendingMembers.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              <span>{item.user.name}</span>
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

                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" onClick={() => setShowSendForm(false)} className="flex-1">
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleSendAccessData}
                      disabled={!selectedUser || !deliveryType || !content || sendingData === selectedUser}
                      className="flex-1"
                    >
                      {sendingData === selectedUser ? 'Enviando...' : 'Enviar Dados'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}

      {/* Lista de membros */}
      <Card>
        <CardHeader>
          <CardTitle>Status dos Membros</CardTitle>
          <CardDescription>
            Acompanhe o status dos dados de acesso de cada membro
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum membro neste grupo
            </div>
          ) : (
            <div className="space-y-4">
              {pendingData.map((item) => (
                <Card
                  key={item.id}
                  className={`${item.isOverdue ? 'border-destructive/50 bg-destructive/5' : ''}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{item.user.name}</div>
                          <div className="text-sm text-muted-foreground">{item.user.email}</div>
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
                      <Alert className="mt-4 border-destructive/50 bg-destructive/5">
                        <AlertTriangle className="w-4 h-4 text-destructive" />
                        <AlertDescription className="text-destructive">
                          O prazo de 24 horas para envio dos dados de acesso expirou!
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {item.lastDelivery && (
                      <div className="mt-4 p-3 bg-muted/50 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-muted-foreground">Última Entrega</span>
                          <Badge variant="outline" className="text-xs">
                            {getDeliveryTypeLabel(item.lastDelivery.deliveryType)}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Send className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              Enviado em {new Date(item.lastDelivery.sentAt).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          {item.lastDelivery.confirmedAt && (
                            <div className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-green-600" />
                              <span className="text-xs text-green-600">
                                Confirmado
                              </span>
                            </div>
                          )}
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
