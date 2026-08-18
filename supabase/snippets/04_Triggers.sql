-- ============================================================
-- 04 - TRIGGERS
-- ============================================================

-- Trigger: Auto-criar perfil após registro no Auth
CREATE OR REPLACE FUNCTION public.processar_novo_usuario()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.perfis (id, nome_completo, url_avatar, papel)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'nome_completo',
    NEW.raw_user_meta_data->>'url_avatar',
    COALESCE((NEW.raw_user_meta_data->>'papel')::papel_usuario, 'aluno')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER ao_criar_usuario_auth
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.processar_novo_usuario();

-- Trigger: Atualizar contador de votos na tabela duvidas
CREATE OR REPLACE FUNCTION public.atualizar_contagem_votos()
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

CREATE TRIGGER ao_alterar_voto
  AFTER INSERT OR DELETE ON public.votos_duvida
  FOR EACH ROW EXECUTE FUNCTION public.atualizar_contagem_votos();
