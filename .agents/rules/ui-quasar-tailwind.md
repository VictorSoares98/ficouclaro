# UI Rules: Quasar & Tailwind Integration

## 1. Responsabilidades de Tematização (Dark/Light Mode)
O Quasar é o único e soberano dono das inversões de background e cores de texto base entre Dark Mode e Light Mode.
- **NÃO** utilize prefixos utilitários de tema do Tailwind (como `tw-dark:tw-bg-dark`, `tw-dark:tw-text-white`) para textos de leitura ou containers primários.
- Deixe o Quasar propagar as cores de texto naturalmente. Quando um elemento tipográfico (`h1`, `h2`, `p`) estiver num `<q-card>` ou `<q-page>`, **não** atribua propriedades de cor a ele a menos que seja algo específico como opacidade (`tw-opacity-70`) ou semântico (`tw-text-primary`).

## 2. Superfícies (Backgrounds)
- **NÃO** crie divs customizadas com Tailwind (`<div class="tw-bg-white">`) para atuar como containers emulando cards ou janelas.
- **SEMPRE** utilize os componentes nativos do Quasar como superfícies base:
  - Utilize `<q-card>` para painéis. O `<q-card>` reage perfeitamente ao *Dark Mode* do motor do Quasar e altera para a cor apropriada sem precisar de classes Tailwind.
  - O `<q-page>` e o `body` já assumem o fundo automaticamente. Não defina `tw-bg-...` neles.

## 3. Tailwind como Refinamento
Utilize as classes com prefixo `tw-` estritamente para estruturar e embelezar:
- **Layout & Espaçamento:** `tw-flex`, `tw-grid`, `tw-p-4`, `tw-gap-4`
- **Tipografia Escalar:** `tw-text-3xl`, `tw-font-bold`, `tw-tracking-tight`
- **Efeitos e Bordas:** `tw-opacity-70`, `tw-rounded-2xl`, `tw-shadow-xl`
