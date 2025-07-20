# Docker Setup - Love2Share

Este projeto utiliza Docker Compose para configurar o banco de dados PostgreSQL.

## 📋 Pré-requisitos

- Docker
- Docker Compose

## 🚀 Como usar

### 1. Configurar variáveis de ambiente

Copie o arquivo de exemplo e configure suas variáveis:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
POSTGRES_USER=love2share_user
POSTGRES_PASSWORD=love2share_password
POSTGRES_DB=love2share_db
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
DATABASE_URL=postgresql://love2share_user:love2share_password@localhost:5432/love2share_db
```

### 2. Subir o banco de dados

```bash
# Subir o PostgreSQL em background
docker-compose up -d

# Ver os logs
docker-compose logs -f postgres

# Verificar status
docker-compose ps
```

### 3. Acessar o banco de dados

```bash
# Conectar via psql
docker-compose exec postgres psql -U love2share_user -d love2share_db

# Ou usar sua ferramenta favorita (pgAdmin, DBeaver, etc.) com as credenciais:
# Host: localhost
# Port: 5432
# Database: love2share_db
# Username: love2share_user
# Password: love2share_password
```

### 4. Comandos úteis

```bash
# Parar os serviços
docker-compose down

# Parar e remover volumes (CUIDADO: apaga todos os dados)
docker-compose down -v

# Reconstruir os containers
docker-compose up --build

# Ver logs de um serviço específico
docker-compose logs postgres
```

## 📁 Estrutura dos arquivos

- `docker-compose.yml` - Configuração dos serviços Docker
- `.env` - Variáveis de ambiente (não versionado)
- `.env.example` - Exemplo de variáveis de ambiente
- `init.sql` - Script de inicialização do banco de dados

## 🔧 Personalização

### Alternar versão do PostgreSQL

No `docker-compose.yml`, altere a linha:
```yaml
image: postgres:15-alpine  # Para postgres:14-alpine, postgres:13-alpine, etc.
```

### Adicionar outros serviços

Você pode adicionar Redis, pgAdmin ou outros serviços ao `docker-compose.yml`:

```yaml
services:
  # ... postgres config ...
  
  redis:
    image: redis:7-alpine
    container_name: love2share-redis
    ports:
      - "6379:6379"
    networks:
      - love2share-network

  pgadmin:
    image: dpage/pgadmin4
    container_name: love2share-pgadmin
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@love2share.com
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "8080:80"
    networks:
      - love2share-network
```

## 🚨 Importante

- Nunca commite o arquivo `.env` no Git
- Use senhas fortes em produção
- O banco de dados persiste os dados no volume `postgres_data`
- Para resetar completamente o banco, use `docker-compose down -v`
