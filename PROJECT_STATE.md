# Project State & Governance

## 1. Identidade e Estágio

- **Projeto:** Ficou Claro?
- **Objetivo:** Feedback em tempo real para conectar alunos e professores sem fricção, gerando dados instantâneos para a melhoria da aula.
- **Fase de Maturidade:** FASE 0 — MVP em desenvolvimento; não deployado.
- **Foco Atual:** [A DEFINIR NO INÍCIO DA PRÓXIMA TAREFA]

---

## 2. Tech Stack Oficial

- **Frontend / Mobile:** Vue 3 (Composition API), Quasar Framework, Tailwind CSS, Pinia, Capacitor.
- **Backend / Database:** Supabase (PostgreSQL, Auth, Realtime).
- **Infraestrutura / Build:** Node.js (v20+), NPM, Quasar CLI (baseado em Vite).

---

## 3. Architecture Decision Records (ADRs)

*Registro das diretrizes arquiteturais e de engenharia atualmente estabelecidas no projeto.*

- **ADR-001 (Accepted): Strict Type-safety.**  
  É proibido o uso de `any`, asserções não-nulas (`!`) e mutações diretas em arrays. Devem ser utilizados DB Types e Destructuring conforme os padrões estabelecidos no projeto.

- **ADR-002 (Accepted): Feature Sliced Design (FSD).**  
  Componentes visuais são responsáveis pela apresentação e despacho de ações. Stores (Pinia) gerenciam estado global e cache. Services isolam regras de negócio puro.

- **ADR-003 (Accepted): UI Mista Consistente.**  
  Tailwind CSS gerencia layouts utilizando o prefixo estrito `tw-`. O Quasar Framework é reservado para componentes de interação.

- **ADR-004 (Accepted): Schema Splitting (SQL).**  
  É proibida a criação de migrations baseadas em data/hora. O schema é gerenciado por snippets semânticos unificados através de `npm run db:build`.

- **ADR-005 (Accepted): Estado Assíncrono Padronizado.**  
  Requisições devem utilizar o composable `useAsyncOperation` para gerenciamento de Loading States e tratamento centralizado de erros através do Quasar Notify.

- **ADR-006 (Accepted): Realtime Singleton.**  
  É proibida a inscrição direta do Supabase Realtime em views. Conexões Realtime devem ocorrer exclusivamente através do `RealtimeManager`.

- **ADR-007 (Accepted): Integridade Anti-Duplicidade.**  
  O bloqueio de votos únicos não deve depender do LocalStorage. A integridade deve ser garantida nativamente pelo PostgreSQL através de Unique Constraints e hashes unidirecionais.

---

## 4. Definition of Done (DoD) Universal

*Uma tarefa só é considerada concluída quando os critérios aplicáveis tiverem sido atendidos e verificados.*

- [ ] O código utiliza caminhos absolutos (`@/`) em vez de caminhos relativos frágeis (`../../`).
- [ ] A análise estática através de `npm run lint` e a checagem de tipagem através de `vue-tsc` retornaram aprovação real, sem erros.
- [ ] Modificações estruturais no banco de dados foram inseridas nos respectivos snippets SQL e o comando `npm run db:build` foi executado para atualizar o Master Schema.
- [ ] Os Critérios de Aceite definidos no planejamento (Prompt 3) foram validados pelo QA (Prompt 5).
- [ ] Foi realizada verificação de regressão e possíveis side-effects nos arquivos adjacentes afetados pela alteração.
- [ ] Nenhuma dependência externa ou serviço adicional foi inserido sem aprovação prévia.

---

## 5. Rastreabilidade da Sprint Atual

*Esta seção é atualizada durante o ciclo de execução dos prompts.*

- **Sprint Ativa:** [A DEFINIR PELO FLUXO DA TAREFA]
- **Tarefa Atual:** [A DEFINIR NO PROMPT 3]
- **Critérios de Aceite:** [A DEFINIR NO PROMPT 3]
- **Débitos Técnicos Mapeados:** [A DEFINIR PELO PROMPT 5, QUANDO APLICÁVEL]

---

## 6. Estado de Governança

- **Fonte de Estado Atual:** Este `PROJECT_STATE.md`.
- **Decisões Arquiteturais:** Registradas nas ADRs aceitas acima.
- **Estado da Sprint:** Gerenciado durante o ciclo P3 → Implementação → P5.
- **Histórico de alterações:** Mantido pelo Git; não é replicado neste arquivo.
- **Informações não verificadas:** Não devem ser tratadas como fatos ou regras oficiais até que exista evidência suficiente.

---

## 7. Regras de Atualização

O `PROJECT_STATE.md` representa uma **fotografia do estado atual do projeto**, não um histórico completo.

- O **Prompt 3** atualiza a rastreabilidade necessária para abertura da tarefa e seus Critérios de Aceite.
- O **Prompt 5** atualiza o estado de encerramento e os Débitos Técnicos identificados, quando aplicável.
- Informações não comprovadas devem permanecer ausentes, como placeholder ou explicitamente marcadas como não verificadas.
- Novas decisões arquiteturais relevantes devem ser formalizadas antes de serem tratadas como diretrizes oficiais do projeto.