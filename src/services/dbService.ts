import { supabase } from '../supabaseClient';

// ==========================================
// 1. 교과서 문제 (Textbook Problems) DB 연동
// ==========================================

// 교과서 문제 DB 저장
export async function dbSaveTextbookProblem(problem: any) {
  const { data, error } = await supabase.from('textbook_problems').insert([
    {
      textbook_id: problem.textbookId || '',
      subject: problem.subject || '',
      grade: problem.grade || '',
      chapter: problem.chapter || '',
      unit_number: problem.unitNumber || '',
      unit_name: problem.unitName || '',
      sub_unit_id: problem.subUnitId || '',
      unit_code: problem.unitCode || '',
      page_number: problem.pageNumber || 1,
      problem_number: problem.problemNumber || '',
      problem_type: problem.problemType || '',
      difficulty: problem.difficulty || '보통',
      problem_text: problem.problemText || '',
      solution_steps: problem.solutionSteps || [],
      final_answer: problem.finalAnswer || '',
      core_concepts: problem.coreConcepts || [],
      dream_tip: problem.dreamTip || '',
      solution_image: problem.solutionImage || null,
      views: problem.views || 1,
      likes: problem.likes || 0,
    },
  ]).select();

  if (error) {
    console.error('교과서 문제 DB 저장 오류:', error);
    return { success: false, error: error.message };
  }
  return { success: true, data };
}

// 교과서 문제 DB 불러오기
export async function dbFetchTextbookProblems() {
  const { data, error } = await supabase
    .from('textbook_problems')
    .select('*')
    .order('id', { ascending: false });

  if (error) {
    console.error('교과서 문제 DB 불러오기 오류:', error);
    return [];
  }
  return data || [];
}

// ==========================================
// 2. Q&A 게시판 (QnA Questions) DB 연동
// ==========================================

// Q&A 질문 DB 저장
export async function dbSaveQnaQuestion(qna: {
  userName: string;
  title: string;
  content: string;
  subject: string;
  imageUrl?: string;
}) {
  const { data, error } = await supabase.from('qna_questions').insert([
    {
      user_name: qna.userName,
      title: qna.title,
      content: qna.content,
      subject: qna.subject,
      status: '답변대기',
      image_url: qna.imageUrl || '',
    },
  ]).select();

  if (error) {
    console.error('Q&A 저장 오류:', error);
    return { success: false, error: error.message };
  }
  return { success: true, data };
}

// Q&A 질문 목록 DB 불러오기
export async function dbFetchQnaQuestions() {
  const { data, error } = await supabase
    .from('qna_questions')
    .select('*')
    .order('id', { ascending: false });

  if (error) {
    console.error('Q&A 불러오기 오류:', error);
    return [];
  }
  return data || [];
}

// Q&A 답변 DB 업데이트
export async function dbUpdateQnaAnswer(id: number, answerContent: string) {
  const { data, error } = await supabase
    .from('qna_questions')
    .update({
      answer_content: answerContent,
      status: '답변완료',
    })
    .eq('id', id)
    .select();

  if (error) {
    console.error('Q&A 답변 저장 오류:', error);
    return { success: false, error: error.message };
  }
  return { success: true, data };
}

// ==========================================
// 3. 포스터 / 게시글 (Posters) DB 연동
// ==========================================

// 포스터 DB 저장
export async function dbSavePoster(poster: {
  title: string;
  content: string;
  imageUrl?: string;
  author?: string;
  category?: string;
}) {
  const { data, error } = await supabase.from('posters').insert([
    {
      title: poster.title,
      content: poster.content,
      image_url: poster.imageUrl || '',
      author: poster.author || '관리자',
      category: poster.category || '일반',
    },
  ]).select();

  if (error) {
    console.error('포스터 DB 저장 오류:', error);
    return { success: false, error: error.message };
  }
  return { success: true, data };
}

// 포스터 목록 DB 불러오기
export async function dbFetchPosters() {
  const { data, error } = await supabase
    .from('posters')
    .select('*')
    .order('id', { ascending: false });

  if (error) {
    console.error('포스터 불러오기 오류:', error);
    return [];
  }
  return data || [];
}

// ==========================================
// 4. 단원평가 문제 (Test Questions) DB 연동
// ==========================================

// 단원평가 문제 DB 저장
export async function dbSaveTestQuestion(test: {
  subject: string;
  unitCode: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}) {
  const { data, error } = await supabase.from('test_questions').insert([
    {
      subject: test.subject,
      unit_code: test.unitCode,
      question_text: test.questionText,
      options: test.options,
      correct_answer: test.correctAnswer,
      explanation: test.explanation,
    },
  ]).select();

  if (error) {
    console.error('단원평가 DB 저장 오류:', error);
    return { success: false, error: error.message };
  }
  return { success: true, data };
}

// 단원평가 문제 DB 불러오기
export async function dbFetchTestQuestions() {
  const { data, error } = await supabase
    .from('test_questions')
    .select('*')
    .order('id', { ascending: false });

  if (error) {
    console.error('단원평가 불러오기 오류:', error);
    return [];
  }
  return data || [];
}

// ==========================================
// 5. 교과서 문제 DB 연동 (Textbook Questions)
// ==========================================

export interface TextbookQuestionInput {
  subject: 'math' | 'science';
  textbookName: string;
  publisher?: string;
  unitCode: string;
  unitName?: string;
  pageNumber?: number;
  problemNumber?: number;
  title: string;
  questionText: string;
  imageUrl?: string;
  solutionSteps?: Array<{
    stepNumber: number;
    title: string;
    explanation: string;
    formulaOrKey?: string;
  }>;
  finalAnswer?: string;
  teacherTip?: string;
}

// 교과서 문제 DB 저장
export async function dbSaveTextbookQuestion(item: TextbookQuestionInput) {
  const { data, error } = await supabase.from('textbook_questions').insert([
    {
      subject: item.subject,
      textbook_name: item.textbookName,
      publisher: item.publisher,
      unit_code: item.unitCode,
      unit_name: item.unitName,
      page_number: item.pageNumber,
      problem_number: item.problemNumber,
      title: item.title,
      question_text: item.questionText,
      image_url: item.imageUrl,
      solution_steps: item.solutionSteps,
      final_answer: item.finalAnswer,
      teacher_tip: item.teacherTip,
    },
  ]).select();

  if (error) {
    console.error('교과서 문제 DB 저장 오류:', error);
    return { success: false, error: error.message };
  }
  return { success: true, data };
}

// 전체 교과서 문제 불러오기
export async function dbFetchTextbookQuestions() {
  const { data, error } = await supabase
    .from('textbook_questions')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    console.error('교과서 문제 불러오기 오류:', error);
    return [];
  }
  return data || [];
}

// 과목 및 단원별 교과서 문제 조회
export async function dbFetchTextbookQuestionsByUnit(subject?: string, unitCode?: string) {
  let query = supabase.from('textbook_questions').select('*');

  if (subject && subject !== 'all') {
    query = query.eq('subject', subject);
  }
  if (unitCode) {
    query = query.eq('unit_code', unitCode);
  }

  const { data, error } = await query.order('page_number', { ascending: true });

  if (error) {
    console.error('단원별 교과서 문제 불러오기 오류:', error);
    return [];
  }
  return data || [];
}

// 교과서 문제 삭제
export async function dbDeleteTextbookQuestion(id: number | string) {
  const { error } = await supabase
    .from('textbook_questions')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('교과서 문제 삭제 오류:', error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

// ==========================================
// 6. 커뮤니티 질문 (Community Questions) DB 연동
// ==========================================

// 커뮤니티 질문 DB 저장
export async function dbSaveCommunityQuestion(question: any) {
  const { data, error } = await supabase.from('community_questions').insert([
    {
      user_name: question.userName || '익명',
      title: question.title || '',
      content: question.content || '',
      category: question.category || '자유',
      image_url: question.imageUrl || '',
    },
  ]).select();

  if (error) {
    console.error('커뮤니티 질문 DB 저장 오류:', error);
    return { success: false, error: error.message };
  }
  return { success: true, data };
}

// 커뮤니티 질문 목록 DB 불러오기
export async function dbFetchCommunityQuestions() {
  const { data, error } = await supabase
    .from('community_questions')
    .select('*')
    .order('id', { ascending: false });

  if (error) {
    console.error('커뮤니티 질문 불러오기 오류:', error);
    return [];
  }
  return data || [];
}
