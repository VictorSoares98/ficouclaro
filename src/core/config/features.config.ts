export type FeatureSlug = 'termometro' | 'qa' | 'enquetes' | 'analytics';

export interface FeatureMetric {
  value: string;
  label: string;
  description: string;
}

export interface FeatureBenefit {
  icon: string;
  title: string;
  description: string;
}

export interface FeatureFaq {
  question: string;
  answer: string;
}

export interface FeatureDetail {
  slug: FeatureSlug;
  title: string;
  badge: string;
  icon: string;
  accentColor: 'primary' | 'secondary' | 'warning' | 'accent' | 'positive';
  headline: string;
  shortDescription: string;
  problemStatement: string;
  solutionDetails: string;
  metrics: FeatureMetric[];
  professorBenefits: FeatureBenefit[];
  studentBenefits: FeatureBenefit[];
  faqs: FeatureFaq[];
  interactiveType: 'thermometer' | 'qa' | 'poll' | 'analytics';
}

export const FEATURES_CONFIG: Record<FeatureSlug, FeatureDetail> = {
  termometro: {
    slug: 'termometro',
    title: 'Termômetro da Aula ao Vivo',
    badge: 'Feedback em Tempo Real',
    icon: 'speed',
    accentColor: 'primary',
    headline: 'O fim definitivo do silêncio constrangedor na sala de aula.',
    shortDescription:
      'Os estudantes comunicam o ritmo da explicação sem interrupções verbais ou exposição social, permitindo calibração didática instantânea.',
    problemStatement:
      'Em aulas com dezenas de estudantes, o clássico "Todos entenderam?" gera silêncio absoluto por medo de julgamento entre colegas. As lacunas de aprendizagem só são descobertas semanas depois, no dia da prova.',
    solutionDetails:
      'Com apenas 3 reações anônimas (Devagar, Ficou Claro, Muito Rápido), os alunos informam seu nível de assimilação em tempo real. O painel do professor exibe a temperatura cognitiva da turma sem expor ninguém.',
    metrics: [
      {
        value: '4x+',
        label: 'Mais Participação',
        description: 'Alunos tímidos passam a participar ativamente das aulas.',
      },
      {
        value: '0s',
        label: 'Atraso no Feedback',
        description: 'Ajuste imediato antes de passar para o próximo tópico.',
      },
      {
        value: '100%',
        label: 'Anonimato Seguro',
        description: 'Impossível rastrear quem enviou o sinal de desaceleração.',
      },
    ],
    professorBenefits: [
      {
        icon: 'tune',
        title: 'Calibração da Velocidade',
        description:
          'Saiba com exatidão se o ritmo da explicação está acelerado para a maioria da turma antes de prosseguir.',
      },
      {
        icon: 'psychology',
        title: 'Detecção de Tópicos Críticos',
        description:
          'Identifique os pontos exatos da ementa onde a compreensão cai e demande exemplos extras.',
      },
    ],
    studentBenefits: [
      {
        icon: 'visibility_off',
        title: 'Zero Julgamento Social',
        description:
          'Sinalize que não entendeu sem precisar levantar a mão ou falar na frente de 60 colegas.',
      },
      {
        icon: 'touch_app',
        title: 'Interação sem Fricção',
        description:
          'Apenas um toque no celular, sem login obrigatório para sinalização e sem download de apps.',
      },
    ],
    faqs: [
      {
        question: 'O professor consegue ver qual aluno clicou em "Devagar"?',
        answer:
          'Não. O sistema agrega todos os sinais de forma estatística no banco de dados. Nenhum identificador pessoal ou ID de usuário é associado ao sinal de ritmo, assegurando conformidade com a LGPD.',
      },
      {
        question: 'É necessário baixar algum aplicativo para usar o termômetro?',
        answer:
          'Não. O aluno simplesmente escaneia o QR Code na projeção da sala ou digita o PIN no navegador de qualquer smartphone ou notebook.',
      },
    ],
    interactiveType: 'thermometer',
  },
  qa: {
    slug: 'qa',
    title: 'Q&A Anônimo com Upvoting',
    badge: 'Votação Democrática',
    icon: 'question_answer',
    accentColor: 'secondary',
    headline: 'As melhores perguntas da turma ganham destaque natural.',
    shortDescription:
      'Perguntas enviadas anonimamente e ordenadas por relevância com base nos votos dos próprios colegas de classe.',
    problemStatement:
      'Muitos estudantes deixam de tirar dúvidas por vergonha ou por acharem que a sua pergunta é básica demais. Enquanto isso, o professor gasta tempo com interrupções desconexas.',
    solutionDetails:
      'Estudantes enviam dúvidas em texto sem exibir seu nome. Outros colegas que têm a mesma dúvida clicam em "+1", fazendo as perguntas mais recorrentes subirem para o topo da lista do professor.',
    metrics: [
      {
        value: '70%',
        label: 'Menos Repetições',
        description: 'Dúvidas compartilhadas são unificadas por votos.',
      },
      {
        value: '1 clique',
        label: 'Upvote Instantâneo',
        description: 'Priorização colaborativa pelas necessidades reais da turma.',
      },
      {
        value: 'LGPD',
        label: 'Privacidade Nativa',
        description: 'Autor e votantes permanecem inteiramente anônimos.',
      },
    ],
    professorBenefits: [
      {
        icon: 'vertical_align_top',
        title: 'Priorização Clara',
        description:
          'Responda primeiro ao que mais alunos querem saber, economizando tempo didático precioso.',
      },
      {
        icon: 'fact_check',
        title: 'Dúvidas Marcadas como Respondidas',
        description:
          'Mantenha o painel limpo arquivando as perguntas já esclarecidas durante a exposição.',
      },
    ],
    studentBenefits: [
      {
        icon: 'favorite_border',
        title: 'Validação Coletiva',
        description:
          'Veja que outros colegas compartilham da mesma dúvida ao receber upvotes imediatos.',
      },
      {
        icon: 'chat_bubble_outline',
        title: 'Expressão Sem Barreiras',
        description:
          'Faça perguntas complexas com calma, escrevendo diretamente no seu dispositivo.',
      },
    ],
    faqs: [
      {
        question: 'Existe moderação contra termos ofensivos no Q&A?',
        answer:
          'Sim. O professor possui controle em tempo real para ocultar ou deletar perguntas inadequadas diretamente no seu painel de controle da sala.',
      },
      {
        question: 'Posso votar mais de uma vez na mesma pergunta?',
        answer:
          'Não. O sistema registra a assinatura do dispositivo e previne votos duplicados na mesma questão.',
      },
    ],
    interactiveType: 'qa',
  },
  enquetes: {
    slug: 'enquetes',
    title: 'Enquetes & Quizzes Relâmpago',
    badge: 'Avaliação Formativa',
    icon: 'poll',
    accentColor: 'warning',
    headline: 'Verificação instantânea de fixação em segundos.',
    shortDescription:
      'Lance perguntas objetivas durante a explicação e veja a distribuição das respostas em gráficos vivos.',
    problemStatement:
      'Muitas vezes o docente presume que a turma assimilou uma demonstração teórica complexa, para só descobrir o fracasso na nota da avaliação bimestral.',
    solutionDetails:
      'Em menos de 10 segundos, o professor cria ou seleciona uma enquete de múltipla escolha. A turma responde simultaneamente e os gráficos mostram instantaneamente o percentual de acertos.',
    metrics: [
      {
        value: '10s',
        label: 'Criação Rápida',
        description: 'Interface simplificada para não interromper a linha de raciocínio.',
      },
      {
        value: '100%',
        label: 'Gráficos ao Vivo',
        description: 'Barras percentuais animadas geradas via ECharts.',
      },
      {
        value: '0 burocracia',
        label: 'Sem Papel',
        description: 'Substitui listas físicas e testes demorados de checagem.',
      },
    ],
    professorBenefits: [
      {
        icon: 'bar_chart',
        title: 'Visão Panorâmica da Turma',
        description:
          'Identifique em segundos qual alternativa incorreta atraiu mais estudantes e explique o equívoco.',
      },
      {
        icon: 'timer',
        title: 'Encerramento Flexível',
        description:
          'Abra e feche o tempo de resposta a qualquer momento com apenas um clique de controle.',
      },
    ],
    studentBenefits: [
      {
        icon: 'task_alt',
        title: 'Autoavaliação Imediata',
        description:
          'Teste sua compreensão em tempo real e compare seu raciocínio com a média da sala.',
      },
      {
        icon: 'sentiment_satisfied_alt',
        title: 'Gamificação Leve',
        description: 'Aprenda errando sem a penalização punitiva de notas formais de boletim.',
      },
    ],
    faqs: [
      {
        question: 'As enquetes valem nota no sistema?',
        answer:
          'O Ficou Claro é voltado primariamente para avaliação formativa (diagnóstica). O professor pode usar os dados como métrica de engajamento, mas o foco é a calibração do aprendizado.',
      },
      {
        question: 'Os alunos conseguem ver o gráfico antes de responderem?',
        answer:
          'Não. O resultado parcial fica oculto para o aluno até que ele envie seu voto ou o professor decida revelar o resultado na projeção da sala.',
      },
    ],
    interactiveType: 'poll',
  },
  analytics: {
    slug: 'analytics',
    title: 'Analytics Pedagógico $0 AI',
    badge: 'Arquitetura $0 AI & Privacidade',
    icon: 'insights',
    accentColor: 'accent',
    headline: 'Diagnósticos acionáveis da aula sem gastar nada com APIs de IA.',
    shortDescription:
      'Geração de relatórios e mapas de calor de engajamento através de modelos WebAssembly e heurísticas matemáticas locais.',
    problemStatement:
      'Plataformas convencionais cobram planos corporativos caríssimos para repassar custos de APIs externas de LLMs, além de enviarem dados acadêmicos sensíveis para servidores de terceiros.',
    solutionDetails:
      'Adotamos a diretriz ADR-008 ($0 AI): relatórios preditivos de retenção, cálculo de ritmo médio e recomendações didáticas são processados diretamente no navegador do professor a custo zero.',
    metrics: [
      {
        value: 'R$ 0',
        label: 'Custo de Servidor/IA',
        description: 'Processamento local via Heurística e WebAssembly.',
      },
      {
        value: '100%',
        label: 'Privacidade LGPD',
        description: 'Nenhum dado pessoal sai do domínio da aplicação.',
      },
      {
        value: 'Instantâneo',
        label: 'Geração de Insights',
        description: 'Sem filas de espera de processamento em nuvem.',
      },
    ],
    professorBenefits: [
      {
        icon: 'auto_graph',
        title: 'Evolução Histórica da Turma',
        description:
          'Compare a receptividade da turma ao longo dos semestres e identifique matérias que exigem mais aulas práticas.',
      },
      {
        icon: 'tips_and_updates',
        title: 'Recomendações Didáticas',
        description:
          'O sistema sugere quando introduzir pausas ativas ou quizzes com base nas oscilações do termômetro.',
      },
    ],
    studentBenefits: [
      {
        icon: 'verified_user',
        title: 'Garantia de Não-Vigilância',
        description:
          'Nenhum algoritmo invasivo de reconhecimento facial ou espionagem de câmera é utilizado.',
      },
      {
        icon: 'trending_up',
        title: 'Aulas em Melhoria Contínua',
        description:
          'O conteúdo do curso evolui organicamente a cada aula graças aos dados agregados.',
      },
    ],
    faqs: [
      {
        question: 'O que significa a sigla $0 AI no Ficou Claro?',
        answer:
          'Significa que não utilizamos APIs pagas de terceiros (como OpenAI ou Google Cloud AI) no backend. Toda inteligência preditiva é gerada localmente por heurística estatística no cliente, garantindo sustentabilidade financeira perpétua e privacidade total.',
      },
      {
        question: 'O professor pode exportar os relatórios em PDF ou CSV?',
        answer:
          'Sim. O painel disponibiliza exportação de dados agregados da disciplina para comprovação de atividades de extensão ou relatórios acadêmicos de IES.',
      },
    ],
    interactiveType: 'analytics',
  },
};

export function getFeatureBySlug(slug: string): FeatureDetail | undefined {
  if (slug in FEATURES_CONFIG) {
    return FEATURES_CONFIG[slug as FeatureSlug];
  }
  return undefined;
}

export const FEATURE_SLUGS: FeatureSlug[] = ['termometro', 'qa', 'enquetes', 'analytics'];
