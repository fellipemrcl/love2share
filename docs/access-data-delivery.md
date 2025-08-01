# Sistema de Entrega de Dados de Acesso

Esta funcionalidade implementa um sistema completo para gerenciar a entrega e confirmação de dados de acesso aos serviços de streaming após a aprovação de membros em grupos.

## Fluxo do Sistema

### 1. Aprovação de Membro
Quando um administrador aprova uma solicitação de entrada em um grupo:
- O membro é adicionado ao grupo com status `PENDING` para dados de acesso
- Um prazo de 24 horas é automaticamente definido para o administrador enviar os dados
- O sistema define `accessDataDeadline` 24 horas no futuro

### 2. Envio de Dados pelo Administrador
O administrador tem até 24 horas para enviar os dados através de:
- **Página de Grupos**: `/groups/access-data`

Tipos de entrega disponíveis:
- `CREDENTIALS`: Login e senha do serviço
- `INVITE_LINK`: Link de convite para participar
- `ACCOUNT_SHARING`: Dados de conta compartilhada
- `INSTRUCTIONS`: Instruções especiais

Quando dados são enviados:
- Status muda para `SENT`
- `accessDataSentAt` é registrado
- Membro é notificado para confirmar

### 3. Confirmação pelo Membro
O membro acessa sua página de dados (`/groups/access-data`) e:
- Visualiza os dados recebidos
- Confirma se conseguiu acessar o serviço
- Pode reportar problemas se algo não funcionar

Quando confirmado:
- Status muda para `CONFIRMED`
- `accessDataConfirmedAt` é registrado
- Processo é finalizado

### 4. Controle de Prazos
- **Script de verificação**: `npm run check-overdue`
- **Execução recomendada**: A cada hora via cron job
- **Ação**: Marca dados como `OVERDUE` após 24h sem envio

## Estrutura do Banco

### Novos Campos em `StreamingGroupUser`
```prisma
accessDataStatus      AccessDataStatus @default(PENDING)
accessDataSentAt      DateTime?
accessDataConfirmedAt DateTime?
accessDataDeadline    DateTime?
accessDataDeliveries  AccessDataDelivery[]
```

### Novo Enum `AccessDataStatus`
- `PENDING`: Aguardando envio pelo admin
- `SENT`: Enviado, aguardando confirmação
- `CONFIRMED`: Confirmado pelo membro
- `OVERDUE`: Prazo vencido

### Nova Tabela `AccessDataDelivery`
Registra histórico de todas as entregas de dados:
```prisma
model AccessDataDelivery {
  id                    String
  streamingGroupUserId  String
  deliveryType          AccessDataDeliveryType
  content               String  // Dados de acesso
  isInviteLink          Boolean
  sentAt                DateTime
  confirmedAt           DateTime?
  notes                 String?
}
```

## APIs Disponíveis

### Para Administradores

#### `GET /api/access-data`
Lista membros pendentes com seus status e prazos.

#### `POST /api/access-data`
Envia dados de acesso para um membro.
```json
{
  "streamingGroupUserId": "uuid",
  "deliveryType": "CREDENTIALS",
  "content": "email: user@email.com\nsenha: minhasenha",
  "isInviteLink": false,
  "notes": "Instruções adicionais"
}
```

### Para Membros

#### `GET /api/access-data/confirm`
Lista grupos do membro e status dos dados de acesso.

#### `POST /api/access-data/confirm`
Confirma recebimento dos dados.
```json
{
  "streamingGroupUserId": "uuid",
  "confirmed": true,
  "notes": "Funcionou perfeitamente!"
}
```

## Componentes React

### `AccessDataManagement`
- **Local**: `/groups/access-data` (aba Administrador)
- **Uso**: Administradores gerenciarem envio de dados
- **Recursos**: 
  - Lista de membros pendentes
  - Formulário de envio
  - Controle de prazos
  - Estatísticas resumidas

### `MemberAccessDataConfirmation`
- **Local**: `/groups/access-data`
- **Uso**: Membros confirmarem recebimento
- **Recursos**:
  - Lista de grupos do membro
  - Histórico de entregas
  - Botões de confirmação/problema
  - Status visual

## Notificações e Badges

### `PendingAccessDataBadge`
Badge que aparece no menu de navegação mostrando quantos dados precisam ser confirmados pelo membro.

### Integração com Navegação
Funcionalidade acessível através do menu "Grupos > Dados de Acesso" na navegação principal.

## Automação e Manutenção

### Script de Verificação
```bash
npm run check-overdue
```

### Configuração de Cron Job (recomendado)
```bash
# A cada hora
0 * * * * cd /path/to/project && npm run check-overdue

# Ou duas vezes por dia
0 8,20 * * * cd /path/to/project && npm run check-overdue
```

## Estados e Transições

```
PENDING → SENT → CONFIRMED
    ↓       ↓
 OVERDUE  OVERDUE
```

1. **PENDING → SENT**: Admin envia dados dentro de 24h
2. **SENT → CONFIRMED**: Membro confirma funcionamento
3. **PENDING → OVERDUE**: 24h passaram sem envio
4. **SENT → OVERDUE**: Possível, mas menos comum

## Melhorias Futuras

1. **Notificações por Email**: Enviar lembretes automáticos
2. **Webhooks**: Integração com Slack/Discord
3. **Templates**: Modelos pré-definidos para diferentes tipos de dados
4. **Criptografia**: Criptografar dados sensíveis armazenados
5. **Auditoria**: Log detalhado de todas as ações
6. **Analytics**: Métricas de tempo de entrega e confirmação
