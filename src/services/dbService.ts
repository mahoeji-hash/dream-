import { supabase } from '../supabaseClient';

// ==========================================
// 1. 교과서 문제 (Textbook Problems) DB 연동
// ==========================================

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

export async function dbSaveCommunityQuestion(question: any) {
  const { data, error } = await supabase.from('community_questions').insert([
    {
      author_id: question.authorId,
      author_name: question.authorName,
      author_role: question.authorRole,
      author_school: question.authorSchool,
      author_grade: question.authorGrade,
      subject: question.subject,
      textbook_ref: question.textbookRef || null,
      title: question.title,
      content: question.content,
      image_url: question.imageUrl || null,
      status: 'waiting',
      likes: 0,
    },
  ]).select();

  if (error) {
    console.error('커뮤니티 질문 DB 저장 오류:', error);
    return { success: false, error: error.message };
  }
  return { success: true, data };
}

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

export async function dbAnswerCommunityQuestion(questionId: string, answer: any) {
  const { data, error } = await supabase
    .from('community_questions')
    .update({
      status: 'answered',
      teacher_answer: answer,
    })
    .eq('id', questionId)
    .select();

  if (error) {
    console.error('선생님 답변 저장 오류:', error);
    return { success: false, error: error.message };
  }
  return { success: true, data };
}

export async function dbDeleteCommunityQuestion(questionId: string) {
  const { error } = await supabase
    .from('community_questions')
    .delete()
    .eq('id', questionId);

  if (error) {
    console.error('커뮤니티 질문 삭제 오류:', error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

export async function dbToggleLikeCommunityQuestion(questionId: string, increment: boolean) {
  const { data: current } = await supabase
    .from('community_questions')
    .select('likes')
    .eq('id', questionId)
    .single();

  const newLikes = Math.max(0, (current?.likes || 0) + (increment ? 1 : -1));

  const { error } = await supabase
    .from('community_questions')
    .update({ likes: newLikes })
    .eq('id', questionId);

  if (error) {
    console.error('좋아요 업데이트 오류:', error);
    return { success: false, error: error.message };
  }
  return { success: true };
}
