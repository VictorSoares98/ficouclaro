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
    *Diferente do comando `dev`, esse script aciona o `quasar build`. O Vite entende que é uma build de produção e automaticamente ignora o `.env` base, lendo apenas o `.env.production`. As chaves da nuvem serão congeladas (hardcoded) no binário gerado.*

3.  **Gere o APK Físico no Android Studio:**
    - No Android Studio (que se abrirá após o comando anterior), vá em **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
    - O arquivo final estará na pasta do seu projeto em: `src-capacitor/android/app/build/outputs/apk/debug/app-debug.apk`. Esse é o seu aplicativo cloud!

---

## 🧹 5. Manutenção de Linter

Para evitar que o Prettier aponte erros em arquivos gerados pelo build do Android, configuramos o `.prettierignore` para ignorar:

- `src-capacitor/android/app/build/`
- `src-capacitor/android/app/src/main/assets/public/`

---

## 🕵️‍♂️ 6. Dicas do Agent Sagaz

1.  **Logs no Android Studio:** Use a aba **Logcat** e filtre por `Capacitor/Console` para debugar o JavaScript como um ninja.
2.  **IP Dinâmico:** Se o seu IP mudar, você deve atualizar o arquivo `.env` e o `network_security_config.xml`.
3.  **Permissões:** Novas permissões (Câmera, Galeria) devem ser adicionadas no `AndroidManifest.xml`.

---

_Documentação atualizada conforme os requisitos da disciplina de Laboratório de Apps Híbridos e as sacadas do Agent Sagaz._
