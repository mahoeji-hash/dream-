import { supabase } from '../supabaseClient';

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

// 1. Supabase에서 포스터 전체 목록 가져오기
export async function getStoredInterestingFacts(): Promise<InterestingFact[]> {
  try {
    const { data, error } = await supabase
      .from('posters')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('포스터 목록 불러오기 실패:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('네트워크 오류:', err);
    return [];
  }
}

// 2. Supabase에 새 포스터 등록하기
export async function saveStoredInterestingFact(fact: {
  title: string;
  subtitle?: string;
  category: string;
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
          subtitle: fact.subtitle,
          category: fact.category,
          content: fact.content,
          tags: fact.tags,
          theme: fact.theme,
          image_url: fact.image_url,
          likes: 0
        }
      ])
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    console.error('포스터 저장 실패:', err);
    return { success: false, error: err.message };
  }
}