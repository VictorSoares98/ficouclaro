# Identidade do Projeto

- **Nome:** Ficou Claro?
- **Objetivo:** Permitir que alunos avaliem a didática dos docentes e interajam de forma anônima e em tempo real, gerando dados instantâneos para a melhoria contínua da aula.

# Contexto

- **Público-alvo Principal:** Alunos universitários.
- **Público-alvo Secundário:** Professores (que utilizam os dados para ajustar a aula).

### Funcionalidades Principais

Para garantir o engajamento dos alunos e fornecer dados úteis aos professores, o aplicativo conta com 5 funcionalidades centrais, inspiradas em plataformas de interação em tempo real (como Kahoot e Wooclap):

1. **Enquetes e Interações em Tempo Real (Check-in Didático):**
   O professor pode lançar um rápido "Ficou Claro?" durante a aula. Os alunos respondem no app através de:
   - _Múltipla escolha:_ Para testar a compreensão de um conceito.
   - _Nuvem de palavras:_ Para resumir o que entenderam do tópico.
   - _Escalas de clareza:_ (Ex: 1 a 5, quão claro foi esse último bloco da aula?).
   - _Rankings:_ Para priorizar quais tópicos devem ser revisados.

2. **Termômetro de Ritmo da Aula (Feedback Contínuo):**
   Uma tela sempre ativa no app do aluno com botões rápidos e visuais (Ex: "Muito Rápido 🐇", "Estou Boiando 🐢", "Tudo Certo 👍"). O professor visualiza em seu painel um termômetro ou gráfico atualizado ao vivo, permitindo que ele desacelere ou avance conforme o clima da sala, sem que nenhum aluno precise levantar a mão e se expor.

3. **Painel de Dúvidas com Upvote (Q&A Dinâmico):**
   Para combater a vergonha de perguntar, os alunos podem enviar dúvidas textuais de forma 100% anônima. A própria turma visualiza as dúvidas e dá "Upvote" (curtida) nas perguntas que também têm. O professor foca em responder as dúvidas mais votadas pela sala.

4. **Avaliação Flash Pós-Aula:**
   Ao final da transmissão/aula, o app envia um alerta de 10 segundos para o aluno avaliar o desempenho geral do dia (ex: nota de 1 a 5 estrelas) e deixar um comentário construtivo opcional. Isso cria um histórico de evolução da disciplina.

5. **🌟 DIFERENCIAL: Dashboard de Insights e Heatmap Didático (Para o Professor):**
   Enquanto a maioria dos apps apenas exibe a nota final, o "Ficou Claro?" entrega um relatório inteligente. Ele cruza as enquetes, o termômetro e as avaliações flash para criar um "Mapa de Calor" do semestre. O professor consegue ver exatamente em quais aulas, ou até em quais minutos da aula, a turma teve mais dificuldade, ajudando-o a reformular seu plano de ensino de forma cirúrgica para o semestre seguinte.

# Tecnologia & Equipe

Este projeto foi desenhado para ser uma aplicação híbrida (rodando em web e mobile com a mesma base de código), focada em alta interatividade e baixo custo de infraestrutura inicial. As tecnologias escolhidas foram:

- **Front-end & Mobile:**
  - **Quasar.js:** Framework Vue para criação da interface unificada, responsiva e com componentes prontos para mobile.
  - **TypeScript:** Tipagem estática para garantir maior manutenibilidade e redução de erros no código.
  - **Capacitor:** Responsável por empacotar a aplicação web e entregá-la como um aplicativo nativo (iOS e Android).

- **Back-end & Banco de Dados:**
  - **Supabase (BaaS):** Utilizado em seu plano gratuito para fornecer banco de dados relacional (PostgreSQL) e autenticação. O grande diferencial desta escolha é o uso nativo das **Realtime subscriptions**, que permitem a atualização instantânea do termômetro de aula, painel de dúvidas e enquetes sem a necessidade de infraestrutura complexa de WebSockets.

- **Equipe:** Victor Soares
