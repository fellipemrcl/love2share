# Mudanças Realizadas: Controle de maxMembers com Escolha do Usuário

## Resumo
O `maxMembers` (número máximo de membros de um grupo) é controlado pelo usuário dentro dos limites do streaming. O usuário pode escolher quantas vagas quer disponibilizar, mas não pode exceder o número de telas simultâneas do streaming.

## Fórmula de Validação
```
maxMembers ≤ número de telas simultâneas do streaming
maxMembers ≥ número atual de membros no grupo
```

**Exemplo**: Netflix com 4 telas simultâneas:
- Usuário pode criar grupo com 2, 3 ou 4 membros
- Não pode criar com mais de 4 membros
- Se já tem 3 membros, não pode reduzir para menos de 3

## Arquivos Modificados

### 1. `src/components/MyGroupsClient/index.tsx`
- **Restaurado**: Campo editável `maxMembers` no formulário de edição
- **Adicionado**: Validação para não exceder limites do streaming
- **Adicionado**: Validação para não reduzir abaixo do número atual de membros

### 2. `src/components/CreateGroupForm/index.tsx`
- **Restaurado**: Seletor de `maxMembers` no formulário de criação
- **Adicionado**: Opções limitadas baseadas no streaming selecionado
- **Mantido**: Interface intuitiva mostrando vagas disponíveis

### 3. `src/app/api/groups/my/route.ts` (API de edição de grupos pelo usuário)
- **Restaurado**: Possibilidade de usuários editarem `maxMembers`
- **Adicionado**: Validação contra limites do streaming
- **Adicionado**: Validação para não reduzir abaixo do número atual

### 4. `src/app/api/groups/route.ts` (API de criação de grupos)
- **Restaurado**: Aceitação do parâmetro `maxMembers` da requisição
- **Adicionado**: Validação se não excede o limite do streaming
- **Mantido**: Geração automática de nome e descrição

### 5. `src/lib/group-helpers.ts` (NOVO ARQUIVO)
- **Criado**: Funções utilitárias para calcular e validar `maxMembers`
- `calculateMaxMembersForGroup()`: Calcula baseado nos streamings do grupo
- `updateGroupMaxMembers()`: Atualiza automaticamente o valor
- `validateGroupMemberLimit()`: Valida se um número de membros é válido

## Comportamento Atual

### Para Usuários Comuns (OWNER/MEMBER):
- ✅ Podem editar nome, descrição e `maxMembers` do grupo
- ✅ `maxMembers` limitado pelo número de telas do streaming
- ✅ Não podem reduzir abaixo do número atual de membros
- ✅ Interface mostra claramente os limites e validações

### Para Administradores:
- ✅ Mantêm controle total sobre `maxMembers` no painel administrativo
- ✅ Podem ajustar manualmente se necessário, mesmo acima dos limites normais

### Na Criação de Grupos:
- ✅ Usuário escolhe quantas vagas quer disponibilizar
- ✅ Opções limitadas ao número de telas do streaming
- ✅ Interface intuitiva mostrando "X vagas (Y membros total)"
- ✅ Relacionamento com streaming criado automaticamente

## Benefícios
1. **Flexibilidade**: Usuários podem escolher quantas vagas disponibilizar
2. **Segurança**: Validação impede exceder limites técnicos do streaming
3. **Proteção**: Não permite reduzir membros abaixo do número atual
4. **Usabilidade**: Interface clara mostrando opções e limites
5. **Controle**: Administradores mantêm controle total quando necessário

## Próximos Passos Sugeridos
1. Implementar atualização automática quando streamings são modificados
2. Adicionar validação quando usuários tentam se juntar a grupos cheios
3. Notificar usuários quando o `maxMembers` é atualizado automaticamente
