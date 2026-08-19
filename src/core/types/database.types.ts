export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

// Interface genérica para ser substituída posteriormente pelo comando do Supabase CLI
export interface Database {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
