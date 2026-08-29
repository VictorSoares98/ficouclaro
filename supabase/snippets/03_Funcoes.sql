-- ============================================================
-- 03 - FUNÇÕES GLOBAIS
-- ============================================================

-- Retorna o papel do usuário autenticado
CREATE OR REPLACE FUNCTION public.obter_meu_papel()
RETURNS papel_usuario AS $$
  SELECT papel FROM public.usuarios WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Verifica se usuário está matriculado em uma disciplina
CREATE OR REPLACE FUNCTION public.esta_matriculado(p_disciplina_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.matriculas
    WHERE disciplina_id = p_disciplina_id AND aluno_id = auth.uid()
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Exclui a conta do próprio usuário autenticado (Direito ao Esquecimento - LGPD)
CREATE OR REPLACE FUNCTION public.delete_own_account()
RETURNS void AS $$
BEGIN
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fun��o para agregar m�tricas de sess�es (Dashboard)
-- Substitui a necessidade de uma VIEW, mantendo os snippets organizados.
CREATE OR REPLACE FUNCTION public.get_course_insights(p_disciplina_id UUID)
RETURNS TABLE (
  sessao_id UUID,
  disciplina_id UUID,
  topico TEXT,
  iniciada_em TIMESTAMPTZ,
  status status_sessao,
  media_estrelas NUMERIC,
  total_avaliacoes BIGINT,
  total_duvidas BIGINT,
  total_sinais BIGINT,
  total_enquetes BIGINT
) AS $ $
  SELECT
    s.id AS sessao_id,
    s.disciplina_id,
    s.topico,
    s.iniciada_em,
    s.status,
    COALESCE((SELECT AVG(nota) FROM public.avaliacoes_rapidas WHERE sessao_id = s.id), 0) AS media_estrelas,
    (SELECT COUNT(*) FROM public.avaliacoes_rapidas WHERE sessao_id = s.id) AS total_avaliacoes,
    (SELECT COUNT(*) FROM public.duvidas WHERE sessao_id = s.id) AS total_duvidas,
    (SELECT COUNT(*) FROM public.sinais_ritmo WHERE sessao_id = s.id) AS total_sinais,
    (SELECT COUNT(*) FROM public.enquetes WHERE sessao_id = s.id) AS total_enquetes
  FROM public.sessoes s
  WHERE s.disciplina_id = p_disciplina_id;
$ $ LANGUAGE sql STABLE SECURITY DEFINER;
