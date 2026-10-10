# Guia de Configuração e Troubleshooting - Mobile (Capacitor + Android)

Este documento resume as etapas de inicialização e as configurações essenciais realizadas para garantir que o projeto **Ficou Claro** funcione corretamente em ambientes mobile híbridos.

---

## 🛠 1. Inicialização do Capacitor no Projeto

Se você estiver começando um projeto Quasar do zero ou adicionando suporte mobile:

1.  **Adicionar o modo Capacitor:**

    ```bash
    quasar mode add capacitor
    ```

    _Isso criará a pasta `src-capacitor` na raiz._

2.  **Instalar plataformas nativas:**
    Dentro da pasta `src-capacitor`:

    ```bash
    npx cap add android
    npx cap add ios
    ```

3.  **Configurar o App ID:** No arquivo `src-capacitor/capacitor.config.ts`, defina o `appId` (ex: `com.ficouclaro.app`) e o `appName`.

---

## 🚀 2. Configuração de Rede (Desenvolvimento Local)

Em apps híbridos, o dispositivo mobile precisa se comunicar com o servidor da sua API (Supabase) que está rodando no seu computador.

### Desafios resolvidos:

1.  **Mixed Content:** O Android bloqueia chamadas `http` vindo de um ambiente `https://localhost`.
2.  **Cleartext Traffic:** O Android 9+ bloqueia conexões `http` por padrão.

### Soluções aplicadas:

#### A. Ajuste no `capacitor.config.ts`

Forçamos o esquema de carregamento para `http` para evitar bloqueio de conteúdo misto.

```typescript
server: {
  cleartext: true,
  androidScheme: 'http',
}
```

#### B. Network Security Config (Obrigatório para API Local)

Criamos uma lista de exceções para permitir HTTP apenas em domínios de confiança.

- **Arquivo:** `src-capacitor/android/app/src/main/res/xml/network_security_config.xml`
- **Domínios:** `localhost`, `10.0.2.2` (Emulador) e o seu IP de rede (ex: `192.168.1.xxx`).

---

## 📱 3. Workflow de Execução (Desenvolvimento Local)

Sempre que quiser rodar o app no dispositivo testando contra o banco local:

1.  **Sincronizar mudanças web com o nativo:**
    ```bash
    npx cap sync android
    ```
2.  **Rodar em modo Desenvolvimento (com Live Reload):**

    ```bash
    npx quasar dev -m capacitor -T android -- --address 0.0.0.0
    ```

    _⚠️ **ATENÇÃO:** O comando `quasar dev` puxa estritamente as chaves do seu arquivo `.env` base (Supabase Local). O `--address 0.0.0.0` permite que o celular acesse o servidor do PC._

3.  **Abrir o projeto no Android Studio:**
    ```bash
    npx cap open android
    ```

---

## 📦 4. Build de Produção (Gerando o APK para a Nuvem)

Para gerar o app real que se conectará ao seu banco na web (Supabase Cloud), o fluxo exige a compilação final:

1.  **Configure o `.env.production`:** Crie ou preencha este arquivo na raiz com as chaves do seu projeto hospedado na nuvem.
2.  **Gere o Build Web de Produção para Android:**

    ```bash
    npm run build:android
    ```

    _Diferente do comando `dev`, esse script utiliza o `dotenv-cli` para forçar a injeção do `.env.production` no processo do `quasar build`. Isso garante que as chaves da nuvem sejam congeladas (hardcoded) no binário gerado, ignorando as chaves locais._

3.  **Gere o APK Físico no Android Studio:**
    - No Android Studio, vá em **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
    - O arquivo final estará na pasta do seu projeto em: `src-capacitor/android/app/build/outputs/apk/debug/app-debug.apk`. Esse é o seu aplicativo cloud!

---

## 🧹 5. Manutenção de Linter

Para evitar que o Prettier aponte erros em arquivos gerados pelo build do Android, configuramos o `.prettierignore` para ignorar:

- `src-capacitor/android/app/build/`
- `src-capacitor/android/app/src/main/assets/public/`

---

## 🔗 6. Android App Links (Deep Links Inteligentes)

O projeto está configurado para capturar links da web (ex: `https://ficouclaro.pages.dev`) e redirecioná-los de forma inteligente:

- **Se o usuário TIVER o APK instalado:** O Android abrirá o aplicativo nativo imediatamente.
- **Se o usuário NÃO TIVER o APK:** O link será aberto normalmente no navegador, carregando o Progressive Web App (PWA).

### O que foi feito:

1. **`AndroidManifest.xml`:** Configurado o `<intent-filter android:autoVerify="true">` para capturar os schemas `http` e `https` no domínio do Cloudflare Pages.
2. **`assetlinks.json`:** Criado na pasta `public/.well-known/` (servido com `Content-Type: application/json` via `_headers`) contendo o _Fingerprint SHA-256_ da nossa chave de release. Isso prova ao Google que o app é "dono" do site.
3. **`src/App.vue`:** O listener do `@capacitor/app` captura o evento `appUrlOpen` e navega suavemente via Vue Router.

---

## 🕵️‍♂️ 7. Dicas do Agent Sagaz

1.  **Logs no Android Studio:** Use a aba **Logcat** e filtre por `Capacitor/Console` para debugar o JavaScript como um ninja.
2.  **IP Dinâmico:** Se o seu IP mudar, você deve atualizar o arquivo `.env` e o `network_security_config.xml`.
3.  **Permissões:** Novas permissões (Câmera, Galeria) devem ser adicionadas no `AndroidManifest.xml`.

---

## 📋 8. Checklist de Configurações Manuais do Capacitor (Cheat Sheet)

Se precisar recriar o projeto do zero ou replicar essa arquitetura no futuro, este é o "caminho das pedras" dos arquivos da pasta `src-capacitor` que devem ser ajustados **manualmente** (além do que o comando `npx cap sync` gera):

### Globais

- **`src-capacitor/capacitor.config.ts`**:
  - Habilitado `server.cleartext: true` e `androidScheme: 'http'` para contornar o bloqueio de desenvolvimento local.
  - Comportamento do plugin `Keyboard` (`resize: 'body'`) ajustado para responsividade perfeita em inputs.
  - Setup do `SplashScreen` (cores, timers, modo imersivo).

### Nativas (Android)

- **`src-capacitor/android/app/src/main/AndroidManifest.xml`**:
  - Referenciada a `network_security_config` para conexões locais no emulador.
  - Inserido o bloco `<intent-filter>` de `App Links` (com `autoVerify="true"`).
- **`src-capacitor/android/app/src/main/res/xml/network_security_config.xml`**:
  - Criado manualmente para liberar tráfego das portas `localhost` e `10.0.2.2`.
- **`src-capacitor/android/gradle.properties`** e **`gradle-wrapper.properties`**:
  - Atualizada a distribuição do Gradle (para `9.5.0`) e otimização R8 habilitada.
- **`src-capacitor/android/build.gradle`** e **`app/build.gradle`**:
  - Atualizada a versão do AGP (Android Gradle Plugin).
  - Renomeado o output final para `Ficou-Claro.apk`.
- **`src-capacitor/android/settings.gradle`**:
  - Inclusão do plugin `foojay-resolver` para o gradle baixar e fixar o `JDK 21` sozinho.

### Recursos (Assets)

- **`src-capacitor/android/app/src/main/res/...`**:
  - Substituição de toda a árvore de imagens (`ic_launcher.png`, `splash.png`) para alinhar com o branding "Ficou Claro".

---

_Documentação atualizada conforme os requisitos da disciplina de Laboratório de Apps Híbridos e as sacadas do Agent Sagaz._
