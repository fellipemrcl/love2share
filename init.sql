-- Inicialização do banco de dados Love2Share
-- Este arquivo é executado automaticamente quando o container PostgreSQL é criado

-- Criar extensões úteis
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";

-- Configurações de timezone
SET timezone = 'America/Sao_Paulo';

-- Exemplo de tabela inicial (opcional - remova se não precisar)
-- CREATE TABLE IF NOT EXISTS health_check (
--     id SERIAL PRIMARY KEY,
--     status VARCHAR(10) DEFAULT 'OK',
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- INSERT INTO health_check (status) VALUES ('OK');
