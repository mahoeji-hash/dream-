import { supabase } from '../../supabaseClient';

export interface InterestingFact {
  id: string | number;
  title: string;
  subtitle?: string;
  category: string;
  content: string;
  tags?: string;
  theme?: string;
  likes?: number;
  image_url?: string;
  created_at?: string;
}

export async function getStoredInterestingFacts(): Promise<InterestingFact[]> {
  try {
    const { data, error } = await supabase
      .from('posters')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !Array.isArray(data)) return [];
    return data;
  } catch (err) {
    return [];
  }
}

export async function saveStoredInterestingFact(fact: any) {
  return saveStoredInterestingFacts(fact);
}

export async function saveStoredInterestingFacts(fact: {
  title: string;
  subtitle?: string;
  category?: string;
  content: string;
  tags?: string;
  theme?: string;
  image_url?: string;
}) {
  try {
    const { data, error } = await supabase
      .from('posters')
      .insert([
        {
          title: fact.title,
          subtitle: fact.subtitle || '',
          category: fact.category || '일반',
          content: fact.content,
          tags: fact.tags || '',
          theme: fact.theme || '',
          image_url: fact.image_url || null,
          likes: 0
        }
      ])
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}