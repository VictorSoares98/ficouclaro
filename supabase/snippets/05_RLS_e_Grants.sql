-- ============================================================
-- 05 - ROW LEVEL SECURITY (RLS) E POLÍTICAS
-- ============================================================
-- Nota: A role 'anon' não possui grants no schema public (Zero-Trust).

-- Role: authenticated & service_role (Mantém ALL)
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO authenticated, service_role;

ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disciplinas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matriculas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sinais_ritmo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquetes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.respostas_enquete ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duvidas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votos_duvida ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avaliacoes_rapidas ENABLE ROW LEVEL SECURITY;

-- POLICIES: usuarios
CREATE POLICY "Usuário lê o próprio perfil" ON public.usuarios FOR SELECT USING (id = auth.uid());
CREATE POLICY "Usuário atualiza o próprio perfil" ON public.usuarios FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Professor vê perfis de alunos matriculados" ON public.usuarios FOR SELECT USING (
  obter_meu_papel() = 'professor' AND EXISTS (
    SELECT 1 FROM public.matriculas m
    JOIN public.disciplinas d ON m.disciplina_id = d.id
    WHERE m.aluno_id = usuarios.id AND d.professor_id = auth.uid()
  )
);

-- POLICIES: disciplinas
CREATE POLICY "Professor gerencia próprias disciplinas" ON public.disciplinas FOR ALL USING (professor_id = auth.uid());
CREATE POLICY "Usuários autenticados podem ver disciplinas" ON public.disciplinas FOR SELECT USING (auth.role() = 'authenticated');

-- POLICIES: matriculas
CREATE POLICY "Aluno se matricula" ON public.matriculas FOR INSERT WITH CHECK (aluno_id = auth.uid());
CREATE POLICY "Aluno vê próprias matrículas" ON public.matriculas FOR SELECT USING (aluno_id = auth.uid());
CREATE POLICY "Professor vê matrículas das próprias disciplinas" ON public.matriculas FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.disciplinas d WHERE d.id = matriculas.disciplina_id AND d.professor_id = auth.uid())
);

-- POLICIES: sessoes
CREATE POLICY "Professor gerencia próprias sessões" ON public.sessoes FOR ALL USING (professor_id = auth.uid());
CREATE POLICY "Aluno vê sessões das disciplinas matriculadas" ON public.sessoes FOR SELECT USING (esta_matriculado(disciplina_id));

-- POLICIES: sinais_ritmo
CREATE POLICY "Aluno envia sinal de ritmo" ON public.sinais_ritmo FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.sessoes s WHERE s.id = sinais_ritmo.sessao_id AND s.status = 'ativa' AND esta_matriculado(s.disciplina_id))
);
CREATE POLICY "Professor lê sinais das próprias sessões" ON public.sinais_ritmo FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.sessoes s WHERE s.id = sinais_ritmo.sessao_id AND s.professor_id = auth.uid())
);

-- POLICIES: enquetes
CREATE POLICY "Professor gerencia enquetes" ON public.enquetes FOR ALL USING (
  EXISTS (SELECT 1 FROM public.sessoes s WHERE s.id = enquetes.sessao_id AND s.professor_id = auth.uid())
);
CREATE POLICY "Aluno vê enquetes ativas" ON public.enquetes FOR SELECT USING (
  status = 'ativa' AND EXISTS (SELECT 1 FROM public.sessoes s WHERE s.id = enquetes.sessao_id AND esta_matriculado(s.disciplina_id))
);

-- POLICIES: respostas_enquete
CREATE POLICY "Aluno responde enquetes" ON public.respostas_enquete FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.enquetes e JOIN public.sessoes s ON s.id = e.sessao_id WHERE e.id = respostas_enquete.enquete_id AND e.status = 'ativa' AND esta_matriculado(s.disciplina_id))
);
CREATE POLICY "Professor lê respostas" ON public.respostas_enquete FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.enquetes e JOIN public.sessoes s ON s.id = e.sessao_id WHERE e.id = respostas_enquete.enquete_id AND s.professor_id = auth.uid())
);

-- POLICIES: duvidas
CREATE POLICY "Aluno envia dúvida" ON public.duvidas FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.sessoes s WHERE s.id = duvidas.sessao_id AND s.status = 'ativa' AND esta_matriculado(s.disciplina_id))
);
CREATE POLICY "Todos veem dúvidas da sessão" ON public.duvidas FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.sessoes s WHERE s.id = duvidas.sessao_id AND (s.professor_id = auth.uid() OR esta_matriculado(s.disciplina_id)))
);
CREATE POLICY "Professor responde dúvidas" ON public.duvidas FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.sessoes s WHERE s.id = duvidas.sessao_id AND s.professor_id = auth.uid())
);

-- POLICIES: votos_duvida
CREATE POLICY "Aluno dá upvote" ON public.votos_duvida FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.duvidas d JOIN public.sessoes s ON s.id = d.sessao_id WHERE d.id = votos_duvida.duvida_id AND s.status = 'ativa' AND esta_matriculado(s.disciplina_id))
);

-- POLICIES: avaliacoes_rapidas
CREATE POLICY "Aluno avalia aula" ON public.avaliacoes_rapidas FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.sessoes s WHERE s.id = avaliacoes_rapidas.sessao_id AND s.status = 'encerrada' AND esta_matriculado(s.disciplina_id))
);
CREATE POLICY "Professor lê avaliações" ON public.avaliacoes_rapidas FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.sessoes s WHERE s.id = avaliacoes_rapidas.sessao_id AND s.professor_id = auth.uid())
);

-- GRANT da função analítica (Dashboard)
GRANT EXECUTE ON FUNCTION public.get_course_insights(UUID) TO authenticated;