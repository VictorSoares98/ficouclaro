import { supabaseClient } from '@/core/supabase/client';
import type { Database } from '@/core/types/database.types';

type Enquete = Database['public']['Tables']['enquetes']['Row'];
type EnqueteInsert = Database['public']['Tables']['enquetes']['Insert'];
type RespostaEnqueteInsert = Database['public']['Tables']['respostas_enquete']['Insert'];

export class PollService {
  async getActivePollsForSession(sessionId: string): Promise<Enquete[]> {
    const { data, error } = await supabaseClient
      .from('enquetes')
      .select('*')
      .eq('sessao_id', sessionId)
      .eq('status', 'ativa')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }

  async getAllPollsForSession(sessionId: string): Promise<Enquete[]> {
    const { data, error } = await supabaseClient
      .from('enquetes')
      .select('*')
      .eq('sessao_id', sessionId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }

  async createPoll(enquete: EnqueteInsert): Promise<Enquete> {
    const { data, error } = await supabaseClient.from('enquetes').insert(enquete).select().single();

    if (error) throw new Error(error.message);
    return data;
  }

  async activatePoll(pollId: string): Promise<void> {
    const { error } = await supabaseClient
      .from('enquetes')
      .update({ status: 'ativa' })
      .eq('id', pollId);

    if (error) throw new Error(error.message);
  }

  async closePoll(pollId: string): Promise<void> {
    const { error } = await supabaseClient
      .from('enquetes')
      .update({ status: 'encerrada', encerrada_em: new Date().toISOString() })
      .eq('id', pollId);

    if (error) throw new Error(error.message);
  }

  async submitResponse(resposta: RespostaEnqueteInsert): Promise<void> {
    const { error } = await supabaseClient.from('respostas_enquete').insert(resposta);

    if (error) {
      if (error.code === '23505') {
        throw new Error('Você já respondeu a esta enquete.');
      }
      throw new Error(error.message);
    }
  }

  async getPollResults(
    pollId: string,
  ): Promise<Database['public']['Tables']['respostas_enquete']['Row'][]> {
    const { data, error } = await supabaseClient
      .from('respostas_enquete')
      .select('*')
      .eq('enquete_id', pollId);

    if (error) throw new Error(error.message);
    return data || [];
  }
}

export const pollService = new PollService();
