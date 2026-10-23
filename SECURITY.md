# Política de Segurança (Security Policy)

Bem-vindo ao repositório do **Ficou Claro?**. A segurança dos dados dos nossos estudantes, professores e da comunidade acadêmica é prioridade absoluta da nossa engenharia. Este documento descreve as nossas diretrizes de segurança, arquitetura defensiva e o processo oficial para reporte de vulnerabilidades.

---

## 1. Versões Suportadas

O **Ficou Claro?** encontra-se em desenvolvimento contínuo (fase MVP / Release Candidate). Aplicamos patches e correções de segurança com máxima prioridade diretamente na branch principal (`main`).

| Versão         | Suportada          |
| :------------- | :----------------- |
| `main` (Atual) | :white_check_mark: |
| Anteriores     | :x:                |

---

## 2. Como Reportar uma Vulnerabilidade (Divulgação Responsável)

Se você identificou uma vulnerabilidade de segurança nesta aplicação, **NÃO abra uma _Issue_ pública** e **NÃO** divulgue a falha em fóruns abertos ou redes sociais antes de receber nosso parecer técnico. A exposição precoce pode colocar dados acadêmicos em risco.

Envie um relatório confidencial e detalhado para:
👉 **[security@ficouclaro.app]**

Para solicitações específicas sobre conformidade com a Lei Geral de Proteção de Dados (LGPD) ou contato com o Encarregado de Dados (DPO):
👉 **[dpo@ficouclaro.app]**

### O que incluir no seu relatório:

1. **Tipo de vulnerabilidade:** (ex: Bypass de RLS, Cross-Site Scripting (XSS), escalonamento de privilégio RBAC, injeção em RPC).
2. **Gravidade estimada:** (CVSS ou classificação informal: Crítico, Alto, Médio, Baixo).
3. **Passos detalhados para reprodução:** Instruções claras, payloads utilizados ou passos de navegação.
4. **Prova de Conceito (PoC):** Capturas de tela, vídeos ou snippets de requisição HTTP (sem expor dados reais de terceiros).

Nossa equipe confirmará o recebimento em até 48 horas úteis e manterá o pesquisador informado durante a resolução.

---

## 3. Escopo de Testes (Bug Bounty & Pen-Test)

Pedimos que os testes de segurança respeitem estritamente os limites abaixo:

### ✅ Dentro do Escopo (Testes Permitidos):

- Falhas de Cross-Site Scripting (XSS) em componentes Vue/Quasar.
- Erros de lógica de negócio e bypass de controle de acesso (RBAC) nas páginas e Navigation Guards.
- Falhas ou vazamento de dados nas políticas de **Row Level Security (RLS)** do PostgreSQL/Supabase.
- Injeções ou falhas de autorização em funções RPC e triggers do banco de dados.
- Vazamento involuntário de Dados Pessoais Identificáveis (PII) em rotas ou views públicas.

### ❌ Fora do Escopo (Testes Proibidos):

- Ataques de Negação de Serviço distribuída (DDoS) contra nossa infraestrutura ou CDN (Cloudflare/Vercel).
- Engenharia social, phishing ou assédio direcionado a membros da equipe ou usuários.
- Vulnerabilidades estruturais nos servidores centrais do Supabase, AWS ou GoTrue (reporte diretamente aos provedores correspondentes).
- Uso de scanners automatizados de alta frequência que degradem o desempenho das instâncias de desenvolvimento.

---

## 4. Postura de Defesa em Profundidade (_Defense-in-Depth_)

O sistema implementa múltiplos círculos defensivos para garantir integridade e confidencialidade:

- **Zero-Direct-Access Hardening:** Usuários anônimos (`anon`) não possuem permissão de leitura sobre tabelas relacionais primárias (`grupos_estudo`, `usuarios`). O acesso a dados públicos do campus é intermediado exclusivamente por Views seguras com `security_invoker = false`.
- **Row Level Security (RLS) Hermética:** Todas as tabelas do schema `public` e `private` possuem RLS ativada com políticas restritas baseadas no UID do token JWT emitido pelo Supabase Auth.
- **Anonimato Algorítmico Unidirecional:** Votos no termômetro, enquetes e avaliações rápidas utilizam hashing HMAC-SHA256 computado exclusivamente no servidor (`private.gerar_hash_eleitor`), tornando matematicamente impossível ao docente correlacionar o voto ao aluno.
- **Isolamento de Estilização (`tw-`):** O Tailwind opera encapsulado pelo prefixo `tw-`, eliminando ataques de injeção visual ou quebra acidental de layout.
- **Filtro de Conteúdo e Moderação Integrada:** A função `private.verificar_moderacao` higieniza e intercepta termos sensíveis (CPFs, e-mails, telefones) e linguagem ofensiva antes da persistência no banco.
- **Conformidade LGPD & DSAR:** Funcionalidades de portabilidade de dados e exclusão de conta respeitam os princípios de minimização e integridade acadêmica.

---

Obrigado por contribuir para a segurança e privacidade do ambiente acadêmico do **Ficou Claro?**!
