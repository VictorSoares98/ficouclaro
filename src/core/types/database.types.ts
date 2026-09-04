/* eslint-disable */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      avaliacoes_rapidas: {
        Row: {
          comentario: string | null;
          created_at: string;
          hash_eleitor: string;
          id: string;
          nota: number;
          sessao_id: string;
        };
        Insert: {
          comentario?: string | null;
          created_at?: string;
          hash_eleitor?: string;
          id?: string;
          nota: number;
          sessao_id: string;
        };
        Update: {
          comentario?: string | null;
          created_at?: string;
          hash_eleitor?: string;
          id?: string;
          nota?: number;
          sessao_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'avaliacoes_rapidas_sessao_id_fkey';
            columns: ['sessao_id'];
            isOneToOne: false;
            referencedRelation: 'sessoes';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'avaliacoes_rapidas_sessao_id_fkey';
            columns: ['sessao_id'];
            isOneToOne: false;
            referencedRelation: 'vw_course_insights';
            referencedColumns: ['sessao_id'];
          },
        ];
      };
      disciplinas: {
        Row: {
          codigo_convite: string;
          created_at: string;
          descricao: string | null;
          id: string;
          nome: string;
          professor_id: string;
          updated_at: string;
        };
        Insert: {
          codigo_convite?: string;
          created_at?: string;
          descricao?: string | null;
          id?: string;
          nome: string;
          professor_id: string;
          updated_at?: string;
        };
        Update: {
          codigo_convite?: string;
          created_at?: string;
          descricao?: string | null;
          id?: string;
          nome?: string;
          professor_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'disciplinas_professor_id_fkey';
            columns: ['professor_id'];
            isOneToOne: false;
            referencedRelation: 'usuarios';
            referencedColumns: ['id'];
          },
        ];
      };
      duvidas: {
        Row: {
          created_at: string;
          foi_respondida: boolean;
          id: string;
          sessao_id: string;
          texto: string;
          updated_at: string;
          votos: number;
        };
        Insert: {
          created_at?: string;
          foi_respondida?: boolean;
          id?: string;
          sessao_id: string;
          texto: string;
          updated_at?: string;
          votos?: number;
        };
        Update: {
          created_at?: string;
          foi_respondida?: boolean;
          id?: string;
          sessao_id?: string;
          texto?: string;
          updated_at?: string;
          votos?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'duvidas_sessao_id_fkey';
            columns: ['sessao_id'];
            isOneToOne: false;
            referencedRelation: 'sessoes';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'duvidas_sessao_id_fkey';
            columns: ['sessao_id'];
            isOneToOne: false;
            referencedRelation: 'vw_course_insights';
            referencedColumns: ['sessao_id'];
          },
        ];
      };
      enquetes: {
        Row: {
          created_at: string;
          encerrada_em: string | null;
          id: string;
          opcoes: Json | null;
          pergunta: string;
          sessao_id: string;
          status: Database['public']['Enums']['status_enquete'];
          tipo: Database['public']['Enums']['tipo_enquete'];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          encerrada_em?: string | null;
          id?: string;
          opcoes?: Json | null;
          pergunta: string;
          sessao_id: string;
          status?: Database['public']['Enums']['status_enquete'];
          tipo: Database['public']['Enums']['tipo_enquete'];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          encerrada_em?: string | null;
          id?: string;
          opcoes?: Json | null;
          pergunta?: string;
          sessao_id?: string;
          status?: Database['public']['Enums']['status_enquete'];
          tipo?: Database['public']['Enums']['tipo_enquete'];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'enquetes_sessao_id_fkey';
            columns: ['sessao_id'];
            isOneToOne: false;
            referencedRelation: 'sessoes';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'enquetes_sessao_id_fkey';
            columns: ['sessao_id'];
            isOneToOne: false;
            referencedRelation: 'vw_course_insights';
            referencedColumns: ['sessao_id'];
          },
        ];
      };
      matriculas: {
        Row: {
          aluno_id: string;
          created_at: string;
          disciplina_id: string;
          id: string;
        };
        Insert: {
          aluno_id: string;
          created_at?: string;
          disciplina_id: string;
          id?: string;
        };
        Update: {
          aluno_id?: string;
          created_at?: string;
          disciplina_id?: string;
          id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'matriculas_aluno_id_fkey';
            columns: ['aluno_id'];
            isOneToOne: false;
            referencedRelation: 'usuarios';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'matriculas_disciplina_id_fkey';
            columns: ['disciplina_id'];
            isOneToOne: false;
            referencedRelation: 'disciplinas';
            referencedColumns: ['id'];
          },
        ];
      };
      respostas_enquete: {
        Row: {
          created_at: string;
          enquete_id: string;
          hash_eleitor: string;
          id: string;
          resposta: Json;
        };
        Insert: {
          created_at?: string;
          enquete_id: string;
          hash_eleitor?: string;
          id?: string;
          resposta: Json;
        };
        Update: {
          created_at?: string;
          enquete_id?: string;
          hash_eleitor?: string;
          id?: string;
          resposta?: Json;
        };
        Relationships: [
          {
            foreignKeyName: 'respostas_enquete_enquete_id_fkey';
            columns: ['enquete_id'];
            isOneToOne: false;
            referencedRelation: 'enquetes';
            referencedColumns: ['id'];
          },
        ];
      };
      sessoes: {
        Row: {
          created_at: string;
          disciplina_id: string;
          encerrada_em: string | null;
          id: string;
          iniciada_em: string | null;
          professor_id: string;
          status: Database['public']['Enums']['status_sessao'];
          topico: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          disciplina_id: string;
          encerrada_em?: string | null;
          id?: string;
          iniciada_em?: string | null;
          professor_id: string;
          status?: Database['public']['Enums']['status_sessao'];
          topico?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          disciplina_id?: string;
          encerrada_em?: string | null;
          id?: string;
          iniciada_em?: string | null;
          professor_id?: string;
          status?: Database['public']['Enums']['status_sessao'];
          topico?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'sessoes_disciplina_id_fkey';
            columns: ['disciplina_id'];
            isOneToOne: false;
            referencedRelation: 'disciplinas';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'sessoes_professor_id_fkey';
            columns: ['professor_id'];
            isOneToOne: false;
            referencedRelation: 'usuarios';
            referencedColumns: ['id'];
          },
        ];
      };
      sinais_ritmo: {
        Row: {
          created_at: string;
          id: string;
          sessao_id: string;
          sinal: Database['public']['Enums']['sinal_ritmo'];
        };
        Insert: {
          created_at?: string;
          id?: string;
          sessao_id: string;
          sinal: Database['public']['Enums']['sinal_ritmo'];
        };
        Update: {
          created_at?: string;
          id?: string;
          sessao_id?: string;
          sinal?: Database['public']['Enums']['sinal_ritmo'];
        };
        Relationships: [
          {
            foreignKeyName: 'sinais_ritmo_sessao_id_fkey';
            columns: ['sessao_id'];
            isOneToOne: false;
            referencedRelation: 'sessoes';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'sinais_ritmo_sessao_id_fkey';
            columns: ['sessao_id'];
            isOneToOne: false;
            referencedRelation: 'vw_course_insights';
            referencedColumns: ['sessao_id'];
          },
        ];
      };
      usuarios: {
        Row: {
          created_at: string;
          id: string;
          nome_completo: string | null;
          papel: Database['public']['Enums']['papel_usuario'];
          updated_at: string;
          url_avatar: string | null;
        };
        Insert: {
          created_at?: string;
          id: string;
          nome_completo?: string | null;
          papel?: Database['public']['Enums']['papel_usuario'];
          updated_at?: string;
          url_avatar?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          nome_completo?: string | null;
          papel?: Database['public']['Enums']['papel_usuario'];
          updated_at?: string;
          url_avatar?: string | null;
        };
        Relationships: [];
      };
      votos_duvida: {
        Row: {
          created_at: string;
          duvida_id: string;
          hash_eleitor: string;
          id: string;
        };
        Insert: {
          created_at?: string;
          duvida_id: string;
          hash_eleitor: string;
          id?: string;
        };
        Update: {
          created_at?: string;
          duvida_id?: string;
          hash_eleitor?: string;
          id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'votos_duvida_duvida_id_fkey';
            columns: ['duvida_id'];
            isOneToOne: false;
            referencedRelation: 'duvidas';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      vw_course_insights: {
        Row: {
          disciplina_id: string | null;
          iniciada_em: string | null;
          media_estrelas: number | null;
          sessao_id: string | null;
          status: Database['public']['Enums']['status_sessao'] | null;
          topico: string | null;
          total_avaliacoes: number | null;
          total_duvidas: number | null;
          total_enquetes: number | null;
          total_sinais: number | null;
        };
        Insert: {
          disciplina_id?: string | null;
          iniciada_em?: string | null;
          media_estrelas?: never;
          sessao_id?: string | null;
          status?: Database['public']['Enums']['status_sessao'] | null;
          topico?: string | null;
          total_avaliacoes?: never;
          total_duvidas?: never;
          total_enquetes?: never;
          total_sinais?: never;
        };
        Update: {
          disciplina_id?: string | null;
          iniciada_em?: string | null;
          media_estrelas?: never;
          sessao_id?: string | null;
          status?: Database['public']['Enums']['status_sessao'] | null;
          topico?: string | null;
          total_avaliacoes?: never;
          total_duvidas?: never;
          total_enquetes?: never;
          total_sinais?: never;
        };
        Relationships: [
          {
            foreignKeyName: 'sessoes_disciplina_id_fkey';
            columns: ['disciplina_id'];
            isOneToOne: false;
            referencedRelation: 'disciplinas';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Functions: {
      delete_own_account: { Args: never; Returns: undefined };
      esta_matriculado: { Args: { p_disciplina_id: string }; Returns: boolean };
      get_course_insights: {
        Args: { p_disciplina_id: string };
        Returns: {
          disciplina_id: string;
          iniciada_em: string;
          media_estrelas: number;
          sessao_id: string;
          status: Database['public']['Enums']['status_sessao'];
          topico: string;
          total_avaliacoes: number;
          total_duvidas: number;
          total_enquetes: number;
          total_sinais: number;
        }[];
      };
      obter_meu_papel: {
        Args: never;
        Returns: Database['public']['Enums']['papel_usuario'];
      };
      get_thermometer_stats: {
        Args: { p_sessao_id: string };
        Returns: {
          muito_rapido: number;
          boiando: number;
          tudo_certo: number;
          muito_devagar: number;
        }[];
      };
      submit_poll_vote: {
        Args: { p_enquete_id: string; p_resposta: Json };
        Returns: undefined;
      };
      submit_qa_upvote: {
        Args: { p_duvida_id: string };
        Returns: undefined;
      };
      submit_flash_review: {
        Args: { p_sessao_id: string; p_nota: number; p_comentario: string | null };
        Returns: undefined;
      };
    };
    Enums: {
      papel_usuario: 'aluno' | 'professor';
      sinal_ritmo: 'muito_rapido' | 'boiando' | 'tudo_certo' | 'muito_devagar';
      status_enquete: 'rascunho' | 'ativa' | 'encerrada';
      status_sessao: 'aguardando' | 'ativa' | 'encerrada';
      tipo_enquete: 'multipla_escolha' | 'nuvem_palavras' | 'escala_clareza' | 'ranking';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema['CompositeTypes'] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      papel_usuario: ['aluno', 'professor'],
      sinal_ritmo: ['muito_rapido', 'boiando', 'tudo_certo', 'muito_devagar'],
      status_enquete: ['rascunho', 'ativa', 'encerrada'],
      status_sessao: ['aguardando', 'ativa', 'encerrada'],
      tipo_enquete: ['multipla_escolha', 'nuvem_palavras', 'escala_clareza', 'ranking'],
    },
  },
} as const;
