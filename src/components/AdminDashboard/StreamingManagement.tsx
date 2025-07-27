'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SafeImage } from '@/components/ui/safe-image'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Streaming {
  id: string
  name: string
  description: string | null
  platform: string
  logoUrl: string | null
  websiteUrl: string | null
  monthlyPrice: number | null
  maxUsers: number
  maxSimultaneousScreens: number
  isActive: boolean
  createdAt: string
}

export function StreamingManagement() {
  const [streamings, setStreamings] = useState<Streaming[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingStreaming, setEditingStreaming] = useState<Streaming | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    platform: '',
    description: '',
    logoUrl: '',
    websiteUrl: '',
    monthlyPrice: '',
    maxUsers: '1',
    maxSimultaneousScreens: '1'
  })

  useEffect(() => {
    fetchStreamings()
  }, [])

  const fetchStreamings = async () => {
    try {
      const response = await fetch('/api/admin/streamings')
      if (response.ok) {
        const data = await response.json()
        setStreamings(data)
      }
    } catch (error) {
      console.error('Error fetching streamings:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleStreamingStatus = async (streamingId: string, newStatus: boolean) => {
    try {
      console.log('Toggling streaming status:', { streamingId, newStatus })
      
      const response = await fetch(`/api/admin/streamings/${streamingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: newStatus }),
      })

      if (response.ok) {
        console.log('Status toggle successful')
        // Atualizar o estado local imediatamente para feedback visual rápido
        setStreamings(prev => prev.map(streaming => 
          streaming.id === streamingId 
            ? { ...streaming, isActive: newStatus }
            : streaming
        ))
        toast(`Streaming ${newStatus ? 'ativado' : 'desativado'}`, {
          description: `O status foi atualizado com sucesso.`,
        })
        // Também recarregar os dados para garantir sincronização
        await fetchStreamings()
      } else {
        const errorData = await response.json()
        console.error('Failed to update streaming status:', errorData)
        toast.error('Erro ao atualizar status', {
          description: errorData.error || 'Ocorreu um erro inesperado.',
        })
        // Reverter mudança local se a API falhar
        await fetchStreamings()
      }
    } catch (error) {
      console.error('Error updating streaming status:', error)
      alert('Erro de conexão ao atualizar streaming')
      // Reverter mudança local em caso de erro
      await fetchStreamings()
    }
  }

  const handleAddStreaming = () => {
    setFormData({
      name: '',
      platform: '',
      description: '',
      logoUrl: '',
      websiteUrl: '',
      monthlyPrice: '',
      maxUsers: '1',
      maxSimultaneousScreens: '1'
    })
    setIsAddDialogOpen(true)
  }

  const handleEditStreaming = (streaming: Streaming) => {
    setEditingStreaming(streaming)
    setFormData({
      name: streaming.name,
      platform: streaming.platform,
      description: streaming.description || '',
      logoUrl: streaming.logoUrl || '',
      websiteUrl: streaming.websiteUrl || '',
      monthlyPrice: streaming.monthlyPrice?.toString() || '',
      maxUsers: streaming.maxUsers.toString(),
      maxSimultaneousScreens: streaming.maxSimultaneousScreens.toString()
    })
    setIsEditDialogOpen(true)
  }

  const handleSaveStreaming = async () => {
    try {
      setLoading(true)
      console.log('Saving streaming:', { editingStreaming: !!editingStreaming, formData })
      
      if (editingStreaming) {
        // Editar streaming existente
        const response = await fetch(`/api/admin/streamings/${editingStreaming.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })

        if (response.ok) {
          console.log('Streaming updated successfully')
          await fetchStreamings()
          setIsEditDialogOpen(false)
          resetForm()
          toast('Streaming atualizado!', {
            description: 'As alterações foram salvas com sucesso.',
          })
        } else {
          const errorData = await response.json()
          console.error('Failed to update streaming:', errorData)
          toast.error('Erro ao atualizar streaming', {
            description: errorData.error || 'Erro desconhecido',
          })
        }
      } else {
        // Criar novo streaming
        const response = await fetch('/api/admin/streamings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })

        if (response.ok) {
          console.log('Streaming created successfully')
          await fetchStreamings()
          setIsAddDialogOpen(false)
          resetForm()
          toast('Streaming criado!', {
            description: 'O novo serviço de streaming foi adicionado com sucesso.',
          })
        } else {
          const errorData = await response.json()
          console.error('Failed to create streaming:', errorData)
          toast.error('Erro ao criar streaming', {
            description: errorData.error || 'Erro desconhecido',
          })
        }
      }
    } catch (error) {
      console.error('Error saving streaming:', error)
      alert('Erro de conexão ao salvar streaming')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      platform: '',
      description: '',
      logoUrl: '',
      websiteUrl: '',
      monthlyPrice: '',
      maxUsers: '1',
      maxSimultaneousScreens: '1'
    })
    setEditingStreaming(null)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Streamings</CardTitle>
          <CardDescription>Carregando dados dos streamings...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Streamings</CardTitle>
          <CardDescription>
            Total de {streamings.length} serviços de streaming cadastrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={handleAddStreaming} className="cursor-pointer">Adicionar Novo Streaming</Button>
            </div>
            
            {streamings.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum serviço de streaming encontrado.
              </p>
            ) : (
              <div className="space-y-3">
                {streamings.map((streaming) => (
                  <div key={streaming.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <SafeImage
                        src={streaming.logoUrl || ''}
                        alt={streaming.name}
                        width={40}
                        height={40}
                        className="rounded object-cover"
                        fallbackText={streaming.name.charAt(0)}
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">{streaming.name}</p>
                          <Badge variant={streaming.isActive ? "default" : "secondary"}>
                            {streaming.isActive ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{streaming.platform}</p>
                        <p className="text-xs text-muted-foreground">
                            {streaming.monthlyPrice ? `R$ ${streaming.monthlyPrice.toFixed(2)}/mês` : 'Preço não definido'} •{' '}
                          {streaming.maxUsers} usuários • {streaming.maxSimultaneousScreens} telas
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => toggleStreamingStatus(streaming.id, !streaming.isActive)}
                        disabled={loading}
                        className="cursor-pointer"
                      >
                        {streaming.isActive ? 'Desativar' : 'Ativar'}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditStreaming(streaming)}
                        className="cursor-pointer"
                      >
                        Editar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal para Adicionar Streaming */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Streaming</DialogTitle>
            <DialogDescription>
              Preencha os dados do novo serviço de streaming
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Netflix"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="platform">Plataforma</Label>
              <Input
                id="platform"
                value={formData.platform}
                onChange={(e) => setFormData(prev => ({ ...prev, platform: e.target.value }))}
                placeholder="Ex: Netflix"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição do serviço"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logoUrl">URL do Logo</Label>
              <Input
                id="logoUrl"
                value={formData.logoUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, logoUrl: e.target.value }))}
                placeholder="https://example.com/logo.png"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="websiteUrl">URL do Website</Label>
              <Input
                id="websiteUrl"
                value={formData.websiteUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, websiteUrl: e.target.value }))}
                placeholder="https://example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthlyPrice">Preço Mensal (R$)</Label>
              <Input
                id="monthlyPrice"
                type="number"
                step="0.01"
                value={formData.monthlyPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, monthlyPrice: e.target.value }))}
                placeholder="45.90"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxUsers">Máximo de Usuários</Label>
              <Input
                id="maxUsers"
                type="number"
                value={formData.maxUsers}
                onChange={(e) => setFormData(prev => ({ ...prev, maxUsers: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxSimultaneousScreens">Máximo de Telas Simultâneas</Label>
              <Input
                id="maxSimultaneousScreens"
                type="number"
                value={formData.maxSimultaneousScreens}
                onChange={(e) => setFormData(prev => ({ ...prev, maxSimultaneousScreens: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddDialogOpen(false)
              resetForm()
            }} className="cursor-pointer">
              Cancelar
            </Button>
            <Button onClick={handleSaveStreaming} disabled={loading} className="cursor-pointer">
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para Editar Streaming */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Streaming</DialogTitle>
            <DialogDescription>
              Modificar dados do serviço de streaming
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-platform">Plataforma</Label>
              <Input
                id="edit-platform"
                value={formData.platform}
                onChange={(e) => setFormData(prev => ({ ...prev, platform: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Descrição</Label>
              <Input
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição do serviço"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-logoUrl">URL do Logo</Label>
              <Input
                id="edit-logoUrl"
                value={formData.logoUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, logoUrl: e.target.value }))}
                placeholder="https://example.com/logo.png"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-websiteUrl">URL do Website</Label>
              <Input
                id="edit-websiteUrl"
                value={formData.websiteUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, websiteUrl: e.target.value }))}
                placeholder="https://example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-monthlyPrice">Preço Mensal (R$)</Label>
              <Input
                id="edit-monthlyPrice"
                type="number"
                step="0.01"
                value={formData.monthlyPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, monthlyPrice: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-maxUsers">Máximo de Usuários</Label>
              <Input
                id="edit-maxUsers"
                type="number"
                value={formData.maxUsers}
                onChange={(e) => setFormData(prev => ({ ...prev, maxUsers: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-maxSimultaneousScreens">Máximo de Telas Simultâneas</Label>
              <Input
                id="edit-maxSimultaneousScreens"
                type="number"
                value={formData.maxSimultaneousScreens}
                onChange={(e) => setFormData(prev => ({ ...prev, maxSimultaneousScreens: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditDialogOpen(false)
              resetForm()
            }} className="cursor-pointer">
              Cancelar
            </Button>
            <Button onClick={handleSaveStreaming} disabled={loading} className="cursor-pointer">
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
