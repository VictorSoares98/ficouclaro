-- ============================================================
-- 01 - ENUMS
-- ============================================================
CREATE TYPE papel_usuario AS ENUM ('aluno', 'professor');
CREATE TYPE status_sessao AS ENUM ('aguardando', 'ativa', 'encerrada');
CREATE TYPE tipo_enquete AS ENUM ('multipla_escolha', 'nuvem_palavras', 'escala_clareza', 'ranking');
CREATE TYPE status_enquete AS ENUM ('rascunho', 'ativa', 'encerrada');
CREATE TYPE sinal_ritmo AS ENUM ('muito_rapido', 'boiando', 'tudo_certo', 'muito_devagar');
CREATE TYPE tipo_grupo_estudo AS ENUM ('estudo', 'reforco', 'monitoria', 'projeto', 'outro');
CREATE TYPE status_grupo_estudo AS ENUM ('ativo', 'inativo');
CREATE TYPE status_registro_encontro AS ENUM ('concluido', 'pendente', 'cancelado');
