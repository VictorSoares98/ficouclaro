<div align="center">
  <img src="./assets/logo.png" alt="Ficou Claro? Logo" width="180"/>
  <h1>🎓 Ficou Claro? (Is it Clear?)</h1>
  <p><em>The end of "Does anyone have any questions?" followed by absolute silence.</em></p>
</div>

> The anti-boredom thermometer for your classroom. Anonymous, real-time feedback for professors who care.

_Read this in other languages: [🇺🇸 English](README.en.md) | [🇧🇷 Português](README.md)_

[![Vue 3](https://img.shields.io/badge/Vue.js-35495E?style=flat&logo=vuedotjs&logoColor=4FC08D)](https://vuejs.org/)
[![Quasar](https://img.shields.io/badge/Quasar-1976D2?style=flat&logo=quasar&logoColor=white)](https://quasar.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

**Goal:** Enable students to evaluate teaching methods and interact anonymously in real-time, generating instant data for continuous classroom improvement.

---

## 🏗️ 2. Architecture and Stack

Our stack was rigorously chosen to deliver a highly reactive, low-initial-cost Hybrid MVP.

- **Frontend & Mobile:** [Vue 3](https://vuejs.org/) (Composition API), [Quasar Framework](https://quasar.dev/) (UI System), [Tailwind CSS](https://tailwindcss.com/) (Utility Styling), [Pinia](https://pinia.vuejs.org/) (State Management).
- **Backend & Database:** [Supabase](https://supabase.com/) (PostgreSQL + Auth + Realtime), Strict Row Level Security (RLS) protection, Modular SQL Architecture.
- **Infra/Deploy:** [Quasar CLI](https://quasar.dev/quasar-cli-vite/introduction) (Official Vite-based build tool), [Capacitor](https://capacitorjs.com/) (Native Mobile).

## 🚀 3. Prerequisites & Local Environment

### Prerequisites

- **Node.js:** v20+ (Recommended to use `nvm` or `fnm`)
- **NPM:** v10+

### Installation and Execution

1. **Clone the repository and install dependencies:**

   ```bash
   git clone <repo-url>
   cd ficouclaro
   npm install
   ```

2. **Environment Setup (`.env`):**
   Create a `.env.local` file in the project root containing your Supabase project keys:

   ```env
   QCLI_SUPABASE_URL="https://<your-project>.supabase.co"
   QCLI_SUPABASE_ANON_KEY="<your-anon-key>"

   # Google Social Login Keys (Required for local OAuth emulation)
   SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID="<client-id>"
   SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET="<secret>"
   ```

   > 🔐 **Local Social Login (Google):** The `supabase/config.toml` file is tied to these keys. To test the flow locally without 400 errors, strictly add the redirect URI `http://127.0.0.1:54421/auth/v1/callback` to your **Google Cloud Console** project.

   > 💡 **Important for Mobile:** For testing on real devices or emulators with Local Supabase, use your computer's IP (e.g., `http://192.168.x.xxx:54421`) instead of `localhost`. Check the [GUIA_CONFIGURACAO_MOBILE.md](./GUIA_CONFIGURACAO_MOBILE.md) for technical details.

3. **Starting the application (Dev Mode):**
   ```bash
   npm run dev
   ```

## 📜 4. Engineering Guidelines (The Constitution)

To keep the codebase predictable and scalable, we follow inflexible rules:

1. **No `any` (Strict Type-safety):** The use of `any` is strictly prohibited. We guarantee end-to-end typing. Supabase queries are typed via CLI-generated DB Types and mapped to domain interfaces in `src/core/types`.
2. **Separation of Concerns (FSD - Feature Sliced Design):**
   - **Components (`pages/`, `components/`):** Purely visual ("dumb"). They handle layouts and dispatch actions.
   - **Stores (`stores/` - Pinia):** "Smart". They manage global asynchronous state, cache, loading, and error states.
   - **Services (`services/`):** Isolate pure business logic and API (Supabase) calls with zero coupling to the Vue ecosystem.
3. **Consistent Mixed UI:**
   - **Layout, grid, and spacing:** `Tailwind CSS` (Strictly configured with the `tw-` prefix to prevent scope conflicts).
   - **Interactive Components (Inputs, Modals, Dropdowns):** `Quasar Framework`.
4. **Modular SQL Architecture:** No obscure time-based migrations for MVP development. The Postgres schema is semantically managed by snippets (`00_Init.sql`, `01_Enums.sql`, etc.), deterministically unified by the `db:build` script.
5. **Concurrency and Async State:** To annihilate redundancies, all stores and requests must consume the universal `useAsyncOperation` composable, standardizing elegant _Loading States_ and swallowing exceptions without triggering _Unhandled Promise Rejections_.
6. **Realtime Connections (WebSocket):** Native Supabase subscriptions are forbidden in views. Any real-time listening must transact exclusively via the Singleton Pattern through the `RealtimeManager`, preventing _Race Conditions_ and ghost connections.
7. **Clean Code & Resilient UX:** Fragile relative paths (`../../`) are forbidden; we always use the absolute alias `@/`. Asynchronous exception handling is centralized in Quasar Notify, ensuring humanized feedback to the user. The app features active network drop handling (warning banner and state caching).
8. **Data Integrity and Security:** Unique interaction control (Anti-Vote Duplicity) never relies on browser cache (LocalStorage). Blocking occurs natively in PostgreSQL using `Unique Constraints` with One-Way Hashes based on user identity.
9. **Defensive TypeScript and Structural Reactivity:** Non-null assertions (`!`) to force the compiler are forbidden. Type Guards in async callbacks must be handled via _Constant Aliasing_. Direct array mutations (`push/splice`) are replaced by functional destructuring (`= [...]`) to ensure Vue Proxy integrity.

## 🛠️ 5. Scripts & Workflow

List of available commands via `npm run`:

| Script          | Description                                                                                                     |
| --------------- | --------------------------------------------------------------------------------------------------------------- |
| `dev`           | Starts the Quasar CLI development server (HMR enabled).                                                         |
| `build`         | Runs Type Check (`vue-tsc`) and generates the optimized static production bundle.                               |
| `lint`          | Runs ESLint + Prettier to ensure type compliance and visual code standardization across the project.            |
| `db:build`      | Concatenates snippets from the `supabase/snippets` folder generating the consolidated `Master Schema.sql` file. |
| `build:android` | Generates the Quasar production build explicitly injecting `.env.production` via `dotenv-cli`.                  |

### 📱 Mobile Development (Capacitor)

The application has been packaged for native execution via Quasar + Capacitor. We have 2 strict flows:

- **1. Development Mode (Hot Reload):** Reads keys from the `.env` file (Local Supabase).
  `npx quasar dev -m capacitor -T android -- --address 0.0.0.0`
- **2. Production Mode (Cloud):** Reads keys from the `.env.production` file (Cloud Supabase).
  `npm run build:android` -> When Android Studio opens, go to **Build > Build APKs** to generate the final file.

> ⚠️ **Security Note:** Network policies for local development (HTTP) are configured in `src-capacitor/android/app/src/main/res/xml/network_security_config.xml`. Check the mobile configuration guide to learn how to update the allowed IP.

## 🌟 6. User Flow and Features (MVP)

The core architecture divides the experience into two distinct profiles (Role-Based Access Control) interacting in the same Virtual Classroom:

### Profiles Architecture (RBAC)

- **Professor Dashboard:** The teacher creates classes (with rich metadata: semester, shift, room), generating a unique alphanumeric `Invite Code`. From the dashboard, they start "Classrooms" (Sessions).
- **Student Hub:** The student enters the Invite Code, is instantly enrolled, and waits for the classroom to open.
- **Hybrid Gateway (`/sala/:id`):** The application uses the same URL for the class, but Vue Router renders completely different panels depending on the user's role (`ProfessorSessionPage` with controls vs `StudentSessionPage` with voting buttons).

### Core Features

1. **Polls and Real-Time Interactions:** Didactic check-in during class (Multiple choice, Word cloud, Scales).
2. **Class Rhythm Thermometer:** Continuous and visual feedback ("Too fast", "Lost", "All good") operating via _Supabase Realtime_, with anti-spam protection via a 10s throttle.
3. **Q&A Panel with Upvote:** 100% anonymous textual Q&A system for students (LGPD by design) prioritized by the class itself.
4. **Post-Class Flash Review:** Instant post-session evaluation system to create a quality history for the discipline.
5. **Dashboard & Insights:** Screen that consolidates flash reviews, Q&A volume, and thermometer peaks, allowing the professor to understand the general engagement and reception of their discipline clearly and objectively.

---

**Lead Developer:** Victor Soares
