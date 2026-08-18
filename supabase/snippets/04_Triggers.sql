-- ============================================================
-- 04 - TRIGGERS
-- ============================================================

-- Trigger: Auto-criar perfil após registro no Auth
CREATE OR REPLACE FUNCTION public.processar_novo_usuario()
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

  INSERT INTO public.usuarios (id, nome_completo, url_avatar, papel)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'nome_completo',
    NEW.raw_user_meta_data->>'url_avatar',
    COALESCE(v_papel, 'aluno'::public.papel_usuario)
  );
  
  RETURN NEW;
END;
$$;

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
