-- ============================================================
-- 02_Views - VIEWS PUBLICAS E SEGURAS
-- ============================================================

-- ============================================================
-- 1. VIEW MAPA DE GRUPOS DE ESTUDO (Baseado em vw_pockets_mapa)
-- Evita vazamento de dados confidenciais e PII dos membros
-- ============================================================
CREATE OR REPLACE VIEW public.view_grupos_estudo_publicos WITH (security_invoker = true) AS
SELECT 
  g.id,
  g.nome,
  g.slug,
  g.descricao,
  g.tipo,
  g.disciplina_id,
  g.instituicao,
  g.campus,
  g.predio_bloco,
  g.sala,
  g.local_especifico,
  g.cidade,
  g.estado,
  g.pais,
  g.place_id,
  g.lat,
  g.lng,
  g.dia_reuniao,
  g.horario_reuniao,
  g.vagas,
  g.codigo_convite,
  g.categoria_universidade,
  g.status_academico,
  g.status,
  g.created_at,
  u.nome_completo AS criador_nome,
  u.url_avatar AS criador_avatar,
  COUNT(m.id)::INT AS total_membros
FROM public.grupos_estudo g
LEFT JOIN public.usuarios u ON g.criador_id = u.id
LEFT JOIN public.grupos_membros m ON m.grupo_id = g.id
WHERE g.status = 'ativo'
GROUP BY g.id, u.nome_completo, u.url_avatar;
