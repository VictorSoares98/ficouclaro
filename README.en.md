<div align="center">
  <img src="./assets/logo.png" alt="Ficou Claro? Logo" width="180"/>
  <h1>🎓 Ficou Claro? (Is it Clear?)</h1>
  <p><em>The end of "Does anyone have any questions?" followed by absolute silence.</em></p>
</div>

> The anti-boredom thermometer for your classroom and the physical study group radar for your campus. Anonymous real-time feedback and academic geolocation for everyone who cares about active learning.

_Read this in other languages: [🇺🇸 English](README.en.md) | [🇧🇷 Português](README.md)_

[![Vue 3](https://img.shields.io/badge/Vue.js-35495E?style=flat&logo=vuedotjs&logoColor=4FC08D)](https://vuejs.org/)
[![Quasar](https://img.shields.io/badge/Quasar-1976D2?style=flat&logo=quasar&logoColor=white)](https://quasar.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-19.4-green?style=flat&logo=leaflet&logoColor=white)](https://leafletjs.com/)

**Goal:** Enable students to evaluate teaching methods and interact anonymously in real-time, while connecting students to physical tutoring, review groups, and study spaces across campus.

---

## 🏗️ 2. Architecture and Stack

Our stack was rigorously chosen to deliver a highly reactive, scalable and production-ready Hybrid Application.

- **Frontend & Mobile:** [Vue 3](https://vuejs.org/) (Composition API), [Quasar Framework](https://quasar.dev/) (UI System & Lighting Sovereign), [Tailwind CSS](https://tailwindcss.com/) (Utility Styling isolated with the `tw-` prefix), [Pinia](https://pinia.vuejs.org/) (Reactive State Management).
- **Mapping & Geospatial:** [Leaflet](https://leafletjs.com/) + [Leaflet.MarkerCluster](https://github.com/Leaflet/Leaflet.markercluster) integrated with OpenStreetMap, supporting adaptive clustering, dark mode tiles, and Bento Grid popups.
- **Design System:** Translucent Glassmorphism with orthogonal tokens (`.fc-glass-header`, `.fc-glass-footer`, `.fc-glass-drawer`), native mobile safe-areas, and support for 6 branding themes (*Default, Ocean, Dracula, Summer Berries, Lunar Twilight, and Nature Terrain*).
- **Backend & Database:** [Supabase](https://supabase.com/) (PostgreSQL + Auth + Realtime), Strict Row Level Security (RLS), Modular SQL Architecture (Schema Splitting), and Zero-Direct-Access Hardening.
- **Infra/Deploy:** [Quasar CLI](https://quasar.dev/quasar-cli-vite/introduction) (Official Vite-based build tool), [Capacitor](https://capacitorjs.com/) (Native Android/iOS Mobile), and Offline-ready PWA.

---

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

---

## 📜 4. Engineering Guidelines (The Constitution)

To keep the codebase predictable and scalable, we follow inflexible rules:

1. **No `any` (Strict Type-safety - ADR-001):** The use of `any` is strictly prohibited. We guarantee end-to-end typing. Supabase queries are typed via CLI-generated DB Types and mapped to domain interfaces in `src/core/types` and FSD modules.
2. **Separation of Concerns (FSD - Feature Sliced Design - ADR-002):**
   - **Components (`pages/`, `components/`):** Purely visual. They handle layouts, animations, and action dispatching.
   - **Stores (`stores/` - Pinia):** Manage global asynchronous state, caching, loading, and error states.
   - **Services (`services/`):** Isolate pure business logic and API (Supabase) calls with zero coupling to the Vue ecosystem.
3. **Consistent Mixed UI (ADR-003):**
   - **Layout, grid, and spacing:** `Tailwind CSS` (Strictly configured with the `tw-` prefix to prevent scope conflicts).
   - **Interactive Components & Themes:** `Quasar Framework` is the sole sovereign of surfaces and Dark/Light mode switching.
4. **Modular SQL Architecture (ADR-004):** No obscure timestamp-based migrations for MVP development. The Postgres schema is semantically managed by snippets (`00_Init.sql` to `08_Realtime.sql`), deterministically unified by the `npm run db:build` script.
5. **Hardening & Zero-Direct-Access:** Public aggregated views (such as the campus study map) operate via secure Views with `security_invoker = false`, blocking direct `anon` access to base tables and shielding Personal Identifiable Information (PII).
6. **Concurrency and Async State (ADR-005):** All stores and requests must consume the universal `useAsyncOperation` composable, standardizing elegant _Loading States_ and resilient error handling.
7. **Realtime Connections (WebSocket - ADR-006):** Native Supabase subscriptions are forbidden in views. Any real-time listening must transact exclusively via the Singleton Pattern through the `RealtimeManager`, preventing _Race Conditions_ and ghost connections.
8. **Mobile Ergonomics & Thumb Zone:** Mobile devices utilize a tactile bottom navigation bar (`MobileNavBottom.vue`) with native safe-areas (`env(safe-area-inset-bottom)`), while map views (`/mapa`) and authentication assume a 100% immersive layout.
9. **Data Integrity and Security (ADR-007):** Unique interaction control (Anti-Vote Duplicity) never relies on browser cache. Blocking occurs natively in PostgreSQL using `Unique Constraints` with One-Way Hashes based on user identity.
10. **Clean Code & Resilient UX:** Fragile relative paths (`../../`) are forbidden; we always use the absolute alias `@/`. Asynchronous exception handling is centralized in Quasar Notify.

---

## 🛠️ 5. Scripts & Workflow

List of available commands via `npm run`:

| Script          | Description                                                                                                     |
| --------------- | --------------------------------------------------------------------------------------------------------------- |
| `dev`           | Starts local Supabase and launches the Quasar CLI development server (HMR enabled).                              |
| `build`         | Runs Type Check (`vue-tsc`) and generates the optimized static production bundle.                               |
| `typecheck`     | Validates strict typing across the entire TypeScript/Vue project (`vue-tsc --noEmit`).                          |
| `lint`          | Runs ESLint with auto-fix and Prettier formatting across the entire codebase.                                   |
| `lint:check`    | Runs linting and formatting check in read-only mode (ideal for CI/CD pipelines).                                |
| `db:build`      | Concatenates the 9 snippets from the `supabase/snippets` folder generating the consolidated `Master Schema.sql`. |
| `db:start`      | Starts the local Supabase suite via Docker CLI.                                                                 |
| `db:stop`       | Stops the running local Supabase containers.                                                                    |
| `build:android` | Generates the Quasar production build explicitly injecting `.env.production` via `dotenv-cli`.                  |

### 📱 Mobile Development (Capacitor)

The application has been packaged for native execution via Quasar + Capacitor. We have 2 strict flows:

- **1. Development Mode (Hot Reload):** Reads keys from the `.env` file (Local Supabase).  
  `npx quasar dev -m capacitor -T android -- --address 0.0.0.0`
- **2. Production Mode (Cloud):** Reads keys from the `.env.production` file (Cloud Supabase).  
  `npm run build:android` -> When Android Studio opens, go to **Build > Build APKs** to generate the final file.

> ⚠️ **Security Note:** Network policies for local development (HTTP) are configured in `src-capacitor/android/app/src/main/res/xml/network_security_config.xml`. Check the mobile configuration guide to learn how to update the allowed IP.

---

## 🌟 6. User Flow and Features (MVP)

The core architecture divides the experience into distinct profiles (Role-Based Access Control) interacting within the same Virtual Classroom and academic ecosystem:

### Profiles Architecture (RBAC)

- **Professor Dashboard:** The teacher creates classes (with rich metadata: semester, shift, room), generating a unique alphanumeric `Invite Code`. From the dashboard, they start "Classrooms" (Sessions).
- **Student Hub:** The student enters the Invite Code, is instantly enrolled, and tracks their course history.
- **Hybrid Gateway (`/sala/:id`):** The application uses the same URL for the class, but Vue Router renders completely different panels depending on the user's role (`ProfessorSessionPage` with controls vs `StudentSessionPage` with voting buttons).
- **Visitor / Community:** Free access to the gamified Landing Page, interactive classroom simulator, and the physical campus study map.

### Core Features

1. **Polls and Real-Time Interactions:** Didactic check-in during class (Multiple choice, Word cloud, Scales).
2. **Class Rhythm Thermometer:** Continuous and visual feedback ("Too fast", "Lost", "All good") operating via _Supabase Realtime_, with anti-spam protection via a 10s throttle.
3. **Q&A Panel with Upvote:** 100% anonymous textual Q&A system for students (LGPD by design) prioritized by the class itself.
4. **Post-Class Flash Review:** Instant post-session evaluation system to create a quality history for the discipline.
5. **Dashboard & Insights:** Screen that consolidates flash reviews, Q&A volume, and thermometer peaks, allowing the professor to understand the general engagement clearly.
6. **🗺️ Interactive Campus Map & Study Groups (`/mapa`):**  
   - Visual discovery of peer tutoring, review study groups, and campus research projects.
   - Intelligent clustering powered by Leaflet and OpenStreetMap (without commercial watermarks).
   - Floating sidebar on desktop and ergonomic Bottom Sheet on mobile with 3 snap points (*peek*, *half*, and *expanded*).
   - Bento Grid cards detailing building, block, room, day, time, and available seats.
7. **🎮 Gamified Landing Page & Interactive Simulator:**  
   - Dynamic Hero with real-time interactive simulation of the live thermometer and questions.
   - Instant classroom access using a numeric PIN directly from the Hero (`/sala/:pin`).
   - Feature showcase in Bento Grid layout with institutional compliance.
8. **🧭 Contextual Navigation & Mobile Ergonomics:**  
   - Translucent glassmorphism adaptive header with gamified XP/Level badge.
   - Off-canvas lateral drawer for tablets and smartphones.
   - Tactile bottom navigation (*Thumb Zone*) with intelligent isolation for immersive pages.

---

## 🔐 7. Compliance and Privacy (GDPR/LGPD)

**Ficou Claro?** adopts the _Privacy by Design_ philosophy (ADR-009). As an application aimed at educational interactions, protecting user data is a technical priority:

- **Terms and Consent Versioning:** Versioned system for terms acceptance. Whenever the policy changes, the database strictly requires a new encrypted consent (timestamp and version) from the user upon their next login.
- **Right to Data Portability:** Native Privacy Hub (`/privacidade-seguranca`) that allows users to export all their consolidated data (Profile, Q&A history, etc.) in portable formats (JSON, CSV).
- **Right to be Forgotten:** Automated account deletion (Hard Delete) featuring strict protection against accidental actions (requires an exact match challenge phrase "EXCLUIR MINHA CONTA").
- **Built-in Anonymity:** By default, all questions submitted by students and poll votes do not expose their identity to the professor, fostering psychological safety in the learning process.
- **Public API Shielding:** The campus map consumes a Facade View configured with `security_invoker = false`, ensuring creator names and study group stats are projected cleanly without ever exposing underlying user records (`usuarios`) to unauthenticated visitors.

---

**Lead Developer:** Victor Soares
