<div align="center">
  <img src="./assets/logo.png" alt="Ficou Claro? Logo" width="180"/>
  <h1>🎓 Ficou Claro?</h1>
  <p><em>O fim do "Alguém tem alguma dúvida?" seguido de silêncio absoluto.</em></p>
</div>

> O termômetro anti-tédio da sua aula e o mapa físico de monitorias do seu campus. Feedback anônimo em tempo real e geolocalização acadêmica para quem se importa com a aprendizagem ativa.

_Leia isto em outros idiomas: [🇺🇸 English](README.en.md) | [🇧🇷 Português](README.md)_

[![Vue 3](https://img.shields.io/badge/Vue.js-35495E?style=flat&logo=vuedotjs&logoColor=4FC08D)](https://vuejs.org/)
[![Quasar](https://img.shields.io/badge/Quasar-1976D2?style=flat&logo=quasar&logoColor=white)](https://quasar.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-19.4-green?style=flat&logo=leaflet&logoColor=white)](https://leafletjs.com/)

**Objetivo:** Permitir que alunos avaliem a didática dos docentes e interajam de forma anônima e em tempo real na sala de aula, enquanto conectam estudantes a monitorias, grupos de reforço e espaços de estudo físico espalhados pelo campus.

---

## 🏗️ 2. Arquitetura e Stack

Nossa stack foi rigorosamente escolhida para fornecer uma Aplicação Híbrida completa, altamente reativa e pronta para produção.

- **Frontend & Mobile:** [Vue 3](https://vuejs.org/) (Composition API), [Quasar Framework](https://quasar.dev/) (UI System e Soberano de Iluminação), [Tailwind CSS](https://tailwindcss.com/) (Estilização Utilitária isolada com prefixo `tw-`), [Pinia](https://pinia.vuejs.org/) (Gerenciamento de Estado Reativo).
- **Mapeamento & Geoespacial:** [Leaflet](https://leafletjs.com/) + [Leaflet.MarkerCluster](https://github.com/Leaflet/Leaflet.markercluster) integrado com OpenStreetMap, suporte a clusters adaptativos, tiles dark mode e popups em Bento Grid.
- **Design System:** Glassmorphism translúcido com tokens ortogonais (`.fc-glass-header`, `.fc-glass-footer`, `.fc-glass-drawer`), safe-areas nativas para mobile e suporte a 6 temas de marca (*Default, Ocean, Dracula, Amoras, Crepúsculo e Natura*).
- **Backend & Database:** [Supabase](https://supabase.com/) (PostgreSQL + Auth + Realtime), Proteção por Row Level Security (RLS) rígida, Arquitetura SQL Modular (Schema Splitting) e Hardening Zero-Direct-Access.
- **Infra/Deploy:** [Quasar CLI](https://quasar.dev/quasar-cli-vite/introduction) (Build tool oficial baseado em Vite), [Capacitor](https://capacitorjs.com/) (Mobile nativo Android/iOS) e PWA Offline-ready.

---

## 🚀 3. Pré-requisitos & Ambiente Local

### Pré-requisitos

- **Node.js:** v20+ (Recomendado o uso de `nvm` ou `fnm`)
- **NPM:** v10+

### Instalação e Execução

1. **Clone o repositório e instale as dependências:**

   ```bash
   git clone <url-do-repo>
   cd ficouclaro
   npm install
   ```

2. **Configuração de Ambiente (`.env`):**
   Crie um arquivo `.env.local` na raiz do projeto contendo as chaves do seu projeto Supabase:

   ```env
   QCLI_SUPABASE_URL="https://<seu-projeto>.supabase.co"
   QCLI_SUPABASE_ANON_KEY="<sua-anon-key>"

   # Chaves Login Social Google (Requeridas para emular OAuth localmente)
   SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID="<client-id>"
   SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET="<secret>"
   ```

   > 🔐 **Login Social Local (Google):** O arquivo `supabase/config.toml` está amarrado a essas chaves. Para testar o fluxo localmente sem erros 400, adicione o URI de redirecionamento `http://127.0.0.1:54421/auth/v1/callback` no seu projeto do **Google Cloud Console**.

   > 💡 **Importante para Mobile:** Para testes em dispositivos reais ou emuladores com Supabase Local, utilize o IP do seu computador (ex: `http://192.168.x.xxx:54421`) em vez de `localhost`. Consulte o [GUIA_CONFIGURACAO_MOBILE.md](./GUIA_CONFIGURACAO_MOBILE.md) para detalhes técnicos.

3. **Iniciando a aplicação (Modo Dev):**
   ```bash
   npm run dev
   ```

---

## 📜 4. Diretrizes de Engenharia (A Constituição)

Para mantermos a base de código previsível e escalável, seguimos regras inflexíveis:

1. **Sem `any` (Type-safety Strict - ADR-001):** O uso de `any` é terminantemente proibido. Garantimos tipagem ponta a ponta. Queries do Supabase recebem tipagem via DB Types gerados pelo CLI e são mapeadas para interfaces canônicas de domínio em `src/core/types` e módulos FSD.
2. **Separação de Responsabilidades (FSD - Feature Sliced Design - ADR-002):**
   - **Componentes (`pages/`, `components/`):** São puramente visuais. Lidam com layouts, animações e despacho de ações.
   - **Stores (`stores/` - Pinia):** Gerenciam o estado global assíncrono, cache, loading e error state.
   - **Services (`services/`):** Isolam regras de negócio puro e chamadas à API (Supabase) sem qualquer acoplamento com o ecossistema Vue.
3. **UI Mista Consistente (ADR-003):**
   - **Layout, grid e espaçamentos:** `Tailwind CSS` (Configurado estritamente com o prefixo `tw-` para evitar conflitos de escopo).
   - **Componentes de Interação & Temas:** `Quasar Framework` é o soberano exclusivo de superfícies e alternância Dark/Light mode.
4. **Arquitetura SQL Modular (ADR-004):** Nada de migrations obscuras baseadas em timestamp para o desenvolvimento do MVP. O schema do Postgres é gerenciado semanticamente por snippets (`00_Init.sql` a `08_Realtime.sql`), unificados de forma determinística pelo script `npm run db:build`.
5. **Hardening & Zero-Direct-Access:** Consultas públicas agregadas (como o mapa de monitorias) operam através de Views seguras com `security_invoker = false`, bloqueando o acesso direto da role `anon` às tabelas base e blindando dados pessoais (PII).
6. **Concorrência e Estado Assíncrono (ADR-005):** Todas as stores e requisições devem consumir o composable universal `useAsyncOperation`, padronizando _Loading States_ elegantes e tratamento resiliente de erros.
7. **Conexões Realtime (WebSocket - ADR-006):** Inscrições nativas no Supabase estão proibidas nas views. Qualquer escuta em tempo real transaciona exclusivamente via Padrão Singleton pelo `RealtimeManager`, prevenindo _Race Conditions_ e conexões fantasmas.
8. **Ergonomia Mobile & Thumb Zone:** Dispositivos móveis utilizam barra inferior tátil (`MobileNavBottom.vue`) com safe-areas nativas (`env(safe-area-inset-bottom)`), enquanto telas de mapa (`/mapa`) e autenticação assumem modo 100% imersivo sem poluição visual.
9. **Integridade de Dados e Segurança (ADR-007):** O controle de interações únicas (Anti-Duplicidade de Votos) jamais confia no cache do navegador. O bloqueio ocorre nativamente no PostgreSQL utilizando `Unique Constraints` com Hashes Unidirecionais.
10. **Clean Code & UX Resiliente:** Caminhos relativos frágeis (`../../`) são proibidos; usamos sempre o alias absoluto `@/`. O tratamento de exceções assíncronas é centralizado no Quasar Notify.

---

## 🛠️ 5. Scripts & Workflow

Lista de comandos disponíveis via `npm run`:

| Script          | Descrição                                                                                                         |
| --------------- | ----------------------------------------------------------------------------------------------------------------- |
| `dev`           | Inicia o banco Supabase local e sobe o servidor de desenvolvimento Quasar CLI (HMR ativado).                      |
| `build`         | Executa o Type Check (`vue-tsc`) e gera o bundle de produção estático otimizado.                                  |
| `typecheck`     | Valida a tipagem estrita de todo o projeto TypeScript/Vue (`vue-tsc --noEmit`).                                    |
| `lint`          | Executa ESLint com auto-fix e formatação Prettier em toda a base de código.                                        |
| `lint:check`    | Executa verificação de linting e formatação em modo somente-leitura (ideal para pipelines de CI/CD).              |
| `db:build`      | Concatena os 9 snippets da pasta `supabase/snippets` gerando o consolidado `Master Schema.sql`.                   |
| `db:start`      | Inicia a suíte local do Supabase via CLI Docker.                                                                   |
| `db:stop`       | Encerra a execução dos containers locais do Supabase.                                                             |
| `build:android` | Gera o build de produção do Quasar injetando explicitamente o `.env.production` via `dotenv-cli`.                 |

### 📱 Desenvolvimento Mobile (Capacitor)

O aplicativo foi empacotado para execução nativa via Quasar + Capacitor. Possuímos 2 fluxos estritos:

- **1. Modo Desenvolvimento (Hot Reload):** Lê as chaves do arquivo `.env` (Supabase Local).  
  `npx quasar dev -m capacitor -T android -- --address 0.0.0.0`
- **2. Modo Produção (Nuvem):** Lê as chaves do arquivo `.env.production` (Supabase Cloud).  
  `npm run build:android` -> Quando o Android Studio abrir, vá em **Build > Build APKs** para gerar o arquivo final.

> ⚠️ **Nota de Segurança:** As políticas de rede para desenvolvimento local (HTTP) estão configuradas em `src-capacitor/android/app/src/main/res/xml/network_security_config.xml`. Consulte o guia de configuração mobile para saber como atualizar o IP permitido.

---

## 🌟 6. Fluxo de Usuário e Funcionalidades (MVP)

A arquitetura central divide a experiência em perfis distintos (Role-Based Access Control) que interagem na mesma Sala Virtual e no mesmo ecossistema acadêmico:

### Arquitetura de Perfis (RBAC)

- **Painel do Professor:** O docente cria turmas (com metadados ricos: semestre, turno, sala), gerando um `Código de Convite` alfanumérico único. A partir do painel, ele inicia "Salas de Aula" (Sessões).
- **Hub do Aluno:** O estudante insere o Código de Convite, é matriculado instantaneamente e acompanha o histórico das suas disciplinas.
- **Gateway Híbrido (`/sala/:id`):** O aplicativo usa a mesma URL para a aula, mas o Vue Router renderiza painéis completamente diferentes dependendo da role do usuário (`ProfessorSessionPage` com controles vs `StudentSessionPage` com botões de votação).
- **Visitante / Comunidade:** Acesso livre à Landing Page gamificada, simulador didático interativo e ao mapa de monitorias do campus.

### Funcionalidades Core

1. **Enquetes e Interações em Tempo Real:** Check-in didático durante a aula (Múltipla escolha, Nuvem de palavras, Escalas).
2. **Termômetro de Ritmo da Aula:** Feedback contínuo e visual ("Muito rápido", "Boiando", "Tudo certo") operando via _Supabase Realtime_, com proteção anti-spam via throttle de 10s.
3. **Painel de Dúvidas com Upvote:** Sistema de Q&A textual 100% anônimo para os alunos (LGPD by design) priorizado pela própria turma.
4. **Avaliação Flash Pós-Aula:** Sistema de avaliação instantânea pós-sessão para criar um histórico de qualidade da disciplina.
5. **Dashboard & Insights do Docente:** Painel analítico consolidando avaliações rápidas, volume de dúvidas e picos do termômetro.
6. **🗺️ Mapa Interativo do Campus & Grupos de Estudo (`/mapa`):**  
   - Localização visual de monitorias acadêmicas, grupos de reforço e projetos de pesquisa pelo campus.
   - Clusterização inteligente com Leaflet e OpenStreetMap (sem marcas d'água comerciais).
   - Sidebar flutuante no desktop e Bottom Sheet ergonômico no mobile com 3 níveis de expansão (*peek*, *half* e *expanded*).
   - Cards em formato Bento Grid detalhando prédio, bloco, sala, dia, horário e vagas disponíveis.
7. **🎮 Landing Page Gamificada & Simulador Didático:**  
   - Hero dinâmico com simulação interativa em tempo real do termômetro e das dúvidas.
   - Acesso ultra-rápido à aula através de PIN numérico direto no Hero (`/sala/:pin`).
   - Vitrine de recursos em Bento Grid e conformidade institucional.
8. **🧭 Navegação Contextual & Ergonomia Mobile:**  
   - Header translúcido (*glassmorphism*) adaptativo com badge gamificado de XP e nível.
   - Drawer lateral off-canvas para tablets e smartphones.
   - Barra inferior tátil (*Thumb Zone*) com isolamento inteligente para páginas imersivas.

---

## 🔐 7. Conformidade e Privacidade (LGPD)

O **Ficou Claro?** adota a filosofia de _Privacy by Design_ (ADR-009). Sendo um aplicativo voltado para interações educacionais, a proteção dos dados dos usuários é prioridade técnica:

- **Controle de Termos e Consentimento:** Sistema versionado de aceite de termos. Sempre que a política muda, o banco exige um novo consentimento criptografado (timestamp e versão) do usuário no próximo login.
- **Direito à Portabilidade:** Central de Privacidade nativa (`/privacidade-seguranca`) que permite ao usuário exportar toda a sua carga de dados consolidados (Perfil, Dúvidas enviadas, Histórico) em formatos portáveis (JSON, CSV).
- **Direito ao Esquecimento:** Exclusão automatizada da conta (Hard Delete) com proteção rigorosa contra ações acidentais (verificação de frase-chave "EXCLUIR MINHA CONTA").
- **Anonimato Integrado:** Por padrão, todas as dúvidas enviadas por alunos e os votos nas enquetes não expõem a identidade perante o professor, favorecendo a segurança psicológica no processo de aprendizado.
- **Blindagem de APIs Públicas:** O mapa consome uma View de Fachada com `security_invoker = false`, garantindo que nomes de criadores sejam projetados de forma limpa sem jamais expor dados cadastrais (`usuarios`) a visitantes não autenticados.

---

**Equipe Responsável:** Victor Soares
