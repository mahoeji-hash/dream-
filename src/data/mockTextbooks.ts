import { supabase } from '../supabaseClient';

export interface ProblemItem {
  id: string | number;
  textbookId?: string;
  unitId?: string;
  title?: string;
  content: string;
  solution?: string;
  imageUrl?: string;
  solutionImageUrl?: string;
  difficulty?: string;
  created_at?: string;
}

// 1. Supabase에서 교과서/대단원 문제 목록 가져오기
export async function getStoredProblems(): Promise<ProblemItem[]> {
  try {
    const { data, error } = await supabase
      .from('textbook_problems')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('문제 목록 불러오기 실패:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('네트워크 오류:', err);
    return [];
  }
}

// 2. Supabase에 새 교과서 문제 저장하기
export async function saveStoredProblems(problem: {
  textbookId?: string;
  unitId?: string;
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
          textbook_id: problem.textbookId,
          unit_id: problem.unitId,
          title: problem.title,
          content: problem.content,
          solution: problem.solution,
          image_url: problem.imageUrl,
          solution_image_url: problem.solutionImageUrl,
          difficulty: problem.difficulty
        }
      ])
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    console.error('문제 저장 실패:', err);
    return { success: false, error: err.message };
  }
}