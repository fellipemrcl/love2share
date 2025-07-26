# 🔧 Troubleshooting: Teste de Autenticação

## Problema: "Não autorizado" no Insomnia

### 1. **Primeiro, teste este endpoint de debug:**

**URL:** `GET http://localhost:3000/api/auth/test`
**Headers:** 
```
Authorization: Bearer SEU_JWT_TOKEN_AQUI
Content-Type: application/json
```

### 2. **Verificações importantes:**

#### ✅ **No Insomnia:**
- Token está no campo correto: `Authentication > Bearer Token`
- OU header manual: `Authorization: Bearer <token>`
- **NÃO** adicione "Bearer " se já está no campo Bearer Token

#### ✅ **Token JWT válido:**
- Começa com `eyJ`
- Não tem espaços ou quebras de linha
- Foi copiado completamente
- Não expirou (JWT geralmente expira em 1 hora)

#### ✅ **Servidor:**
- Reinicie o servidor Next.js após adicionar variáveis de ambiente
- Verifique se não há erros no console do servidor

### 3. **Como configurar no Insomnia:**

#### Opção A: Authentication Tab
```
Type: Bearer Token
Token: eyJhbGciOiJSUzI1NiIsI... (sem "Bearer ")
```

#### Opção B: Headers Tab
```
Authorization: Bearer eyJhbGciOiJSUzI1NiIsI...
```

### 4. **Variáveis de ambiente necessárias:**

Certifique-se que estão no `.env.local`:
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
SIGNING_SECRET=whsec_test_... # Para webhooks (opcional para API)
```

### 5. **Se ainda não funcionar:**

#### Obtenha um token fresco:
```javascript
// No console do navegador (página do seu app)
const token = await window.Clerk.session.getToken();
console.log("Token fresh:", token);
```

#### Verifique se o token é válido:
```javascript
// Decodifique o JWT para ver expiração
const payload = JSON.parse(atob(token.split('.')[1]));
console.log("Token expira em:", new Date(payload.exp * 1000));
console.log("Token payload:", payload);
```

### 6. **Teste o endpoint de debug:**

O endpoint `/api/auth/test` vai retornar:
```json
{
  "success": true,
  "userId": "user_xxxxx",
  "sessionId": "sess_xxxxx",
  "hasAuthHeader": true,
  "authHeader": "Bearer eyJhbGc...",
  "timestamp": "2025-07-26T..."
}
```

### 7. **Logs do servidor:**

Monitore o console do Next.js para ver:
```
=== DEBUG AUTH ===
Authorization header: Bearer eyJhbGc...
CLERK_SECRET_KEY exists: true
Auth result: { userId: 'user_xxx', ... }
```

---

## 🚀 Depois de resolver o auth, teste os streamings:

1. Use o endpoint de debug para confirmar auth
2. Copie o `userId` retornado
3. Teste os endpoints de streaming
4. Monitore logs do servidor para mais detalhes
