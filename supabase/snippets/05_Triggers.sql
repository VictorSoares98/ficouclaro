-- ============================================================
-- 04 - TRIGGERS
-- ============================================================

-- Trigger: Auto-criar perfil após registro no Auth
CREATE OR REPLACE FUNCTION private.processar_novo_usuario()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_papel public.papel_usuario;
BEGIN
  -- Bloco seguro para conversão de tipo ENUM
  BEGIN
    v_papel := (NEW.raw_user_meta_data->>'papel')::public.papel_usuario;
  EXCEPTION WHEN OTHERS THEN
    v_papel := 'aluno'::public.papel_usuario;
  END;

  INSERT INTO public.usuarios (id, nome_completo, url_avatar, papel, termos_aceitos_em, versao_termos)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome_completo', NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    COALESCE(NEW.raw_user_meta_data->>'url_avatar', NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
    COALESCE(v_papel, 'aluno'::public.papel_usuario),
    (NEW.raw_user_meta_data->>'termos_aceitos_em')::TIMESTAMPTZ,
    NEW.raw_user_meta_data->>'versao_termos'
  );
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS ao_criar_usuario_auth ON auth.users;
CREATE TRIGGER ao_criar_usuario_auth
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION private.processar_novo_usuario();

-- Trigger: Atualizar contador de votos na tabela duvidas
CREATE OR REPLACE FUNCTION private.atualizar_contagem_votos()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.duvidas SET votos = votos + 1 WHERE id = NEW.duvida_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.duvidas SET votos = votos - 1 WHERE id = OLD.duvida_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS ao_alterar_voto ON public.votos_duvida;
CREATE TRIGGER ao_alterar_voto
  AFTER INSERT OR DELETE ON public.votos_duvida
  FOR EACH ROW EXECUTE FUNCTION private.atualizar_contagem_votos();

-- Trigger: Atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION private.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Moderação Automática de Conteúdo
CREATE OR REPLACE FUNCTION private.trigger_moderacao_texto()
RETURNS TRIGGER AS $$
DECLARE
  v_mod JSONB;
  v_strikes INT;
BEGIN
  -- Prevenção de Falsidade Ideológica (Impersonation)
  IF TG_TABLE_NAME = 'duvidas' AND NEW.autor_id IS NOT NULL AND NEW.autor_id != auth.uid() THEN
    RAISE EXCEPTION 'IMPERSONATION_BLOCKED: Não é permitido assinar uma dúvida em nome de outro usuário.';
  END IF;

  IF auth.uid() IS NOT NULL THEN
    SELECT quantidade INTO v_strikes FROM private.strikes_moderacao WHERE aluno_id = auth.uid();
    IF v_strikes >= 3 THEN
      RAISE EXCEPTION 'MODERATION_SUSPENDED: Usuário suspenso por múltiplas violações das regras.';
    END IF;
  END IF;

  v_mod := private.verificar_moderacao(
    COALESCE(
      CASE 
        WHEN TG_TABLE_NAME = 'duvidas' THEN NEW.texto 
        WHEN TG_TABLE_NAME = 'avaliacoes_rapidas' THEN NEW.comentario 
        WHEN TG_TABLE_NAME = 'respostas_enquete' THEN (NEW.resposta->>'texto')
        ELSE ''
      END, ''
    )
  );

  IF (v_mod->>'sensitive')::boolean THEN
    RAISE EXCEPTION 'MODERATION_BLOCKED: Dados sensíveis não são permitidos por questões de privacidade.';
  END IF;

  IF (v_mod->>'offensive')::boolean THEN
    IF auth.uid() IS NOT NULL THEN
      IF TG_TABLE_NAME = 'duvidas' THEN
        NEW.autor_id := auth.uid();
      ELSIF TG_TABLE_NAME = 'avaliacoes_rapidas' OR TG_TABLE_NAME = 'respostas_enquete' THEN
        NEW.aluno_id := auth.uid();
      END IF;
      
      INSERT INTO private.strikes_moderacao (aluno_id, quantidade)
      VALUES (auth.uid(), 1)
      ON CONFLICT (aluno_id) DO UPDATE SET quantidade = private.strikes_moderacao.quantidade + 1, ultima_ocorrencia = NOW();
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS ao_inserir_duvida_mod ON public.duvidas;
CREATE TRIGGER ao_inserir_duvida_mod
  BEFORE INSERT ON public.duvidas
  FOR EACH ROW EXECUTE FUNCTION private.trigger_moderacao_texto();

DROP TRIGGER IF EXISTS ao_inserir_avaliacao_mod ON public.avaliacoes_rapidas;
CREATE TRIGGER ao_inserir_avaliacao_mod
  BEFORE INSERT ON public.avaliacoes_rapidas
  FOR EACH ROW EXECUTE FUNCTION private.trigger_moderacao_texto();

DROP TRIGGER IF EXISTS ao_inserir_enquete_mod ON public.respostas_enquete;
CREATE TRIGGER ao_inserir_enquete_mod
  BEFORE INSERT ON public.respostas_enquete
  FOR EACH ROW EXECUTE FUNCTION private.trigger_moderacao_texto();

DROP TRIGGER IF EXISTS ao_atualizar_usuario ON public.usuarios;
CREATE TRIGGER ao_atualizar_usuario
  BEFORE UPDATE ON public.usuarios
  FOR EACH ROW EXECUTE FUNCTION private.handle_updated_at();

DROP TRIGGER IF EXISTS ao_atualizar_disciplina ON public.disciplinas;
CREATE TRIGGER ao_atualizar_disciplina
  BEFORE UPDATE ON public.disciplinas
  FOR EACH ROW EXECUTE FUNCTION private.handle_updated_at();

DROP TRIGGER IF EXISTS ao_atualizar_sessao ON public.sessoes;
CREATE TRIGGER ao_atualizar_sessao
  BEFORE UPDATE ON public.sessoes
  FOR EACH ROW EXECUTE FUNCTION private.handle_updated_at();

DROP TRIGGER IF EXISTS ao_atualizar_enquete ON public.enquetes;
CREATE TRIGGER ao_atualizar_enquete
  BEFORE UPDATE ON public.enquetes
  FOR EACH ROW EXECUTE FUNCTION private.handle_updated_at();

DROP TRIGGER IF EXISTS ao_atualizar_duvida ON public.duvidas;
CREATE TRIGGER ao_atualizar_duvida
  BEFORE UPDATE ON public.duvidas
  FOR EACH ROW EXECUTE FUNCTION private.handle_updated_at();

DROP TRIGGER IF EXISTS ao_atualizar_grupo_estudo ON public.grupos_estudo;
CREATE TRIGGER ao_atualizar_grupo_estudo
  BEFORE UPDATE ON public.grupos_estudo
  FOR EACH ROW EXECUTE FUNCTION private.handle_updated_at();

-- Trigger: Auto-vincular criador como monitor do grupo de estudo
CREATE OR REPLACE FUNCTION private.vincular_criador_grupo()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.grupos_membros (grupo_id, usuario_id, is_monitor)
  VALUES (NEW.id, NEW.criador_id, true)
  ON CONFLICT (grupo_id, usuario_id) DO UPDATE SET is_monitor = true;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS ao_criar_grupo_estudo ON public.grupos_estudo;
CREATE TRIGGER ao_criar_grupo_estudo
  AFTER INSERT ON public.grupos_estudo
  FOR EACH ROW EXECUTE FUNCTION private.vincular_criador_grupo();

