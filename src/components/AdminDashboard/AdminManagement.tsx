'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Loader2, Shield, ShieldCheck, UserPlus, UserMinus, Mail } from 'lucide-react'

interface AdminManagementResult {
  success: boolean
  message?: string
  error?: string
  admins?: string[]
}

export function AdminManagement() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [admins, setAdmins] = useState<string[]>([])
  const [result, setResult] = useState<AdminManagementResult | null>(null)

  const fetchAdmins = async () => {
    try {
      const response = await fetch('/api/admin/manage-admins')
      const data = await response.json()
      
      if (data.success) {
        setAdmins(data.admins || [])
      }
    } catch (error) {
      console.error('Error fetching admins:', error)
    }
  }

  useEffect(() => {
    fetchAdmins()
  }, [])

  const handleAdminAction = async (action: 'add' | 'remove', targetEmail?: string) => {
    try {
      setLoading(true)
      setResult(null)
      
      const emailToUse = targetEmail || email
      
      if (!emailToUse.trim()) {
        setResult({
          success: false,
          error: 'Email é obrigatório'
        })
        return
      }

      const response = await fetch('/api/admin/manage-admins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          email: emailToUse.trim()
        }),
      })

      const data = await response.json()
      setResult(data)
      
      if (data.success) {
        setAdmins(data.admins || [])
        if (!targetEmail) {
          setEmail('') // Limpar o campo apenas se não foi uma ação da lista
        }
        
        // Auto-clear success messages after 5 seconds
        setTimeout(() => {
          setResult(null)
        }, 5000)
      }
    } catch (error) {
      console.error('Error managing admin:', error)
      setResult({
        success: false,
        error: 'Erro de conexão ao gerenciar administrador'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Gerenciar Administradores
        </CardTitle>
        <CardDescription>
          Adicione ou remova permissões de administrador para usuários
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Formulário para adicionar admin */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email do usuário</Label>
            <div className="flex gap-2">
              <Input
                id="email"
                type="email"
                placeholder="usuario@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              <Button 
                onClick={() => handleAdminAction('add')}
                disabled={loading || !email.trim()}
                className="whitespace-nowrap"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                Tornar Admin
              </Button>
            </div>
          </div>
        </div>

        {/* Resultado da operação */}
        {result && (
          <Alert className={result.success ? 'border-green-500' : 'border-red-500'}>
            <AlertDescription>
              {result.success ? result.message : result.error}
            </AlertDescription>
          </Alert>
        )}

        {/* Lista de administradores atuais */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            Administradores Atuais ({admins.length})
          </h3>
          
          {admins.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum administrador encontrado</p>
          ) : (
            <div className="space-y-2">
              {admins.map((adminEmail) => (
                <div key={adminEmail} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{adminEmail}</span>
                    <Badge variant="secondary" className="text-xs">
                      Admin
                    </Badge>
                  </div>
                  
                  {admins.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAdminAction('remove', adminEmail)}
                      disabled={loading}
                      className="text-red-600 hover:text-red-700"
                    >
                      {loading ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <UserMinus className="h-3 w-3" />
                      )}
                      Remover
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Nota sobre segurança */}
        <div className="text-xs text-muted-foreground p-3 bg-muted rounded-lg">
          <strong>⚠️ Importante:</strong> Apenas usuários registrados no sistema podem ser promovidos a administradores. 
          O último administrador não pode ser removido para manter a segurança do sistema.
        </div>
      </CardContent>
    </Card>
  )
}
