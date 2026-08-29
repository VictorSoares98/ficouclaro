# 🎓 Ficou Claro?

> Feedback em tempo real para conectar alunos e professores sem fricção.

[![Vue 3](https://img.shields.io/badge/Vue.js-35495E?style=flat&logo=vuedotjs&logoColor=4FC08D)](https://vuejs.org/)
[![Quasar](https://img.shields.io/badge/Quasar-1976D2?style=flat&logo=quasar&logoColor=white)](https://quasar.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

**Objetivo:** Permitir que alunos avaliem a didática dos docentes e interajam de forma anônima e em tempo real, gerando dados instantâneos para a melhoria contínua da aula.

---

## 🏗️ 2. Arquitetura e Stack

Nossa stack foi rigorosamente escolhida para fornecer um MVP Híbrido, altamente reativo e de baixo custo inicial.

- **Frontend & Mobile:** [Vue 3](https://vuejs.org/) (Composition API), [Quasar Framework](https://quasar.dev/) (UI System), [Tailwind CSS](https://tailwindcss.com/) (Estilização Utilitária), [Pinia](https://pinia.vuejs.org/) (Gerenciamento de Estado).
- **Backend & Database:** [Supabase](https://supabase.com/) (PostgreSQL + Auth + Realtime), Proteção por Row Level Security (RLS) rígida, Arquitetura SQL Modular.
- **Infra/Deploy:** [Quasar CLI](https://quasar.dev/quasar-cli-vite/introduction) (Build tool oficial baseado em Vite), [Capacitor](https://capacitorjs.com/) (Mobile nativo).

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
   VITE_SUPABASE_URL="https://<seu-projeto>.supabase.co"
   VITE_SUPABASE_ANON_KEY="<sua-anon-key>"
   ```

   > 💡 **Importante para Mobile:** Para testes em dispositivos reais ou emuladores com Supabase Local, utilize o IP do seu computador (ex: `http://192.168.x.xxx:54421`) em vez de `localhost`. Consulte o [GUIA_CONFIGURACAO_MOBILE.md](./GUIA_CONFIGURACAO_MOBILE.md) para detalhes técnicos.

3. **Iniciando a aplicação (Modo Dev):**
   ```bash
   npm run dev
   ```

## 📜 4. Diretrizes de Engenharia (A Constituição)

Para mantermos a base de código previsível e escalável, seguimos regras inflexíveis:

1. **Sem `any` (Type-safety Strict):** O uso de `any` é terminantemente proibido. Garantimos tipagem ponta a ponta. Queries do Supabase recebem tipagem via DB Types gerados pelo CLI e são mapeadas para interfaces de domínio em `src/core/types`.
2. **Separação de Responsabilidades (FSD - Feature Sliced Design):**
   - **Componentes (`pages/`, `components/`):** São puramente visuais ("burros"). Lidam com layouts e dispatch de actions.
   - **Stores (`stores/` - Pinia):** São "inteligentes". Gerenciam o estado global assíncrono, cache, loading e error state.
   - **Services (`services/`):** Isolam regras de negócio puro e chamadas à API (Supabase) sem qualquer acoplamento com o ecossistema Vue.
3. **UI Mista Consistente:**
   - **Layout, grid e espaçamentos:** `Tailwind CSS` (Configurado estritamente com o prefixo `tw-` para evitar conflitos de escopo).
   - **Componentes de Interação (Inputs, Modais, Dropdowns):** `Quasar Framework`.
4. **Arquitetura SQL Modular:** Nada de migrations obscuras baseadas em data e hora para o desenvolvimento do MVP. O schema do Postgres é gerenciado semanticamente por snippets (`00_Init.sql`, `01_Enums.sql`, etc), unificados de forma determinística pelo script `db:build`.
5. **Concorrência e Estado Assíncrono:** Para aniquilar redundâncias, todas as stores e requisições devem consumir o composable universal `useAsyncOperation`, padronizando _Loading States_ elegantes e engolindo exceções sem estourar _Unhandled Promise Rejections_.
6. **Conexões Realtime (WebSocket):** Inscrições nativas no Supabase estão proibidas nas views. Qualquer escuta em tempo real deve transacionar exclusivamente via Padrão Singleton pelo `RealtimeManager`, prevenindo _Race Conditions_ e conexões fantasmas.
7. **Clean Code & UX Resiliente:** Caminhos relativos frágeis (`../../`) são proibidos; usamos sempre o alias absoluto `@/`. O tratamento de exceções assíncronas é centralizado no Quasar Notify, garantindo feedback humanizado ao usuário. O aplicativo possui tratamento ativo contra quedas de rede (banner de aviso e cache de estado).

## 🛠️ 5. Scripts & Workflow

Lista de comandos disponíveis via `npm run`:

| Script     | Descrição                                                                                                         |
| ---------- | ----------------------------------------------------------------------------------------------------------------- |
| `dev`      | Inicia o servidor de desenvolvimento do Quasar CLI (HMR ativado).                                                 |
| `build`    | Executa o Type Check (`vue-tsc`) e gera o bundle de produção estático otimizado.                                  |
| `lint`     | Roda o ESLint + Prettier para garantir conformidade de tipagem e padronização visual do código em todo o projeto. |
| `db:build`      | Concatena os snippets da pasta `supabase/snippets` gerando o arquivo consolidado `Master Schema.sql`.             |
| `build:android` | Gera o build de produção do Quasar e sincroniza com a pasta nativa do Android (usa `.env.production`).    |

### 📱 Desenvolvimento Mobile (Capacitor)

O aplicativo foi empacotado para execução nativa via Quasar + Capacitor. Possuímos 2 fluxos estritos:

- **1. Modo Desenvolvimento (Hot Reload):** Lê as chaves do arquivo `.env` (Supabase Local).
  `npx quasar dev -m capacitor -T android -- --address 0.0.0.0`
- **2. Modo Produção (Nuvem):** Lê as chaves do arquivo `.env.production` (Supabase Cloud).
  `npm run build:android` -> Quando o Android Studio abrir, vá em **Build > Build APKs** para gerar o arquivo final.

> ⚠️ **Nota de Segurança:** As políticas de rede para desenvolvimento local (HTTP) estão configuradas em `src-capacitor/android/app/src/main/res/xml/network_security_config.xml`. Consulte o guia de configuração mobile para saber como atualizar o IP permitido.

## 🌟 6. Funcionalidades Principais (Visão do Produto)

Para garantir o engajamento dos alunos e fornecer dados úteis aos professores, o aplicativo conta com funcionalidades centrais inspiradas em plataformas de interação em tempo real:

1. **Enquetes e Interações em Tempo Real:** Check-in didático durante a aula (Múltipla escolha, Nuvem de palavras, Escalas).
2. **Termômetro de Ritmo da Aula:** Feedback contínuo e visual ("Muito rápido", "Boiando", "Tudo certo") operando via _Supabase Realtime_, com proteção anti-spam via throttle de 10s.
3. **Painel de Dúvidas com Upvote:** Sistema de Q&A textual 100% anônimo para os alunos (LGPD by design) priorizado pela própria turma.
4. **Avaliação Flash Pós-Aula:** Sistema de avaliação instantânea pós-sessão para criar um histórico de qualidade da disciplina.
5. **Insights & Heatmap (O Diferencial):** Dashboard avançado (implementado) que cruza enquetes, termômetro e notas para o professor visualizar o mapa de calor da sua didática e reformular seu plano de ensino cirurgicamente.

---

**Equipe Responsável:** Victor Soares e Luan Victor Ogeda
