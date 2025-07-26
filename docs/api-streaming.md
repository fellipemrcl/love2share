# API de Streamings - Documentação e Exemplos

## Endpoints Criados

### 1. **POST /api/streaming** - Criar um novo streaming
Cria um novo serviço de streaming no sistema.

**Body da requisição:**
```json
{
  "name": "Netflix Premium",
  "description": "Plano Premium com 4 telas simultâneas e qualidade 4K",
  "platform": "Netflix",
  "logoUrl": "https://assets.nflxext.com/ffe/siteui/common/icons/nficon2023.ico",
  "websiteUrl": "https://www.netflix.com",
  "monthlyPrice": 55.90,
  "maxUsers": 4,
  "maxSimultaneousScreens": 4,
  "isActive": true
}
```

**Resposta de sucesso (201):**
```json
{
  "id": "uuid-generated",
  "name": "Netflix Premium",
  "description": "Plano Premium com 4 telas simultâneas e qualidade 4K",
  "platform": "Netflix",
  "logoUrl": "https://assets.nflxext.com/ffe/siteui/common/icons/nficon2023.ico",
  "websiteUrl": "https://www.netflix.com",
  "monthlyPrice": 55.90,
  "maxUsers": 4,
  "maxSimultaneousScreens": 4,
  "isActive": true,
  "createdAt": "2025-01-26T12:00:00Z",
  "updatedAt": "2025-01-26T12:00:00Z"
}
```

### 2. **GET /api/streaming** - Listar streamings
Lista todos os streamings ativos com contagem de grupos.

**Resposta de sucesso (200):**
```json
[
  {
    "id": "uuid",
    "name": "Netflix Premium",
    "description": "Plano Premium com 4 telas",
    "platform": "Netflix",
    "logoUrl": "https://assets.nflxext.com/ffe/siteui/common/icons/nficon2023.ico",
    "websiteUrl": "https://www.netflix.com",
    "monthlyPrice": 55.90,
    "maxUsers": 4,
    "maxSimultaneousScreens": 4,
    "isActive": true,
    "createdAt": "2025-01-26T12:00:00Z",
    "updatedAt": "2025-01-26T12:00:00Z",
    "_count": {
      "streamingGroupStreamings": 3
    }
  }
]
```

### 3. **GET /api/streaming/[id]** - Buscar streaming específico
Busca um streaming por ID com detalhes dos grupos.

**Resposta de sucesso (200):**
```json
{
  "id": "uuid",
  "name": "Netflix Premium",
  "description": "Plano Premium",
  "platform": "Netflix",
  "logoUrl": "https://...",
  "websiteUrl": "https://www.netflix.com",
  "monthlyPrice": 55.90,
  "maxUsers": 4,
  "maxSimultaneousScreens": 4,
  "isActive": true,
  "createdAt": "2025-01-26T12:00:00Z",
  "updatedAt": "2025-01-26T12:00:00Z",
  "streamingGroupStreamings": [
    {
      "id": "uuid",
      "streamingGroup": {
        "id": "group-uuid",
        "name": "Família Silva"
      }
    }
  ],
  "_count": {
    "streamingGroupStreamings": 1
  }
}
```

### 4. **PUT /api/streaming/[id]** - Atualizar streaming
Atualiza as informações de um streaming.

**Body da requisição (campos opcionais):**
```json
{
  "name": "Netflix Premium HD",
  "monthlyPrice": 59.90,
  "maxSimultaneousScreens": 6
}
```

### 5. **DELETE /api/streaming/[id]** - Deletar streaming
Deleta ou desativa um streaming.

- Se não há grupos usando: deleta permanentemente
- Se há grupos usando: desativa o streaming

**Resposta quando há dependências (200):**
```json
{
  "message": "Streaming desativado pois está sendo usado por grupos",
  "streaming": { /* dados do streaming desativado */ }
}
```

**Resposta quando não há dependências (200):**
```json
{
  "message": "Streaming deletado com sucesso"
}
```

## Validações Implementadas

- **Nome**: obrigatório, mínimo 1 caractere
- **Plataforma**: obrigatória, mínimo 1 caractere
- **URLs**: devem ser URLs válidas ou strings vazias
- **Preços**: devem ser números positivos
- **Usuários/Telas**: devem ser números inteiros positivos
- **Duplicatas**: não permite mesmo nome + plataforma

## Autenticação

Todos os endpoints requerem autenticação via Clerk. O middleware automaticamente verifica o token JWT.

## Códigos de Status

- **200**: Sucesso
- **201**: Criado com sucesso
- **400**: Dados inválidos
- **401**: Não autorizado
- **404**: Não encontrado
- **409**: Conflito (duplicata)
- **500**: Erro interno do servidor

## Como Usar com o Hook

```typescript
import { useStreamingApi } from "@/hooks/useStreamingApi";

function StreamingComponent() {
  const { 
    createStreaming, 
    getStreamings, 
    isLoading, 
    error 
  } = useStreamingApi();

  const handleCreate = async () => {
    const result = await createStreaming({
      name: "Disney+ Premium",
      platform: "Disney+",
      monthlyPrice: 29.90,
      maxUsers: 4,
      maxSimultaneousScreens: 4
    });

    if (result) {
      console.log("Streaming criado:", result);
    }
  };

  // ... resto do componente
}
```
