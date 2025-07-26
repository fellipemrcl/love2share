# 🧪 Teste da API de Streaming - Insomnia

Este arquivo contém a configuração completa para testar todos os endpoints da API de Streaming no Insomnia.

## 📥 Como Importar no Insomnia

1. **Abra o Insomnia**
2. **Importe o arquivo**:
   - Clique em `Create` > `Import From` > `File`
   - Selecione o arquivo `insomnia-streaming-api.json`
   - Clique em `Scan` e depois `Import`

3. **Configure as variáveis de ambiente**:
   - Clique no dropdown de ambiente (canto superior esquerdo)
   - Selecione `Base Environment`
   - Edite as variáveis:

```json
{
  "base_url": "http://localhost:3000",
  "clerk_token": "SEU_TOKEN_JWT_DO_CLERK_AQUI",
  "streaming_id": "ID_DO_STREAMING_PARA_TESTES"
}
```

## 🔑 Como Obter o Token do Clerk

### Opção 1: Via DevTools do Navegador
1. Faça login no seu app
2. Abra o DevTools (F12)
3. Vá para `Application` > `Local Storage` ou `Session Storage`
4. Procure por chaves relacionadas ao Clerk
5. Copie o token JWT

### Opção 2: Via Console do Navegador
```javascript
// Execute no console do navegador após fazer login
const token = await window.Clerk.session.getToken();
console.log(token);
```

### Opção 3: Via Interceptação de Requisições
1. Abra o DevTools > Network
2. Faça uma requisição no seu app
3. Encontre uma requisição para sua API
4. Copie o valor do header `Authorization`

## 📋 Endpoints Incluídos

### ✅ **Requisições de Sucesso:**
1. **Listar Streamings** - GET `/api/streaming`
2. **Criar Streaming (Netflix)** - POST `/api/streaming`
3. **Criar Streaming (Disney+)** - POST `/api/streaming`
4. **Buscar por ID** - GET `/api/streaming/{id}`
5. **Atualizar Streaming** - PUT `/api/streaming/{id}`
6. **Deletar Streaming** - DELETE `/api/streaming/{id}`

### ❌ **Testes de Validação:**
7. **Teste Validação (Erro 400)** - Dados inválidos
8. **Teste Duplicata (Erro 409)** - Streaming duplicado

## 🔄 Fluxo de Teste Recomendado

1. **Configure o token** no ambiente
2. **Liste streamings** para ver o estado inicial
3. **Crie o Netflix** usando a requisição #2
4. **Copie o ID** do streaming criado para a variável `streaming_id`
5. **Busque por ID** para ver os detalhes
6. **Atualize o streaming** com novos dados
7. **Teste validações** com dados inválidos
8. **Teste duplicata** tentando criar outro Netflix
9. **Delete o streaming** ao final

## 🎯 Variáveis Dinâmicas

O arquivo usa variáveis que você pode configurar:

- **`base_url`**: URL base da sua aplicação (padrão: `http://localhost:3000`)
- **`clerk_token`**: Seu token JWT do Clerk para autenticação
- **`streaming_id`**: ID de um streaming para testes de operações específicas

## 📊 Códigos de Status Esperados

- **200**: Sucesso (GET, PUT, DELETE)
- **201**: Criado com sucesso (POST)
- **400**: Dados inválidos (validação)
- **401**: Token inválido/ausente
- **404**: Streaming não encontrado
- **409**: Streaming duplicado
- **500**: Erro interno

## 🚀 Executando o Servidor

Antes de testar, certifique-se de que o servidor Next.js está rodando:

```bash
npm run dev
```

## 🔧 Troubleshooting

### ❌ **Erro 401 - Não autorizado**
- Verifique se o token está correto
- Confirme se o token não expirou
- Teste fazer login novamente

### ❌ **Erro de Conexão**
- Confirme se o servidor está rodando em `localhost:3000`
- Verifique se a URL base está correta

### ❌ **Token não funciona**
- Tente obter um novo token
- Verifique se está usando o token correto (JWT, não session ID)

## 💡 Dicas

- **Use a ordem sugerida** dos testes para melhor experiência
- **Salve os IDs** dos streamings criados para reutilização
- **Monitore o console** do servidor para logs detalhados
- **Teste cenários de erro** para validar a robustez da API
