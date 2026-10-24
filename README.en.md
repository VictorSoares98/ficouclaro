<div align="center">
  <img src="./assets/logo.png" alt="Ficou Claro? Logo" width="180"/>
  <h1>🎓 Ficou Claro? (Is it Clear?)</h1>
  <p><em>Living Documentation — Real-Time Classroom Engagement Platform & Academic Study Group Radar</em></p>

[![Version](https://img.shields.io/badge/version-0.0.1-blue.svg?style=flat-square)](package.json)
[![License](https://img.shields.io/badge/license-MIT-green.svg?style=flat-square)](LICENSE)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg?style=flat-square)](package.json)
[![Type-Coverage](https://img.shields.io/badge/TypeScript-Strict_100%25-blue.svg?style=flat-square&logo=typescript)](tsconfig.json)
[![Vue 3](https://img.shields.io/badge/Vue.js-3.5-4FC08D?style=flat-square&logo=vuedotjs)](https://vuejs.org/)
[![Quasar](https://img.shields.io/badge/Quasar-2.25-1976D2?style=flat-square&logo=quasar)](https://quasar.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL_15-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-Prefix_tw--38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
</div>

> _Read this in other languages: [🇺🇸 English](README.en.md) | [🇧🇷 Português](README.md)_

---

## 1. Title and Overview

**Ficou Claro?** is a hybrid academic platform (Web, PWA, and Mobile) engineered to transform classroom dynamics and bridge the communication gap between educators and students. The platform replaces the traditional, awkward silence of _"Does anyone have any questions?"_ with anonymous, instantaneous, and real-time validated channels powered by WebSockets, ensuring psychological safety for students throughout their learning journey.

Beyond live classroom engagement (continuous pacing thermometer, anonymous Q&A queue with peer upvotes, and real-time polls), the ecosystem integrates an **Interactive Campus Geospatial Radar**. This feature connects the academic community to physical tutoring sessions, peer review groups, and quiet study areas distributed across university campuses, democratizing access to collaborative learning.

---

## 2. Technology Stack

The project is built on top of a modern, reactive, strictly typed architecture optimized for performance:

### Front-end

- **[Vue 3](https://vuejs.org/)**: Modern reactive framework utilizing the Composition API and `<script setup>` with strict TypeScript.
- **[Quasar Framework 2.25](https://quasar.dev/)**: UI Library and design system governing theme illumination (Dark/Light mode), mobile interaction components, and responsive app layouts.
- **[Tailwind CSS 3.4](https://tailwindcss.com/)**: Utility styling engine strictly isolated with the `tw-` prefix for spacing, micro-layouts, and flex/grid alignment.
- **[Pinia 4](https://pinia.vuejs.org/)**: Centralized reactive state management with support for persistence, SSR compatibility, and async composables.
- **[Vue Router 5](https://router.vuejs.org/)**: Dynamic routing featuring global Navigation Guards for Role-Based Access Control (RBAC).
- **[Leaflet 1.9](https://leafletjs.com/) & [Leaflet.MarkerCluster](https://github.com/Leaflet/Leaflet.markercluster)**: Interactive mapping engine rendering vector/raster clusters over OpenStreetMap tiles.
- **[Apache ECharts 6](https://echarts.apache.org/) & [vue-echarts](https://github.com/ecomfe/vue-echarts)**: Analytical charting and classroom telemetry visualization for the educator's dashboard.

### Back-end & BaaS

- **[Supabase](https://supabase.com/) (PostgreSQL 15+)**: Relational database leveraging native types, triggers, security views, and RPC functions in PL/pgSQL.
- **Supabase Auth**: Centralized identity management, JWT sessions, and Google OAuth social login.
- **Supabase Realtime**: WebSocket pub/sub engine for sub-second synchronization of classroom votes, questions, and pacing metrics.
- **Row Level Security (RLS)**: Deep database-level data isolation guaranteeing tenant privacy and role-based permissions.

### Infrastructure, Tooling & Mobile

- **[Quasar CLI with Vite 3.6](https://quasar.dev/quasar-cli-vite/introduction)**: Blazing-fast development server with Hot Module Replacement (HMR) and optimized production bundler.
- **[Capacitor 8](https://capacitorjs.com/)**: Cross-platform native runtime for Android (and iOS) packaging, with biometric authentication and haptic feedback bridges.
- **[Docker](https://www.docker.com/) & Supabase CLI**: Complete local container orchestration (PostgreSQL, GoTrue, PostgREST, Realtime, and Studio).
- **Quality Tooling**: [TypeScript 6](https://www.typescriptlang.org/), [ESLint 10](https://eslint.org/), [Prettier 3](https://prettier.io/), and [vue-tsc](https://github.com/vuejs/language-tools).

---

## 3. Architecture and Security

The system adheres to rigorous engineering principles to guarantee scalability, maintainability, and security from Day 1:

- **Centralized Role-Based Access Control (RBAC):**  
  Authorization is enforced in layers. On the Front-end, `Vue Router` evaluates user roles (`docente` [educator], `discente` [student], and `visitante` [guest]) via global navigation guards. In hybrid session routes (such as `/sala/:id`), the router dynamically mounts divergent interfaces (`ProfessorSessionPage` vs `StudentSessionPage`) under the same base URL. On the Back-end, PostgreSQL reinforces RBAC through strict Row Level Security (RLS) policies anchored to the user's Supabase Auth UID.

- **Styling Isolation (`tw-` Prefix Enforcement):**  
  To eliminate CSS class collisions and specificity wars with Quasar components, Tailwind CSS is configured exclusively with the required `tw-` prefix (enforced in `tailwind.config.js`). Quasar Framework remains the supreme authority over component surfaces, tokens, and lighting modes, while `tw-*` utilities are restricted to flex layouts and spacing.

- **Hardening & Zero-Direct-Access (Privacy by Design / LGPD):**  
  Anonymous queries for public campus data (e.g., retrieving study groups on the map) have no direct `SELECT` permissions on primary relational tables (`grupos_estudo`, `usuarios`). Requests are mediated through a _Database Facade_ consisting of secure Views defined `WITH (security_invoker = false)`, ensuring that Personally Identifiable Information (PII) is never exposed to unauthenticated actors.

- **Modular SQL Architecture (Schema Splitting):**  
  Instead of fragile timestamp-based migrations during MVP development, the database schema is divided into 9 idempotent, semantic snippets in `supabase/snippets/` (`00_Init_Extensions` through `08_Realtime`). The internal script `npm run db:build` deterministically compiles them into the consolidated `Master Schema.sql`.

- **Singleton Pattern for Realtime Connections (ADR-006):**  
  Native WebSocket subscriptions inside Vue components are prohibited. All real-time telemetry flows exclusively through the `RealtimeManager` singleton service, preventing memory leaks, duplicate channels, and race conditions.

- **Strict Type-Safety (No `any` Policy - ADR-001):**  
  Using `any` is strictly banned in the codebase. All API payloads and database responses are mapped to canonical domain interfaces defined in `src/core/types`.

- **Resilient Asynchronous State:**  
  All async Pinia store actions utilize the universal `useAsyncOperation` composable, standardizing loading indicators, error handling, and user notifications via native Quasar Notify banners.

---

## 4. Prerequisites

Before setting up the local environment, make sure your machine has:

- **Node.js:** Version `>= 20.x` (Recommended: v22 LTS or v24; use `nvm` or `fnm`).
- **NPM:** Version `>= 10.x`.
- **Docker Desktop** or **Docker Engine** (with Docker Compose enabled): Required to run the local Supabase CLI stack.
- **Git:** Version `>= 2.30` for repository cloning and branch management.
- _(Optional for Android)_: Android Studio Flamingo+ and Android SDK configured for mobile emulation and native builds.

---

## 5. Local Setup

Follow the steps below to initialize the infrastructure and launch the development environment:

### 1. Clone the Repository

```bash
git clone https://github.com/VictorSoares98/ficouclaro.git
cd ficouclaro
npm install
```

### 2. Configure Environment Variables

Copy the template environment file into the root folder:

```bash
cp .env.example .env
```

Open the generated `.env` file and configure your local parameters. For local Supabase development, set:

```env
# Local Supabase Connection
QCLI_SUPABASE_URL="http://127.0.0.1:54421"
QCLI_SUPABASE_ANON_KEY="<your-anon-key-displayed-by-supabase-start>"

# Google OAuth Credentials (Optional for local testing)
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=""
SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=""
```

> 💡 **Note for Physical Mobile Testing:** When running on a physical Android device or emulator connected to your local Wi-Fi, replace `127.0.0.1` with your computer's local network IP address (e.g., `http://192.168.1.15:54421`).

### 3. Start Infrastructure (Supabase / Docker)

Spin up the local Supabase container suite:

```bash
npm run db:start
```

> _(On first boot, Supabase CLI downloads required Docker images and prints API credentials, service keys, and the Supabase Studio dashboard URL at `http://127.0.0.1:54423`)_.

### 4. Run the Application

With the backend running, start the Quasar Vite dev server with Hot Module Replacement:

```bash
npm run dev
```

Open your browser at:
👉 **`http://localhost:9000`**

> 📱 **Local Network / Mobile Device Access:**  
> To test the application on smartphones or other machines on the same local Wi-Fi network, forward the host flag to Quasar:
>
> ```bash
> npm run dev -- -H 0.0.0.0
> ```
>
> The CLI will display your local IP network address (e.g., `http://192.168.1.15:9000`).

---

## 6. Available Scripts

The following standard operational commands are defined in `package.json`:

| Script          | Command Executed                                                    | Purpose / Description                                                                           |
| :-------------- | :------------------------------------------------------------------ | :---------------------------------------------------------------------------------------------- |
| `dev`           | `npm run db:start && quasar dev`                                    | Starts local Supabase and launches Vite dev server with HMR on port `9000`.                     |
| `build`         | `quasar build`                                                      | Compiles the production build and outputs optimized static assets to `dist/spa`.                |
| `typecheck`     | `vue-tsc --noEmit`                                                  | Validates TypeScript types across `.vue` SFCs and `.ts` modules without emitting files.         |
| `lint`          | `prettier --write ... && eslint --fix ...`                          | Automatically fixes code styling and ESLint violations across the codebase.                     |
| `lint:check`    | `prettier ... && eslint ...`                                        | Runs linting and formatting verification in read-only mode (ideal for CI/CD).                   |
| `db:start`      | `npx supabase start`                                                | Initializes local Supabase Docker containers.                                                   |
| `db:stop`       | `npx supabase stop`                                                 | Gracefully shuts down all local Supabase Docker containers.                                     |
| `db:build`      | `node supabase/build-schema.js`                                     | Concatenates the 9 snippets in `supabase/snippets/` into `Master Schema.sql`.                   |
| `build:android` | `dotenv -e .env.production -- quasar build -m capacitor -T android` | Produces an Android production build with Capacitor injecting production environment variables. |

---

## 7. Folder Structure

The project follows a modular structure inspired by Feature-Sliced Design (FSD) customized for the Quasar framework:

```text
ficouclaro/
├── .agents/                      # AI assistant governance, rules, and architecture protocols
├── public/                       # Static assets served directly without bundling
│   └── icons/                    # Self-hosted, optimized vector icons (e.g., google.svg)
├── src/                          # Application source code
│   ├── assets/                   # Images and branding processed by Vite
│   ├── boot/                     # Quasar boot plugins (Supabase client init, i18n)
│   ├── components/               # Atomic, shared visual components
│   ├── core/                     # Transversal infrastructure and shared utilities
│   │   ├── components/           # Core UI components (Leaflet map core, navigation bars)
│   │   ├── composables/          # Reusable Vue composables (useAsyncOperation, useTheme)
│   │   ├── services/             # API client abstraction, base services, and HTTP wrappers
│   │   ├── supabase/             # Supabase client singleton and RealtimeManager
│   │   └── types/                # Canonical domain models and database type definitions
│   ├── css/                      # Global styles, theme variables, and Tailwind tokens
│   ├── layouts/                  # Master application shells (MainLayout, AuthLayout)
│   ├── modules/                  # Isolated business domain modules
│   │   ├── auth/                 # Authentication (Login, Register, Password Reset, OAuth)
│   │   ├── courses/              # Course, classroom, and invite code management
│   │   ├── dashboard/            # Pedagogical telemetry and educator analytics
│   │   ├── flash-review/         # Post-session rapid micro-reviews
│   │   ├── poll/                 # Live interactive classroom polls
│   │   ├── qa/                   # Anonymous question queue with peer upvotes
│   │   ├── session/              # Hybrid classroom gateway and live session orchestration
│   │   ├── study-groups/         # Study groups, peer tutoring, and Leaflet map integration
│   │   └── thermometer/          # Real-time learning pace thermometer
│   ├── pages/                    # Route entry pages and navigational gateways
│   ├── router/                   # Vue Router configuration and RBAC Navigation Guards
│   └── stores/                   # Global Pinia stores (Auth, Theme, Navigation)
├── src-capacitor/                # Capacitor bridge and native project wrapper (Android/iOS)
├── src-pwa/                      # Service Worker registration and PWA manifest config
├── supabase/                     # Database engineering and local Docker environment
│   ├── snippets/                 # Modular, declarative SQL snippets (00 through 08)
│   ├── build-schema.js           # Deterministic schema compilation script
│   ├── config.toml               # Supabase CLI ports, services, and auth configuration
│   └── Master Schema.sql         # Consolidated database schema (READ-ONLY)
├── package.json                  # Dependencies, metadata, and npm automation scripts
├── quasar.config.ts              # Quasar CLI and Vite compilation settings
└── tailwind.config.js            # Tailwind configuration (isolated with tw- prefix)
```

---

## 8. Privacy and Compliance (LGPD / GDPR)

**Ficou Claro?** was architected from the ground up under _Privacy by Design_ principles (ADR-009):

- **Algorithmic Anonymity:** Student inquiries and pacing votes are decoupled from personal user identities, protecting academic psychological safety.
- **Portability & Right to be Forgotten:** A dedicated Privacy Center (`/privacidade-seguranca`) allows users to export all account data and trigger irreversible account deletion with explicit keyphrase confirmation.
- **Shielded Public APIs:** The campus study map projects sanitized organizer aliases through restricted Views (`WITH (security_invoker = false)`), never exposing user credentials or private records to unauthenticated visitors.

---

<div align="center">
  <p>Maintained with technical precision by the <b>Ficou Claro?</b> engineering team.</p>
  <p><sub>To report vulnerabilities or suggest architectural improvements, please open an issue in this repository.</sub></p>
</div>
