# Merge Plan: Ficou Claro? + Mapa de Grupos de Estudo

**Documento Estratégico de Fusão (pré-implementação)**
**Status:** Rascunho para validação com o orientador. Nenhum código foi alterado.
**Substitui:** `PIVOT_PLAN.md` do repositório Centavia (que foi descartado como projeto principal).

---

## 1. Decisão Estratégica

Após análise com o orientador, o **Ficou Claro?** passa a ser o projeto principal dos editais, por ser naturalmente alinhado a **educação**. O **Find My Pockets** deixa de ser um produto e vira **doador de módulos**, principalmente o **mapa da página inicial**.

| Antes (Find My Pockets)        | Depois (Ficou Claro? + Mapa)                                |
| ------------------------------ | ----------------------------------------------------------- |
| Mapa de células evangelísticas | Mapa de **grupos de estudo e reforço escolar entre alunos** |
| Líder / Mentor / RH            | Aluno-monitor / Professor / Coordenação                     |
| Métricas de "alcançados"       | Presença, encontros realizados, dúvidas resolvidas          |

> [!IMPORTANT]
> Regra de higiene: **nenhum dado, termo ou texto do domínio anterior** (religioso) migra para o novo projeto. Apenas código de infraestrutura neutro (mapa, clusterização, padrões). O banco será o **Supabase atual do Ficou Claro**, nunca o banco do Find My Pockets.

> **Escopo de público:** universitários **maiores de idade**. Menores de idade ficam para uma fase futura (seção 3.4). **Nome mantido:** "Ficou Claro?".

### Proposta de valor unificada

> "Em sala, o professor mede o ritmo da aula em tempo real. Fora dela, os alunos encontram e organizam grupos de estudo e reforço entre pares, com privacidade (LGPD) por design."

Isso fecha o ciclo educacional: **aula (Ficou Claro) → dúvida não resolvida → grupo de estudo (Mapa)**.

---

## 2. Inventário: O que vem de cada projeto

### 2.1 Já existe no Ficou Claro (base)

- Vue 3, Quasar, Pinia, Tailwind (`tw-`), Capacitor, Supabase.
- Perfis `aluno` / `professor` (enum `papel_usuario`), disciplinas com `codigo_convite`, matrículas, sessões, enquetes, termômetro de ritmo, dúvidas com upvote, avaliação pós-aula.
- LGPD: aceite versionado, exportação JSON/CSV, exclusão de conta, anonimato por hash (`hash_eleitor`).
- Realtime via `RealtimeManager`, `useAsyncOperation`.
- Existe a pasta `src-pwa/` (com `manifest.json`, `register-sw.ts` e `sw/`). **A verificar:** se o modo PWA está de fato habilitado em `quasar.config.ts` e qual o estado do service worker.

### 2.2 A portar do Find My Pockets

| Item                                   | Origem (FMP)                                                    | Observação                                                           |
| -------------------------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------- |
| Composable do mapa (Leaflet + cluster) | `src/composables/usePocketsMap.ts`                              | Renomear para `useStudyGroupsMap`; remover KPIs e baseline religioso |
| Núcleo do mapa                         | `src/components/map/LeafletMapCore.vue`                         | Reaproveitar                                                         |
| Card do marcador                       | `src/components/map/MapPocketCard.vue`                          | Reescrever textos e campos                                           |
| Modal de localização                   | `src/components/dashboard/pockets/PocketLocationModal.vue`      | Adaptar para criar grupo                                             |
| Geocoding / Places                     | `src/services/google.service.ts`                                | Decisão pendente, ver comparativo em 3.5                             |
| Modelo de local                        | tabela `pockets` (lat, lng, cidade, horário, sala, bloco, slug) | Base para `grupos_estudo`                                            |
| Vínculo de membros / monitor           | `pockets_membros` + `pockets_auxiliares`                        | Unificados em `grupos_membros` com `is_monitor`                      |
| Registro de encontros                  | tabela `metricas`                                               | Remodelada como `registros_encontro` (3.1)                           |
| Convite                                | `tokens_afiliacao`                                              | Avaliar; o `codigo_convite` do Ficou Claro pode bastar               |

### 2.3 O que NÃO será portado

- Colunas religiosas da `metricas` (a tabela em si é remodelada, ver 3.1), `vinculos_mentoria`, `testemunhos`, `solicitacoes_lideranca`, `historico_lideranca`, papéis `lider/mentor/rh`.
- Tabela `pockets_auxiliares` (substituída pela flag `is_monitor`).
- `BASELINE_ESTUDANTES_ALCANCADOS` (número fixo herdado do domínio antigo).
- Qualquer texto, imagem ou seed do projeto anterior.

---

## 3. Modelo de Domínio Fundido

### 3.1 Entidades (propostas)

**Verificação feita:** nenhuma tabela atual do Ficou Claro cumpre a função de `metricas`. `sessoes` registra aula do professor e `matriculas` liga aluno a disciplina; nenhuma registra encontros de grupo. Logo, **aproveitar `metricas` faz sentido**.

```
usuarios (existente)
  papel: aluno | professor      (inalterado; monitor NÃO é papel global)

grupos_estudo (adaptado de `pockets`)
  id, criador_id -> usuarios (equivale ao antigo lider_id)
  nome, descricao, tipo: estudo | reforco
  disciplina_id -> disciplinas (opcional)
  instituicao, campus, predio_bloco, sala (local institucional)
  lat, lng (do campus/prédio, não de residência)
  dia_semana, horario, vagas
  visibilidade: publico (ver 3.3), codigo_convite, status: ativo | inativo

grupos_membros (une `pockets_membros` + `pockets_auxiliares`)
  grupo_id, usuario_id
  is_monitor BOOLEAN DEFAULT false      <- flag, substitui a tabela de auxiliares
  UNIQUE(grupo_id, usuario_id)

registros_encontro (remodelagem de `metricas`)
  id, grupo_id, registrado_por -> usuarios (antigo usuario_id/auxiliar_id)
  data_referencia, topico
  participantes INTEGER            (mantido: contagem agregada)
  duracao_minutos INTEGER          (novo)
  duvidas_resolvidas INTEGER       (novo; une com o ciclo do Ficou Claro)
  observacoes TEXT                 (mantido)
  status: concluido | pendente | cancelado   (antigo Concluido/Pendente/Atrasado)
  motivo_cancelamento TEXT         (antigo motivo_pula_reuniao)
  client_uuid UUID UNIQUE          (novo; idempotência do sync offline)
  created_at
```

**Remodelagem da `metricas`, coluna a coluna**

| Coluna antiga                                                                            | Destino                                                                                |
| ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `pocket_id`                                                                              | `grupo_id`                                                                             |
| `usuario_id` / `auxiliar_id`                                                             | `registrado_por` (monitor ou criador)                                                  |
| `data_referencia`, `participantes`, `observacoes`                                        | mantidas                                                                               |
| `motivo_pula_reuniao`                                                                    | `motivo_cancelamento`                                                                  |
| `status` ('Concluido' etc.)                                                              | enum minúsculo `concluido/pendente/cancelado`                                          |
| `salvacoes_reconciliacoes`, `curas`, `batismos_espirito_santo`, `alcancados_evangelismo` | **removidas**                                                                          |
| `foto_url`                                                                               | **removida** no MVP (foto de pessoas adultas ainda exige base legal; menos burocracia) |

> [!NOTE]
> Como o Ficou Claro usa **snippets semânticos sem migration por data** (ADR-004), a remodelagem é feita **criando as tabelas já no formato final** em `02_Tabelas.sql`, não com `ALTER`. Não há dado a migrar, pois o banco do Ficou Claro não tem registros do domínio antigo.

### 3.2 Regras de arquitetura (continuam valendo)

- SQL apenas por snippets semânticos `01` a `07` + `npm run db:build` (ADR-004). O `Master Schema.sql` permanece somente leitura.
- Nada de `any`; FSD (components, stores, services); `@/` absoluto; Realtime só via `RealtimeManager`.
- Novo módulo em `src/modules/` seguindo o padrão dos módulos existentes (a confirmar na inspeção do diretório).
- RLS obrigatória nas novas tabelas: membro lê seu grupo, criador e monitor registram encontros, anônimo/autenticado lê apenas colunas seguras via view (seção 3.3).

### 3.3 O que significa "grupo público" (níveis de exposição)

"Público" não é binário. Proposta: **o grupo é descobrível por todos, mas cada dado só aparece conforme quem olha**.

| Dado do grupo                           | Visitante (sem login) | Logado |    Membro    | Monitor / Criador |
| --------------------------------------- | :-------------------: | :----: | :----------: | :---------------: |
| Nome, tipo, matéria, instituição/campus |          sim          |  sim   |     sim      |        sim        |
| Pino no mapa (campus/prédio)            |          sim          |  sim   |     sim      |        sim        |
| Dia, horário, vagas restantes           |          sim          |  sim   |     sim      |        sim        |
| Descrição completa                      |          não          |  sim   |     sim      |        sim        |
| Sala / local específico                 |          não          |  sim   |     sim      |        sim        |
| Lista de membros (nomes)                |          não          |  não   | só monitores |        sim        |
| Contato (WhatsApp/Instagram)            |          não          |  não   |     sim      |        sim        |
| Registros de encontro (métricas)        |          não          |  não   |   agregado   |     completo      |

Implementação: **view pública com colunas seguras** (padrão já usado no FMP para o mapa) + RLS nas tabelas base.

**Escopos possíveis de visibilidade** (ordem crescente de restrição):

1. `publico`: matriz acima. **Recomendado para o MVP.**
2. `ies`: só logados com e-mail institucional verificado da mesma IES. _Futuro._
3. `turma`: só quem tem o código da disciplina. _Futuro; o `codigo_convite` já existe._

Mantém-se a coluna `visibilidade` como enum extensível, mas **só `publico` é implementado agora**.

> [!WARNING]
> Mesmo sendo público e para adultos, o mapa deve apontar **locais institucionais** (campus/prédio/biblioteca), nunca endereço residencial. Isso reduz risco e dispensa geocoding de endereço exato (seção 3.5).

### 3.4 Público maior de idade (escopo atual)

- Foco: **ensino superior, 18+**. Menores ficam para fase futura.
- Mecanismo mínimo, sem burocracia: **autodeclaração de maioridade** no aceite de termos, registrada com data e versão (já existe `termos_aceitos_em` e `versao_termos` em `usuarios`).
- Não coletar data de nascimento nem documento agora.
- A política de privacidade passa a citar geolocalização (campus) e grupos.
- **A confirmar:** se a autodeclaração é suficiente perante a IES e os editais. Sem esse aval, trato como hipótese, não como regra.
- Ao abrir para menores no futuro, será necessário: consentimento parental (LGPD, art. 14), revisão do mapa e moderação. Registrar como dívida de produto.

### 3.5 Geocoding: comparativo

Situação atual no FMP: `google.service.ts` chama uma Edge Function `google-maps-proxy` (chave do Google fica no servidor) para `suggest` (autocomplete) e `retrieve` (detalhes e coordenadas).

| Critério                         | Google Places (atual no FMP)                                                                                     | Nominatim público (OSM)                                                                   | Catálogo de IES + pino manual                |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | -------------------------------------------- |
| Custo                            | Pago por uso, com cota gratuita; **conferir valores atuais em `developers.google.com/maps/billing-and-pricing`** | Gratuito                                                                                  | Gratuito                                     |
| Chave de API                     | Sim (já isolada na Edge Function)                                                                                | Não                                                                                       | Não                                          |
| Limite                           | Conforme billing                                                                                                 | **máx. 1 requisição/segundo**, User-Agent identificável obrigatório                       | Nenhum                                       |
| Atribuição                       | Conforme termos Google                                                                                           | **Obrigatória (ODbL)**                                                                    | Se usar tiles OSM, atribuição dos tiles      |
| Autocomplete                     | Sim, com session token                                                                                           | Política restringe uso intensivo (confirmar na política antes de usar "busca ao digitar") | Busca local no catálogo, instantânea         |
| Qualidade para campus/prédio     | Excelente (POIs, nomes de faculdades)                                                                            | Boa, depende do mapeamento OSM de cada campus                                             | Total, pois você define                      |
| Esforço de integração            | Zero (já existe)                                                                                                 | Baixo (nova Edge Function ou chamada direta)                                              | Médio: criar tabela `instituicoes` e popular |
| Dependência externa              | Alta                                                                                                             | Média (servidor doado, capacidade limitada)                                               | Nenhuma                                      |
| Risco para o edital/demonstração | Cobrança ou cota estourada                                                                                       | Bloqueio se exceder 1 req/s                                                               | Baixo                                        |

**Fontes verificadas hoje:** política do Nominatim (limite 1 req/s, User-Agent, atribuição e licença ODbL). **Não verificados:** valores de preço do Google e a regra exata do Nominatim sobre autocomplete; devem ser conferidos antes da decisão final.

**Opções:**

- **A. Manter Google Places.** Menor esforço e melhor UX. Exige conta de billing e controle de cota.
- **B. Nominatim.** Gratuito, mas com limites rígidos; serve para busca pontual (botão "buscar"), não para autocomplete a cada tecla.
- **C. Catálogo de IES + pino arrastável (recomendado para o MVP).** Como os grupos são em locais institucionais, o aluno escolhe a instituição/campus de uma lista e ajusta o pino. Zero custo e zero chave. Pode evoluir para A ou B depois.

> [!NOTE]
> A opção C exige uma tabela `instituicoes` (nome, cidade, estado, lat, lng) com **dados reais**, de fonte oficial (ex.: cadastro e-MEC), não inventados. Posso começar com as IES do orientador e crescer por demanda, reaproveitando a ideia de `demandas_plantacao` do FMP (contagem de buscas por IES não cadastrada).

---

## 4. Feature Herói para os Editais

Fluxo de demonstração (vídeo do Campus Mobile):

1. Professor abre uma sessão e o **termômetro** mostra "Boiando" em um tópico.
2. Aluno com dúvida não resolvida abre o **mapa**, encontra um **grupo de reforço** próximo, na própria faculdade, e entra com o código.
3. O grupo faz o encontro; o monitor registra a **presença**, mesmo **sem internet** (offline-first).
4. Ao reconectar, os dados sincronizam. O professor vê no dashboard: dúvidas resolvidas por grupos e engajamento.

### 4.1 Escopo offline (PWA), mínimo viável

- Fila no IndexedDB para **registro de presença no encontro** e **envio de dúvidas**, com sync via Supabase RPC idempotente.
- Service Worker com cache do shell da app e dos tiles do mapa já visitados.
- Banner de conectividade (já existe tratamento de queda de rede; estender para fila pendente).

> [!NOTE]
> O offline-first é diferencial técnico para o TCC, mas **o escopo do edital deve ser o menor possível que funcione em vídeo**. Funcionar bem para um caso (presença) vale mais que cobrir tudo.

---

## 5. Alinhamento com os Editais

| Edital                   | Prazo          | Narrativa                                                           | Pendência                                                        |
| ------------------------ | -------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Campus Mobile (Educação) | **18/10/2026** | App mobile de feedback em tempo real + grupos de estudo entre pares | Vídeo demo da feature herói; verificar regulamento               |
| Sebrae Supernova         | 29/10/2026     | Modelo B2B: licenciamento para IES/cursinhos; gratuito para alunos  | **2º aluno da mesma IES** (requisito); validar regulamento atual |

> Os requisitos acima vêm do `PIVOT_PLAN.md` anterior e **devem ser reconferidos nos regulamentos oficiais** antes da submissão.

---

## 6. Plano de Execução (hoje: 09/10, faltam 9 dias para o Campus Mobile)

| Fase | Entrega                                                                                                          | Prazo alvo     |
| ---- | ---------------------------------------------------------------------------------------------------------------- | -------------- |
| 0    | Validar este plano com o orientador; inspecionar `quasar.config.ts`, `src-pwa/`, `src/modules/`                  | 10/10          |
| 1    | Schema: enums + `grupos_estudo`, `grupos_membros`, `registros_encontro`, RLS, RPCs; `npm run db:build`           | 11/10          |
| 2    | Portar mapa: `useStudyGroupsMap`, `LeafletMapCore`, card e modal; página inicial com mapa; criar/entrar em grupo | 13/10          |
| 3    | PWA: confirmar modo PWA, fila IndexedDB de presença, sync RPC                                                    | 15/10          |
| 4    | Polimento, rebranding visual unificado, política de privacidade atualizada                                       | 16/10          |
| 5    | Gravar vídeo no celular real e submeter Campus Mobile                                                            | **17 a 18/10** |
| 6    | Recrutar 2º aluno, 3 a 5 entrevistas com professores/monitores, submeter Sebrae                                  | até 29/10      |

---

## 7. Riscos

| Risco                                        | Mitigação                                                                   |
| -------------------------------------------- | --------------------------------------------------------------------------- |
| Prazo curto (9 dias)                         | Congelar escopo: mapa + criar/entrar + presença offline. Cortar o resto     |
| Custo/chave da API de mapas/geocoding        | Ver comparativo na seção 3.5; preferir catálogo de IES + pino manual no MVP |
| Usuário menor de idade entrar na plataforma  | Autodeclaração +18 no aceite de termos; revisar antes de abrir para menores |
| Exposição de localização de estudantes       | Local aproximado/institucional, contato só após ingresso, moderação básica  |
| Confusão de marca (Ficou Claro vs. "grupos") | Definir nome/slogan unificado (decisão em aberto)                           |
| Contaminação com o domínio antigo            | Checklist de higiene (seção 8) antes de qualquer commit                     |

---

## 8. Checklist de Higiene (antes da submissão)

- [ ] `grep` por termos do domínio antigo (testemunho, célula, salvação, líder, batismo, evangelismo, pocket) retorna zero.
- [ ] Nenhum seed ou dado do Find My Pockets no banco.
- [ ] Nenhuma chave em código; tudo via variáveis de ambiente.
- [ ] `npm run lint` e `vue-tsc` sem erros; `npm run db:build` executado.
- [ ] Política de privacidade cobre geolocalização e grupos.

---

## 9. Decisões Tomadas e Em Aberto

### Decididas (09/10)

1. **Nome:** mantém "Ficou Claro?".
2. **Grupos públicos**, com níveis de exposição definidos na seção 3.3.
3. **Monitor como flag** em `grupos_membros` (seção 3.1).
4. **Banco:** reutilizar o Supabase atual do Ficou Claro.
5. **Público:** universitários **maiores de idade**. Menores ficam fora do escopo atual, para reduzir burocracia (seção 3.4).
6. **`metricas` é aproveitada**, remodelada como `registros_encontro` (seção 3.1).

### Em aberto

1. **Geocoding:** escolher entre as opções da seção 3.5.
2. **Nível de exposição do grupo para anônimo:** confirmar a matriz da seção 3.3.
3. **Declaração de maioridade:** autodeclaração basta? Validar com orientador/jurídico da IES.
