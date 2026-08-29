# Guia de Configuração e Troubleshooting - Mobile (Capacitor + Android)

Este documento resume as etapas de inicialização e as configurações essenciais realizadas para garantir que o projeto **Ficou Claro** funcione corretamente em ambientes mobile híbridos.

---

## 🛠 1. Inicialização do Capacitor no Projeto

Se você estiver começando um projeto Quasar do zero ou adicionando suporte mobile:

1.  **Adicionar o modo Capacitor:**
    ```bash
    quasar mode add capacitor
    ```
    *Isso criará a pasta `src-capacitor` na raiz.*

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

## 📱 3. Workflow de Execução

Sempre que quiser rodar o app no dispositivo:

1.  **Sincronizar mudanças web com o nativo:**
    ```bash
    npx cap sync android
    ```
2.  **Rodar em modo Desenvolvimento (com Live Reload):**
    ```bash
    quasar dev -m capacitor -T android -- --address 0.0.0.0
    ```
    *O `--address 0.0.0.0` permite que o celular acesse o servidor do PC.*

3.  **Abrir o projeto no Android Studio:**
    ```bash
    npx cap open android
    ```

---

## 🧹 4. Manutenção de Linter

Para evitar que o Prettier aponte erros em arquivos gerados pelo build do Android, configuramos o `.prettierignore` para ignorar:
- `src-capacitor/android/app/build/`
- `src-capacitor/android/app/src/main/assets/public/`

---

## 🕵️‍♂️ 5. Dicas do Agent Sagaz

1.  **Logs no Android Studio:** Use a aba **Logcat** e filtre por `Capacitor/Console` para debugar o JavaScript como um ninja.
2.  **IP Dinâmico:** Se o seu IP mudar, você deve atualizar o arquivo `.env` e o `network_security_config.xml`.
3.  **Permissões:** Novas permissões (Câmera, Galeria) devem ser adicionadas no `AndroidManifest.xml`.

---

*Documentação atualizada conforme os requisitos da disciplina de Laboratório de Apps Híbridos e as sacadas do Agent Sagaz.*
