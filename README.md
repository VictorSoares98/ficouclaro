<div align="center">
  <img src="./assets/logo.png" alt="Ficou Claro? Logo" width="180"/>
  <h1>🎓 Ficou Claro?</h1>
  <p><em>Living Documentation — Plataforma de Engajamento Acadêmico em Tempo Real & Mapeamento de Monitorias</em></p>

[![Version](https://img.shields.io/badge/version-0.0.1-blue.svg?style=flat-square)](package.json)
[![License](https://img.shields.io/badge/license-MIT-green.svg?style=flat-square)](LICENSE)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg?style=flat-square)](package.json)
[![Type-Coverage](https://img.shields.io/badge/TypeScript-Strict_100%25-blue.svg?style=flat-square&logo=typescript)](tsconfig.json)
[![Vue 3](https://img.shields.io/badge/Vue.js-3.5-4FC08D?style=flat-square&logo=vuedotjs)](https://vuejs.org/)
[![Quasar](https://img.shields.io/badge/Quasar-2.25-1976D2?style=flat-square&logo=quasar)](https://quasar.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL_15-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-Prefix_tw--38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
</div>

> _Documento disponível em outros idiomas: [🇺🇸 English](README.en.md) | [🇧🇷 Português](README.md)_

---

## 1. Título e Visão Geral

O **Ficou Claro?** é uma plataforma acadêmica híbrida (Web, PWA e Mobile) desenvolvida para transformar a dinâmica em sala de aula e mitigar o abismo de comunicação entre professores e estudantes. O sistema substitui o tradicional e desconfortável silêncio do _"Alguém tem alguma dúvida?"_ por canais de interação anônimos, instantâneos e com validação em tempo real via WebSockets, garantindo a segurança psicológica do discente durante o processo pedagógico.

Além da atuação em tempo real dentro da sala de aula (termômetro contínuo de ritmo, painel de dúvidas com upvotes da turma e enquetes instantâneas), o ecossistema integra um **Mapeador Geoespacial de Campus**. Esta funcionalidade conecta a comunidade a monitorias presenciais, grupos de reforço acadêmico e espaços de estudo físico espalhados pelas instituições de ensino, democratizando o acesso ao aprendizado colaborativo.

---

## 2. Stack Tecnológica

O projeto foi construído sobre uma arquitetura reativa, tipada e com alta performance de carregamento:

### Front-end

- **[Vue 3](https://vuejs.org/)**: Framework reativo utilizando Composition API e script setup com TypeScript estrito.
- **[Quasar Framework 2.25](https://quasar.dev/)**: UI Library e design system governante da iluminação (Dark/Light mode), componentes de interação nativa e layouts de alta performance.
- **[Tailwind CSS 3.4](https://tailwindcss.com/)**: Motor de estilização utilitária com prefixo isolado `tw-` para espaçamentos, micro-layouts e alinhamentos rápidos.
- **[Pinia 4](https://pinia.vuejs.org/)**: Gerenciamento de estado global centralizado com suporte a SSR, persistência e composables assíncronos.
- **[Vue Router 5](https://router.vuejs.org/)**: Roteamento dinâmico com Navigation Guards para controle de acesso baseado em papéis (RBAC).
- **[Leaflet 1.9](https://leafletjs.com/) & [Leaflet.MarkerCluster](https://github.com/Leaflet/Leaflet.markercluster)**: Motor cartográfico interativo e renderização de clusters geoespaciais com OpenStreetMap.
- **[Apache ECharts 6](https://echarts.apache.org/) & [vue-echarts](https://github.com/ecomfe/vue-echarts)**: Geração de gráficos analíticos e telemetria de aulas para o painel docente.

### Back-end & BaaS

- **[Supabase](https://supabase.com/) (PostgreSQL 15+)**: Banco de dados relacional com suporte a tipos nativos, triggers, views e funções RPC em PL/pgSQL.
- **Supabase Auth**: Gerenciamento centralizado de identidades, sessões JWT e autenticação social OAuth (Google).
- **Supabase Realtime**: Engine WebSocket pub/sub para sincronização em tempo real das interações em aula e termômetro didático.
- **Row Level Security (RLS)**: Isolamento de dados direto na camada de banco de dados garantindo integridade de permissões.

### Infraestrutura, Ferramentas & Mobile

- **[Quasar CLI com Vite 3.6](https://quasar.dev/quasar-cli-vite/introduction)**: Servidor de desenvolvimento ultrarrápido com Hot Module Replacement (HMR) e bundler otimizado para produção.
- **[Capacitor 8](https://capacitorjs.com/)**: Runtime multiplataforma nativo para empacotamento Android (e iOS) com bridge de biometria e haptics.
- **[Docker](https://www.docker.com/) & Supabase CLI**: Orquestração local completa da suíte Supabase (PostgreSQL, GoTrue, PostgREST, Realtime e Studio).
- **Tooling de Qualidade**: [TypeScript 6](https://www.typescriptlang.org/), [ESLint 10](https://eslint.org/), [Prettier 3](https://prettier.io/) e [vue-tsc](https://github.com/vuejs/language-tools).

---

## 3. Arquitetura e Segurança

A engenharia do sistema adota princípios corporativos rígidos para assegurar escalabilidade, manutenibilidade e segurança desde a fundação:

- **Controle de Acesso Centralizado (RBAC):**  
  A autorização é governada em múltiplas camadas. No Front-end, o `Vue Router` intercepta a navegação via Navigation Guards globais avaliando os papéis do usuário (`docente`, `discente` e `visitante`). Em salas híbridas (como `/sala/:id`), o roteador renderiza interfaces contextualmente divergentes (`ProfessorSessionPage` vs `StudentSessionPage`) a partir da mesma URL base. No Back-end, o PostgreSQL reforça o RBAC através de políticas rigorosas de Row Level Security (RLS) ancoradas no UID do Supabase Auth.

- **Isolamento de Estilização (`tw-` Prefix Enforcement):**  
  Para neutralizar colisões de classes e conflitos de especificidade com o ecossistema Quasar, a camada Tailwind CSS opera estritamente sob o prefixo obrigatório `tw-` (configurado em `tailwind.config.js`). O Quasar Framework atua como o soberano exclusivo de temas, tokens e superfícies, enquanto as classes utilitárias `tw-*` são restritas a layouts flexíveis e espaçamentos.

- **Hardening & Zero-Direct-Access (LGPD by Design):**  
  Consultas anônimas a dados públicos (ex: visualização de grupos de estudo e monitorias no mapa) não possuem permissão de leitura direta (`SELECT`) sobre as tabelas relacionais primárias (`grupos_estudo`, `usuarios`). A comunicação é intermediada por uma _Database Facade_ composta por Views seguras com `security_invoker = false`, garantindo que informações pessoais identificáveis (PII) permaneçam completamente inacessíveis a agentes não autenticados.

- **Arquitetura SQL Modular (Schema Splitting):**  
  Em substituição a migrações cronológicas fragmentadas, o schema do banco é mantido em 9 snippets semânticos idempotentes em `supabase/snippets/` (`00_Init_Extensions` até `08_Realtime`). O compilador interno `npm run db:build` concatena deterministicamente os módulos e gera o `Master Schema.sql` consolidado.

- **Padrão Singleton para Realtime (ADR-006):**  
  Inscrições de WebSockets são proibidas diretamente dentro de componentes visuais Vue. Toda telemetria em tempo real é centralizada pelo serviço `RealtimeManager`, prevenindo vazamentos de memória, conexões duplicadas e estados de corrida (_race conditions_).

- **Type-Safety Estrita (No `any` Policy - ADR-001):**  
  O uso da tipagem `any` é terminantemente vetado no repositório. Todos os retornos de API são mapeados a partir dos tipos gerados pelo banco para interfaces de domínio canônicas em `src/core/types`.

- **Resiliência e Estado Assíncrono:**  
  Todas as operações assíncronas em stores Pinia consomem o composable universal `useAsyncOperation`, padronizando estados de loading, captura de erros e feedback ao usuário via notificações nativas do Quasar.

---

## 4. Pré-requisitos

Antes de iniciar a configuração local, certifique-se de possuir em seu ambiente de desenvolvimento:

- **Node.js:** Versão `>= 20.x` (Recomendado v22 LTS ou v24; utilize `nvm` ou `fnm`).
- **NPM:** Versão `>= 10.x`.
- **Docker Desktop** ou **Docker Engine** (com Docker Compose ativo): Necessário para a execução da infraestrutura local via Supabase CLI.
- **Git:** Versão `>= 2.30` para clonagem e gestão de ramificações.
- _(Opcional para Android)_: Android Studio Flamingo+ e Android SDK configurado para builds mobile.

---

## 5. Configuração do Ambiente Local (Local Setup)

Siga o passo a passo abaixo para inicializar a infraestrutura e executar a aplicação em ambiente de desenvolvimento:

### 1. Clonar o Repositório

```bash
git clone https://github.com/VictorSoares98/ficouclaro.git
cd ficouclaro
npm install
```

### 2. Configurar Variáveis de Ambiente

Copie o modelo de variáveis de ambiente para a raiz do projeto:

```bash
cp .env.example .env
```

Abra o arquivo `.env` gerado e defina os parâmetros locais. Para desenvolvimento com Supabase Local, utilize:

```env
# Conexão com Supabase Local
QCLI_SUPABASE_URL="http://127.0.0.1:54421"
QCLI_SUPABASE_ANON_KEY="<sua-anon-key-exibida-ao-iniciar-o-supabase>"

# Credenciais OAuth Google (Opcional para testes locais)
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=""
SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=""
```

> 💡 **Nota para Testes em Dispositivos Móveis:** Se for executar a aplicação em um smartphone físico ou emulador conectado à sua rede Wi-Fi, substitua `127.0.0.1` pelo IP local da sua máquina (ex: `http://192.168.1.15:54421`).

### 3. Subir a Infraestrutura (Supabase / Docker)

Inicie a suíte local de containers do Supabase:

```bash
npm run db:start
```

> _(No primeiro boot, o Supabase CLI baixará as imagens Docker necessárias e imprimirá no terminal as credenciais locais, endpoints da API e a URL do Studio em `http://127.0.0.1:54423`)_.

### 4. Executar a Aplicação Localmente

Com os containers ativos, inicie o servidor de desenvolvimento do Quasar com Hot Module Replacement:

```bash
npm run dev
```

A aplicação estará acessível no navegador pelo endereço:
👉 **`http://localhost:9000`**

---

## 6. Scripts Disponíveis

Abaixo estão listados os comandos operacionais padronizados no `package.json`:

| Script          | Comando Executado                                                   | Propósito / Descrição                                                              |
| :-------------- | :------------------------------------------------------------------ | :--------------------------------------------------------------------------------- |
| `dev`           | `npm run db:start && quasar dev`                                    | Sobe o banco Supabase e inicia o servidor Vite local com HMR na porta `9000`.      |
| `build`         | `quasar build`                                                      | Realiza a compilação de produção e gera o bundle estático otimizado em `dist/spa`. |
| `typecheck`     | `vue-tsc --noEmit`                                                  | Executa a checagem de tipos TypeScript em componentes `.vue` e módulos `.ts`.      |
| `lint`          | `prettier --write ... && eslint --fix ...`                          | Corrige automaticamente desvios de formatação e linter em todo o código.           |
| `lint:check`    | `prettier ... && eslint ...`                                        | Valida formatação e qualidade de código em modo leitura (adequado para CI/CD).     |
| `db:start`      | `npx supabase start`                                                | Inicializa os containers Docker locais do ecossistema Supabase.                    |
| `db:stop`       | `npx supabase stop`                                                 | Encerra com segurança a execução de todos os containers locais do Supabase.        |
| `db:build`      | `node supabase/build-schema.js`                                     | Concatena os 9 snippets de `supabase/snippets/` no arquivo `Master Schema.sql`.    |
| `build:android` | `dotenv -e .env.production -- quasar build -m capacitor -T android` | Gera a compilação de produção nativa para Android via Capacitor.                   |

---

## 7. Estrutura de Diretórios (Folder Structure)

O projeto adota uma divisão modular baseada em princípios de Feature-Sliced Design (FSD) adaptados para o Quasar Framework:

```text
ficouclaro/
├── .agents/                      # Governança de IA, regras arquiteturais e protocolos
├── public/                       # Assets públicos servidos diretamente sem build
│   └── icons/                    # Ícones vetoriais otimizados e self-hosted (ex: google.svg)
├── src/                          # Código-fonte principal da aplicação
│   ├── assets/                   # Imagens e logotipos processados pelo Vite
│   ├── boot/                     # Boot files do Quasar (inicializadores do Supabase, i18n)
│   ├── components/               # Componentes visuais atômicos compartilhados
│   ├── core/                     # Infraestrutura transversal e utilitários globais
│   │   ├── components/           # Componentes base (mapa Leaflet, barras de navegação)
│   │   ├── composables/          # Hooks reutilizáveis (useAsyncOperation, useTheme)
│   │   ├── services/             # Clientes de API, base services e HTTP wrappers
│   │   ├── supabase/             # Instância do cliente Supabase e RealtimeManager
│   │   └── types/                # Contratos canônicos de domínio e tipos do banco
│   ├── css/                      # Estilos globais, variáveis de tema e tokens do Tailwind
│   ├── layouts/                  # Layouts base da aplicação (MainLayout, AuthLayout)
│   ├── modules/                  # Módulos de domínio de negócio isolados
│   │   ├── auth/                 # Fluxo de login, registro, recuperação e OAuth
│   │   ├── courses/              # Gestão de disciplinas, turmas e códigos de convite
│   │   ├── dashboard/            # Telemetria pedagógica e relatórios analíticos docentes
│   │   ├── flash-review/         # Mecanismo de avaliações rápidas pós-aula
│   │   ├── poll/                 # Enquetes interativas durante a aula
│   │   ├── qa/                   # Fila de dúvidas com sistema de upvote anônimo
│   │   ├── session/              # Orquestração do gateway de sala de aula híbrida
│   │   ├── study-groups/         # Grupos de estudos, monitorias e integração geoespacial
│   │   └── thermometer/          # Termômetro contínuo do ritmo de aprendizagem
│   ├── pages/                    # Páginas de entrada e gateways de rota
│   ├── router/                   # Configuração de rotas e Navigation Guards (RBAC)
│   └── stores/                   # Stores Pinia globais (autenticação, tema, navegação)
├── src-capacitor/                # Código de ponte nativa para Android/iOS via Capacitor
├── src-pwa/                      # Configuração de Service Workers e manifesto PWA
├── supabase/                     # Engenharia de banco de dados e configuração local
│   ├── snippets/                 # Snippets SQL modulares e declarativos (00 a 08)
│   ├── build-schema.js           # Script determinístico de concatenação do schema
│   ├── config.toml               # Configuração dos serviços e portas do Supabase CLI
│   └── Master Schema.sql         # Schema consolidado gerado automaticamente (READ-ONLY)
├── package.json                  # Dependências do ecossistema e scripts npm
├── quasar.config.ts              # Configuração global do framework Quasar
└── tailwind.config.js            # Configuração do Tailwind com prefixo tw-
```

---

## 8. Conformidade e Privacidade (LGPD)

O **Ficou Claro?** foi projetado sob os preceitos de _Privacy by Design_ (ADR-009):

- **Anonimato Algorítmico:** Dúvidas e votos de termômetro enviados por alunos são desacoplados de identificadores nominais, resguardando a integridade psicológica do discente.
- **Direito à Portabilidade e Esquecimento:** Módulo de privacidade (`/privacidade-seguranca`) que viabiliza a exportação dos dados do usuário e o encerramento definitivo da conta com confirmação explícita de segurança.
- **Proteção de Dados Públicos:** O mapeamento de campus expõe apenas pseudônimos de organizadores através de views com restrição de escopo (`WITH (security_invoker = false)`).

---

<div align="center">
  <p>Mantido com rigor técnico pela equipe de engenharia do <b>Ficou Claro?</b></p>
  <p><sub>Para reportar vulnerabilidades ou sugerir melhorias de arquitetura, abra uma issue no repositório.</sub></p>
</div>
