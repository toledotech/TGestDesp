-- Limpar todas as tabelas mantendo apenas estrutura e dados de usuários
DELETE FROM transacoes_financeiras;
DELETE FROM processos;
DELETE FROM veiculos;
DELETE FROM clientes;
DELETE FROM configuracoes_empresa;

-- Reset sequences se existirem
DROP SEQUENCE IF EXISTS protocolo_seq;
CREATE SEQUENCE protocolo_seq START 1;