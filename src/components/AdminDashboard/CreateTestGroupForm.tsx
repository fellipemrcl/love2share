'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Users, RefreshCw } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  clerkId: string
}

interface CreateTestGroupFormData {
  ownerId: string
  name: string
  description: string
  maxMembers: number
}

export function CreateTestGroupForm() {
  const [users, setUsers] = useState<User[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  
  const [formData, setFormData] = useState<CreateTestGroupFormData>({
    ownerId: '',
    name: '',
    description: '',
    maxMembers: 4
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true)
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      } else {
        console.error('Erro ao buscar usuários')
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
    } finally {
      setLoadingUsers(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.ownerId || !formData.name || !formData.description) {
      setResult({
        success: false,
        message: 'Por favor, preencha todos os campos obrigatórios'
      })
      return
    }

    try {
      setSubmitting(true)
      setResult(null)

      const response = await fetch('/api/admin/scripts/create-test-group-custom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      setResult(data)

      if (data.success) {
        // Limpar formulário após sucesso
        setFormData({
          ownerId: '',
          name: '',
          description: '',
          maxMembers: 4
        })

        // Auto-clear success message after 5 seconds
        setTimeout(() => {
          setResult(null)
        }, 5000)
      }
    } catch (error) {
      console.error('Erro ao criar grupo:', error)
      setResult({
        success: false,
        message: 'Erro de conexão ao criar grupo'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof CreateTestGroupFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Users className="h-5 w-5" />
          <CardTitle>Criar Grupo de Teste Personalizado</CardTitle>
        </div>
        <CardDescription>
          Crie um grupo de teste definindo o proprietário e demais informações
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="owner">Proprietário do Grupo *</Label>
            <div className="flex space-x-2">
              <Select
                value={formData.ownerId}
                onValueChange={(value) => handleInputChange('ownerId', value)}
                disabled={loadingUsers || submitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingUsers ? "Carregando usuários..." : "Selecione o proprietário"} />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name || user.email} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={fetchUsers}
                disabled={loadingUsers || submitting}
              >
                <RefreshCw className={`h-4 w-4 ${loadingUsers ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            {loadingUsers && (
              <p className="text-sm text-muted-foreground">Carregando lista de usuários...</p>
            )}
            {!loadingUsers && users.length === 0 && (
              <p className="text-sm text-red-600">Nenhum usuário encontrado. Crie usuários de teste primeiro.</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nome do Grupo *</Label>
            <Input
              id="name"
              type="text"
              placeholder="Ex: Grupo Netflix - Família Silva"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              placeholder="Ex: Compartilhamento de conta Netflix entre amigos para dividir custos"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              disabled={submitting}
              required
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxMembers">Máximo de Membros</Label>
            <Select
              value={formData.maxMembers.toString()}
              onValueChange={(value) => handleInputChange('maxMembers', parseInt(value))}
              disabled={submitting}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} membros
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            disabled={submitting || loadingUsers || !formData.ownerId || !formData.name || !formData.description}
            className="w-full"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando Grupo...
              </>
            ) : (
              <>
                <Users className="mr-2 h-4 w-4" />
                Criar Grupo de Teste
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
        </form>
      </CardContent>
    </Card>
  )
}
