'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, UserX } from 'lucide-react'

interface RemoveUserResult {
  success: boolean
  message: string
  data?: {
    deletedUser: {
      id: string
      email: string
      name: string | null
      clerkId: string
    }
    removedRelationships: {
      groupMemberships: number
      ownedAccounts: number
      createdGroups: number
    }
  }
}

export function RemoveUserForm() {
  const [searchType, setSearchType] = useState<string>('')
  const [searchValue, setSearchValue] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<RemoveUserResult | null>(null)

  const searchOptions = [
    { value: 'email', label: 'Email' },
    { value: 'name', label: 'Nome' },
    { value: 'id', label: 'ID do Usuário' },
    { value: 'clerkId', label: 'Clerk ID' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!searchType || !searchValue.trim()) {
      setResult({
        success: false,
        message: 'Por favor, selecione um tipo de busca e insira um valor'
      })
      return
    }

    try {
      setLoading(true)
      setResult(null)

      const response = await fetch('/api/admin/scripts/remove-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          searchType,
          searchValue: searchValue.trim()
        })
      })

      const data = await response.json()
      setResult(data)

      // Limpar o formulário se bem-sucedido
      if (data.success) {
        setSearchValue('')
        setSearchType('')
      }
    } catch (error) {
      console.error('Error removing user:', error)
      setResult({
        success: false,
        message: 'Erro de conexão ao remover usuário'
      })
    } finally {
      setLoading(false)
    }
  }

  const getPlaceholder = () => {
    switch (searchType) {
      case 'email':
        return 'exemplo@email.com ou parte do email'
      case 'name':
        return 'Nome do usuário ou parte do nome'
      case 'id':
        return 'ID único do usuário (UUID)'
      case 'clerkId':
        return 'ID do Clerk (user_...)'
      default:
        return 'Selecione um tipo de busca primeiro'
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <UserX className="h-5 w-5 text-destructive" />
          <CardTitle className="text-destructive">Remover Usuário</CardTitle>
        </div>
        <CardDescription>
          Remove um usuário específico do sistema. Todas as suas participações em grupos, 
          contas de streaming e grupos criados serão também removidos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="searchType">Tipo de Busca</Label>
              <Select value={searchType} onValueChange={setSearchType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione como buscar" />
                </SelectTrigger>
                <SelectContent>
                  {searchOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="searchValue">Valor da Busca</Label>
              <Input
                id="searchValue"
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder={getPlaceholder()}
                disabled={!searchType}
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="destructive"
            disabled={loading || !searchType || !searchValue.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Removendo usuário...
              </>
            ) : (
              <>
                <UserX className="mr-2 h-4 w-4" />
                Remover Usuário
              </>
            )}
          </Button>

          {result && (
            <Alert variant={result.success ? "default" : "destructive"}>
              <AlertDescription>
                {result.message}
                {result.success && result.data && (
                  <div className="mt-2 text-sm">
                    <strong>Usuário removido:</strong> {result.data.deletedUser.name || result.data.deletedUser.email}
                    <br />
                    <strong>Relacionamentos removidos:</strong>
                    <ul className="mt-1 ml-4 list-disc">
                      <li>{result.data.removedRelationships.groupMemberships} participações em grupos</li>
                      <li>{result.data.removedRelationships.ownedAccounts} contas de streaming próprias</li>
                      <li>{result.data.removedRelationships.createdGroups} grupos criados</li>
                    </ul>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </form>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="text-sm font-medium mb-2">💡 Dicas de busca:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li><strong>Email:</strong> Busca parcial (não precisa ser exato)</li>
            <li><strong>Nome:</strong> Busca parcial (não precisa ser exato)</li>
            <li><strong>ID do Usuário:</strong> Deve ser o UUID completo</li>
            <li><strong>Clerk ID:</strong> Deve ser o ID completo do Clerk</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
