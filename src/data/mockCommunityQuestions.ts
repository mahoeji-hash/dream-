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

// 1. Supabase에서 질문 전체 목록 가져오기
export async function getStoredQuestions(): Promise<CommunityQuestion[]> {
  try {
    const { data, error } = await supabase
      .from('qna_questions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('질문 목록 불러오기 실패:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('네트워크 오류:', err);
    return [];
  }
}

// 2. Supabase에 새 질문 등록하기
export async function saveStoredQuestion(question: {
  subject: string;
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
          subject: question.subject,
          textbook_info: question.textbook_info,
          title: question.title,
          content: question.content,
          image_url: question.image_url,
          status: '대기중'
        }
      ])
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    console.error('질문 저장 실패:', err);
    return { success: false, error: err.message };
  }
}

// 3. 선생님 답변 등록하기
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
    console.error('답변 저장 실패:', err);
    return { success: false, error: err.message };
  }
}