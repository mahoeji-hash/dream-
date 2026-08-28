import { supabase } from '../supabaseClient';

export interface CommunityQuestion {
  id: string | number;
  subject: string;
  textbook_info?: string;
  title: string;
  content: string;
  image_url?: string;
  status: string;
  answer_content?: string;
  answer_image_url?: string;
  created_at?: string;
}

export const INITIAL_QUESTIONS: CommunityQuestion[] = [];

// App.tsx에서 가져올 수 있도록 추가
export const mockCommunityQuestions: CommunityQuestion[] = INITIAL_QUESTIONS;

export async function getStoredQuestions(): Promise<CommunityQuestion[]> {
  try {
    const { data, error } = await supabase
      .from('qna_questions')
      .select('*')
      .order('id', { ascending: false });

    if (error || !Array.isArray(data)) return [];
    return data;
  } catch (err) {
    return [];
  }
}

export async function saveStoredQuestion(question: any) {
  return saveStoredQuestions(question);
}

export async function saveStoredQuestions(question: {
  subject?: string;
  textbook_info?: string;
  title: string;
  content: string;
  image_url?: string;
}) {
  try {
    const { data, error } = await supabase
      .from('qna_questions')
      .insert([
        {
          subject: question.subject || '일반',
          textbook_info: question.textbook_info || '',
          title: question.title,
          content: question.content,
          image_url: question.image_url || null,
          status: '대기중'
        }
      ])
      .select();

    if (error) {
      console.error('Q&A 저장 에러:', error);
      throw error;
    }
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function saveTeacherAnswer(questionId: number | string, answerContent: string, answerImageUrl?: string) {
  try {
    const { data, error } = await supabase
      .from('qna_questions')
      .update({
        answer_content: answerContent,
        answer_image_url: answerImageUrl || null,
        status: '답변완료'
      })
      .eq('id', questionId)
      .select();

    if (error) {
      console.error('선생님 답변 저장 에러:', error);
      throw error;
    }
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
