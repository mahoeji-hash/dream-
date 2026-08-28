import { supabase } from '../supabaseClient';
import { SubjectType } from '../types';

export interface QuizQuestion {
  id?: string | number;
  unit_code?: string;
  questionText?: string;
  question_text?: string;
  options: string[];
  correctIndex?: number;
  correct_index?: number;
  explanation: string;
  hint?: string;
  created_at?: string;
}

export interface UnitQuiz {
  id: string;
  subject?: SubjectType;
  grade?: 'high_1';
  chapterNumber?: number;
  chapterName?: string;
  unitName?: string;
  unitCode?: string;
  badge?: string;
  estimatedMinutes?: number;
  questions: QuizQuestion[];
}

export async function getStoredUnitQuizzes(): Promise<any[]> {
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

export async function saveStoredUnitQuiz(quiz: any) {
  return saveStoredUnitQuizzes(quiz);
}

export async function saveStoredUnitQuizzes(quiz: any) {
  try {
    const { data, error } = await supabase
      .from('test_questions')
      .insert([
        {
          unit_code: quiz.unitCode || quiz.unit_code || '',
          question_text: quiz.questionText || quiz.question_text || '',
          options: quiz.options || [],
          correct_index: quiz.correctIndex ?? quiz.correct_index ?? 0,
          explanation: quiz.explanation || '',
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