import { supabase } from '../supabaseClient';

export interface CommunityQuestion {
  id: string;
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

export async function getStoredQuestions(): Promise<CommunityQuestion[]> {
  try {
    const { data, error } = await supabase
      .from('qna_questions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return [];
    return data || [];
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

    if (error) throw error;
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
        answer_image_url: answerImageUrl,
        status: '답변완료'
      })
      .eq('id', questionId);

    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}