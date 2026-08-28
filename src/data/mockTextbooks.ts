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

export const TEXTBOOKS: any[] = [];

export async function getStoredProblems(): Promise<ProblemItem[]> {
  try {
    const { data, error } = await supabase
      .from('textbook_problems')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !Array.isArray(data)) return [];
    return data;
  } catch (err) {
    return [];
  }
}

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
    return { success: false, error: err.message };
  }
}