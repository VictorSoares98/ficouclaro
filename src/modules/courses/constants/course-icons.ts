export interface CourseIconOption {
  label: string;
  value: string;
  icon: string;
  category:
    | 'Geral'
    | 'Exatas & Engenharia'
    | 'Saúde & Biológicas'
    | 'Tecnologia & Dados'
    | 'Humanas & Sociais'
    | 'Linguagens & Artes';
}

export const COURSE_ICONS: readonly CourseIconOption[] = [
  // 1. Geral & Ensino
  { label: 'Geral / Institucional', value: 'school', icon: 'school', category: 'Geral' },
  { label: 'Ementa / Livros', value: 'menu_book', icon: 'menu_book', category: 'Geral' },
  {
    label: 'Pesquisa / Metodologia',
    value: 'auto_stories',
    icon: 'auto_stories',
    category: 'Geral',
  },

  // 2. Exatas & Engenharia
  {
    label: 'Matemática & Cálculo',
    value: 'calculate',
    icon: 'calculate',
    category: 'Exatas & Engenharia',
  },
  {
    label: 'Álgebra & Funções',
    value: 'functions',
    icon: 'functions',
    category: 'Exatas & Engenharia',
  },
  {
    label: 'Engenharia Geral',
    value: 'engineering',
    icon: 'engineering',
    category: 'Exatas & Engenharia',
  },
  {
    label: 'Arquitetura & Urbanismo',
    value: 'architecture',
    icon: 'architecture',
    category: 'Exatas & Engenharia',
  },
  {
    label: 'Produção & Mecânica',
    value: 'precision_manufacturing',
    icon: 'precision_manufacturing',
    category: 'Exatas & Engenharia',
  },

  // 3. Saúde & Biológicas
  {
    label: 'Medicina & Enfermagem',
    value: 'medical_services',
    icon: 'medical_services',
    category: 'Saúde & Biológicas',
  },
  {
    label: 'Laboratório & Ciências',
    value: 'science',
    icon: 'science',
    category: 'Saúde & Biológicas',
  },
  {
    label: 'Biotecnologia & Farmácia',
    value: 'biotech',
    icon: 'biotech',
    category: 'Saúde & Biológicas',
  },
  {
    label: 'Psicologia & Mente',
    value: 'psychology',
    icon: 'psychology',
    category: 'Saúde & Biológicas',
  },

  // 4. Tecnologia & Dados
  { label: 'Tecnologia & TI', value: 'computer', icon: 'computer', category: 'Tecnologia & Dados' },
  {
    label: 'Programação & Código',
    value: 'terminal',
    icon: 'terminal',
    category: 'Tecnologia & Dados',
  },
  {
    label: 'Estatística & Analytics',
    value: 'analytics',
    icon: 'analytics',
    category: 'Tecnologia & Dados',
  },
  {
    label: 'Hardware & Circuitos',
    value: 'memory',
    icon: 'memory',
    category: 'Tecnologia & Dados',
  },

  // 5. Humanas, Sociais & Negócios
  { label: 'Direito & Legislação', value: 'gavel', icon: 'gavel', category: 'Humanas & Sociais' },
  {
    label: 'História & Filosofia',
    value: 'history_edu',
    icon: 'history_edu',
    category: 'Humanas & Sociais',
  },
  {
    label: 'Administração & Gestão',
    value: 'business_center',
    icon: 'business_center',
    category: 'Humanas & Sociais',
  },
  {
    label: 'Economia & Finanças',
    value: 'payments',
    icon: 'payments',
    category: 'Humanas & Sociais',
  },
  {
    label: 'Sociedade & Geografia',
    value: 'public',
    icon: 'public',
    category: 'Humanas & Sociais',
  },

  // 6. Linguagens, Artes & Comunicação
  { label: 'Artes & Design', value: 'palette', icon: 'palette', category: 'Linguagens & Artes' },
  {
    label: 'Letras & Idiomas',
    value: 'translate',
    icon: 'translate',
    category: 'Linguagens & Artes',
  },
  {
    label: 'Comunicação & Mídia',
    value: 'record_voice_over',
    icon: 'record_voice_over',
    category: 'Linguagens & Artes',
  },
  {
    label: 'Educação Física & Esportes',
    value: 'sports_soccer',
    icon: 'sports_soccer',
    category: 'Linguagens & Artes',
  },
] as const;
