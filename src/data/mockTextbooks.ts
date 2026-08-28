import { supabase } from '../supabaseClient';

export interface ProblemItem {
  id?: string | number;
  big_unit?: string;
  mid_unit?: string;
  category?: string;
  title?: string;
  content: string;
  solution?: string;
  image_url?: string;
  solution_image_url?: string;
  difficulty?: string;
  created_at?: string;
}

export const TEXTBOOKS: any[] = [];

export async function getStoredProblems(): Promise<ProblemItem[]> {
  try {
    const { data, error } = await supabase
      .from('textbook_problems')
      .select('*')
      .order('id', { ascending: false });

    if (error || !Array.isArray(data)) return [];
    return data;
  } catch (err) {
    return [];
  }
}

export async function saveStoredProblems(problem: {
  bigUnit?: string;
  midUnit?: string;
  category?: string;
  title?: string;
  content: string;
  solution?: string;
  imageUrl?: string;
  solutionImageUrl?: string;
  difficulty?: string;
}) {
  try {
    const { data, error } = await supabase
      .from('textbook_problems')
      .insert([
        {
          big_unit: problem.bigUnit || '',
          mid_unit: problem.midUnit || '',
          category: problem.category || '중단원 마무리',
          title: problem.title || '',
          content: problem.content,
          solution: problem.solution || '',
          difficulty: problem.difficulty || '보통'
        }
      ])
      .select();

    if (error) {
      console.error('Supabase 저장 에러:', error);
      throw error;
    }
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}