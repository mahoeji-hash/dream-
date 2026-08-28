import { supabase } from '../supabaseClient';
import { SubjectType } from '../types';

export interface QuizQuestion {
  id?: string | number;
  unit_code?: string;
  question_text: string;
  options: string[];
  correct_index: number;
  explanation: string;
  hint?: string;
  created_at?: string;
}

export async function getStoredUnitQuizzes(): Promise<QuizQuestion[]> {
  try {
    const { data, error } = await supabase
      .from('test_questions')
      .select('*')
      .order('id', { ascending: false });

    if (error || !Array.isArray(data)) return [];
    return data;
  } catch (err) {
    return [];
  }
}

export async function saveStoredUnitQuiz(quiz: {
  unitCode?: string;
  questionText: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  hint?: string;
}) {
  try {
    const { data, error } = await supabase
      .from('test_questions')
      .insert([
        {
          unit_code: quiz.unitCode || '',
          question_text: quiz.questionText,
          options: quiz.options,
          correct_index: quiz.correctIndex,
          explanation: quiz.explanation,
          hint: quiz.hint || ''
        }
      ])
      .select();

    if (error) {
      console.error('단원 평가 퀴즈 저장 에러:', error);
      throw error;
    }
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}