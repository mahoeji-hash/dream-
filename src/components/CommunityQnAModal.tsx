import React, { useState, useRef } from 'react';
import {
  X,
  Sparkles,
  HelpCircle,
  MessageSquare,
  CheckCircle2,
  Clock,
  Send,
  Plus,
  ArrowLeft,
  ShieldCheck,
  User,
  School,
  GraduationCap,
  BookOpen,
  ThumbsUp,
  Search,
  Filter,
  Lock,
  Trash2,
  Edit3,
  Lightbulb,
  Check,
  AlertCircle,
  Camera,
  Upload,
  Image as ImageIcon,
  Maximize2,
  ScanLine,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CommunityQuestion, TeacherAnswer, UserProfile, SubjectType, SolutionStep } from '../types';

interface CommunityQnAModalProps {
  userProfile: UserProfile;
  questions: CommunityQuestion[];
  onClose: () => void;
  onAddQuestion: (newQ: CommunityQuestion) => void;
  onAnswerQuestion: (questionId: string, answer: TeacherAnswer) => void;
  onDeleteQuestion?: (questionId: string) => void;
}

export const CommunityQnAModal: React.FC<CommunityQnAModalProps> = ({
  userProfile,
  questions,
  onClose,
  onAddQuestion,
  onAnswerQuestion,
  onDeleteQuestion,
}) => {
  // Navigation / View State
  const [activeTab, setActiveTab] = useState<'all' | 'waiting' | 'answered'>('all');
  const [selectedSubject, setSelectedSubject] = useState<'all' | SubjectType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState<CommunityQuestion | null>(null);
  const [isCreatingNewQ, setIsCreatingNewQ] = useState(false);

  // New Question Form state
  const [newQTitle, setNewQTitle] = useState('');
  const [newQSubject, setNewQSubject] = useState<SubjectType>('math');
  const [newQTextbookRef, setNewQTextbookRef] = useState('');
  const [newQContent, setNewQContent] = useState('');
  const [newQImage, setNewQImage] = useState<string | null>(null);
  const newQFileInputRef = useRef<HTMLInputElement | null>(null);
  const newQCameraInputRef = useRef<HTMLInputElement | null>(null);

  // Admin Answer Form state
  const [isAnswering, setIsAnswering] = useState(false);
  const [confirmDeleteQ, setConfirmDeleteQ] = useState(false);
  const [answerText, setAnswerText] = useState('');
  const [answerKeyFormula, setAnswerKeyFormula] = useState('');
  const [answerTeacherTip, setAnswerTeacherTip] = useState('');
  const [answerImageUrl, setAnswerImageUrl] = useState<string | null>(null);
  const answerFileInputRef = useRef<HTMLInputElement | null>(null);
  const answerCameraInputRef = useRef<HTMLInputElement | null>(null);

  const [steps, setSteps] = useState<Array<{ stepNumber: number; title: string; explanation: string; formulaOrKey?: string }>>([
    { stepNumber: 1, title: '핵심 개념 및 식 세우기', explanation: '' },
    { stepNumber: 2, title: '단계별 풀이 및 계산', explanation: '' },
  ]);
  const [isAiDrafting, setIsAiDrafting] = useState(false);

  // Zoom Image Lightbox
  const [zoomImageUrl, setZoomImageUrl] = useState<string | null>(null);

  // Likes state
  const [likedQuestions, setLikedQuestions] = useState<string[]>([]);

  const handleToggleLike = (qId: string) => {
    if (likedQuestions.includes(qId)) {
      setLikedQuestions(likedQuestions.filter((id) => id !== qId));
    } else {
      setLikedQuestions([...likedQuestions, qId]);
    }
  };

  // Filter questions
  const filteredQuestions = questions.filter((q) => {
    if (activeTab === 'waiting' && q.status !== 'waiting') return false;
    if (activeTab === 'answered' && q.status !== 'answered') return false;
    if (selectedSubject !== 'all' && q.subject !== selectedSubject) return false;
    if (searchQuery.trim()) {
      const qLower = searchQuery.toLowerCase();
      const matchTitle = q.title.toLowerCase().includes(qLower);
      const matchContent = q.content.toLowerCase().includes(qLower);
      const matchRef = q.textbookRef?.toLowerCase().includes(qLower) || false;
      const matchAuthor = q.authorName.toLowerCase().includes(qLower);
      return matchTitle || matchContent || matchRef || matchAuthor;
    }
    return true;
  });

  const waitingCount = questions.filter((q) => q.status === 'waiting').length;
  const answeredCount = questions.filter((q) => q.status === 'answered').length;

  const handleImageFileRead = (file: File, callback: (url: string) => void) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        callback(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle New Question Submit
  const handleSubmitNewQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQTitle.trim() || !newQContent.trim()) return;

    const newQuestion: CommunityQuestion = {
      id: `q-${Date.now()}`,
      authorId: userProfile.id || `user-${Date.now()}`,
      authorName: userProfile.nickname || '익명 학생',
      authorRole: userProfile.role,
      authorSchool: userProfile.schoolName || '대구화원고등학교',
      authorGrade: userProfile.grade,
      subject: newQSubject,
      textbookRef: newQTextbookRef.trim() || undefined,
      title: newQTitle.trim(),
      content: newQContent.trim(),
      imageUrl: newQImage || undefined,
      createdAt: new Date().toLocaleDateString('ko-KR', {
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: 'waiting',
      likes: 1,
    };

    onAddQuestion(newQuestion);
    setIsCreatingNewQ(false);
    setSelectedQuestion(newQuestion);
    setNewQTitle('');
    setNewQContent('');
    setNewQTextbookRef('');
    setNewQImage(null);
  };

  // Open Teacher Answering Form
  const handleOpenAnswering = (q: CommunityQuestion) => {
    if (q.teacherAnswer) {
      setAnswerText(q.teacherAnswer.answerText);
      setAnswerKeyFormula(q.teacherAnswer.keyFormula || '');
      setAnswerTeacherTip(q.teacherAnswer.teacherTip || '');
      setAnswerImageUrl(q.teacherAnswer.imageUrl || null);
      if (q.teacherAnswer.solutionSteps && q.teacherAnswer.solutionSteps.length > 0) {
        setSteps(q.teacherAnswer.solutionSteps);
      }
    } else {
      setAnswerText('');
      setAnswerKeyFormula('');
      setAnswerImageUrl(null);
      setAnswerTeacherTip('💡 팁: 교과서 예제와 연결하여 기본 개념을 점검해보세요.');
      setSteps([
        { stepNumber: 1, title: '문제 핵심 조건 분석', explanation: '' },
        { stepNumber: 2, title: '단계별 풀이 과정', explanation: '' },
      ]);
    }
    setIsAnswering(true);
  };

  // AI draft teacher answer helper
  const handleGenerateAiDraft = async () => {
    if (!selectedQuestion) return;
    setIsAiDrafting(true);
    try {
      const res = await fetch('/api/solve-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText: `${selectedQuestion.title}\n${selectedQuestion.content}`,
          subject: selectedQuestion.subject === 'math' ? '수학' : '과학',
          grade: '고등학교',
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setAnswerText(json.data.summary || '선생님 풀이 설명입니다.');
        setAnswerKeyFormula(json.data.finalAnswer || '');
        setAnswerTeacherTip(json.data.dreamTip || '핵심 원리를 기억하고 복습해보세요!');
        if (json.data.steps && json.data.steps.length > 0) {
          setSteps(json.data.steps);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiDrafting(false);
    }
  };

  // Submit Teacher Answer
  const handleSubmitAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuestion || !answerText.trim()) return;

    const validSteps: SolutionStep[] = steps
      .filter((s) => s.explanation.trim())
      .map((s, i) => ({
        stepNumber: i + 1,
        title: s.title.trim() || `${i + 1}단계 풀이`,
        explanation: s.explanation.trim(),
        formulaOrKey: s.formulaOrKey?.trim() || undefined,
      }));

    const newAnswer: TeacherAnswer = {
      id: `ans-${Date.now()}`,
      authorId: userProfile.id || 'admin-1',
      authorName: userProfile.nickname.includes('선생님')
        ? userProfile.nickname
        : `${userProfile.nickname} (선생님)`,
      authorSchool: userProfile.schoolName || '대구화원고등학교 교무실',
      answeredAt: new Date().toLocaleDateString('ko-KR', {
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      answerText: answerText.trim(),
      imageUrl: answerImageUrl || undefined,
      keyFormula: answerKeyFormula.trim() || undefined,
      solutionSteps: validSteps.length > 0 ? validSteps : undefined,
      teacherTip: answerTeacherTip.trim() || undefined,
      verifiedBadge: true,
    };

    onAnswerQuestion(selectedQuestion.id, newAnswer);
    setSelectedQuestion({
      ...selectedQuestion,
      status: 'answered',
      teacherAnswer: newAnswer,
    });
    setIsAnswering(false);
  };

  const handleStepChange = (index: number, field: string, value: string) => {
    const updated = [...steps];
    updated[index] = { ...updated[index], [field]: value };
    setSteps(updated);
  };

  const handleAddStep = () => {
    setSteps([
      ...steps,
      { stepNumber: steps.length + 1, title: `${steps.length + 1}단계 정리`, explanation: '' },
    ]);
  };

  const handleRemoveStep = (index: number) => {
    if (steps.length <= 1) return;
    setSteps(steps.filter((_, i) => i !== index));
  };

  return (
    <div
      id="community-qna-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        className="w-full max-w-3xl bg-[#FFFDF9] rounded-[32px] shadow-2xl border-4 border-amber-200 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Top Header */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 p-4 sm:p-5 text-white flex items-center justify-between relative shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 border-2 border-white/40 flex items-center justify-center text-2xl shadow-inner">
              📚
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black tracking-tight">
                  우리 학교 실시간 Q&A 질문 게시판
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-white/25 text-[11px] font-black border border-white/30 flex items-center gap-1 shadow-xs">
                  {userProfile.role === 'admin' ? (
                    <>
                      <ShieldCheck className="w-3 h-3 text-amber-200" />
                      <span>선생님 / 관리자 모드</span>
                    </>
                  ) : (
                    <>
                      <span>🎒</span>
                      <span>학생 회원</span>
                    </>
                  )}
                </span>
              </div>
              <p className="text-xs text-amber-100 font-medium mt-0.5 flex items-center gap-1">
                <School className="w-3.5 h-3.5" />
                {userProfile.schoolName} · 수학 & 과학 교과서 질문 모음
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-white/20 hover:bg-white/30 text-white transition-all active:scale-95"
            title="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Notice Banner */}
        <div
          className={`px-4 py-2.5 text-xs font-bold flex items-center justify-between border-b ${
            userProfile.role === 'admin'
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-blue-50 border-blue-200 text-blue-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {userProfile.role === 'admin' ? (
              <>
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>선생님 전용 권한 활성화:</strong> 학생들의 질문을 확인하고 <strong>직접 풀이 해설 및 피드백 답변</strong>을 작성할 수 있습니다.
                </span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  <strong>학생 모드:</strong> 질문을 자유롭게 등록하고 열람할 수 있습니다. (답변 작성은 신뢰성 있는 해설을 위해 <strong>선생님/관리자만 가능</strong>합니다.)
                </span>
              </>
            )}
          </div>

          {!selectedQuestion && !isCreatingNewQ && (
            <button
              onClick={() => setIsCreatingNewQ(true)}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black rounded-xl shadow-xs flex items-center gap-1 shrink-0 ml-2 transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>새 질문 작성</span>
            </button>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {/* ========================================================== */}
          {/* VIEW 1: CREATE NEW QUESTION FORM */}
          {/* ========================================================== */}
          {isCreatingNewQ ? (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between border-b border-amber-100 pb-3">
                <button
                  type="button"
                  onClick={() => setIsCreatingNewQ(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>질문 목록으로</span>
                </button>
                <h3 className="text-sm sm:text-base font-black text-slate-800 flex items-center gap-1.5">
                  <span>✏️</span> 새 교과서 질문 등록하기
                </h3>
              </div>

              <form onSubmit={handleSubmitNewQuestion} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      과목 선택
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setNewQSubject('math')}
                        className={`py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1 transition-all ${
                          newQSubject === 'math'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <span>📐</span> 수학
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewQSubject('science')}
                        className={`py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1 transition-all ${
                          newQSubject === 'science'
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <span>🔬</span> 과학
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      교과서 및 페이지 번호 (선택)
                    </label>
                    <input
                      type="text"
                      value={newQTextbookRef}
                      onChange={(e) => setNewQTextbookRef(e.target.value)}
                      placeholder="예: 공통수학1 (비상) p.52 7번"
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    질문 제목 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newQTitle}
                    onChange={(e) => setNewQTitle(e.target.value)}
                    placeholder="어떤 부분이 헷갈리거나 궁금한지 한 줄로 적어주세요"
                    className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    질문 내용 및 문제 설명 <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={newQContent}
                    onChange={(e) => setNewQContent(e.target.value)}
                    placeholder="문제의 식이나 본문, 그리고 자신이 어디까지 풀었는지 적어주시면 선생님이 더 정확하게 답변해주실 수 있습니다."
                    className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-xs leading-relaxed"
                  />
                </div>

                {/* Photo upload for Question */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    문제 사진 / 손글씨 첨부 (선택)
                  </label>
                  {newQImage ? (
                    <div className="relative rounded-2xl border-2 border-amber-300 bg-slate-900 p-2 overflow-hidden flex flex-col items-center">
                      <img
                        src={newQImage}
                        alt="첨부 사진"
                        className="max-h-48 rounded-xl object-contain w-full"
                      />
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => setZoomImageUrl(newQImage)}
                          className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-bold flex items-center gap-1 backdrop-blur-xs"
                        >
                          <Maximize2 className="w-3 h-3" /> 크게 보기
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewQImage(null)}
                          className="px-3 py-1 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> 삭제
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => newQCameraInputRef.current?.click()}
                        className="flex-1 py-2.5 px-3 bg-amber-50 hover:bg-amber-100/80 border border-amber-300 rounded-xl text-xs font-bold text-amber-900 flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                      >
                        <Camera className="w-4 h-4 text-amber-600" />
                        <span>카메라로 바로 촬영</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => newQFileInputRef.current?.click()}
                        className="flex-1 py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                      >
                        <Upload className="w-4 h-4 text-slate-500" />
                        <span>사진 파일 찾기</span>
                      </button>
                    </div>
                  )}

                  <input
                    ref={newQFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageFileRead(file, (url) => setNewQImage(url));
                    }}
                    className="hidden"
                  />
                  <input
                    ref={newQCameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageFileRead(file, (url) => setNewQImage(url));
                    }}
                    className="hidden"
                  />
                </div>

                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📢</span>
                    <span>
                      등록된 질문은 <strong>선생님(관리자)</strong>이 직접 확인하고 단계별 맞춤 풀이를 달아드립니다.
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingNewQ(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black shadow-md flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>질문 등록하기</span>
                  </button>
                </div>
              </form>
            </motion.div>
          ) : selectedQuestion ? (
            /* ========================================================== */
            /* VIEW 2: QUESTION DETAIL & TEACHER ANSWER VIEW */
            /* ========================================================== */
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              {/* Back Button & Actions */}
              <div className="flex items-center justify-between border-b border-amber-100 pb-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedQuestion(null);
                    setIsAnswering(false);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>질문 목록으로</span>
                </button>

                <div className="flex items-center gap-2">
                  {userProfile.role === 'admin' && onDeleteQuestion && (
                    confirmDeleteQ ? (
                      <div className="flex items-center gap-1 bg-rose-100 px-2 py-1 rounded-xl border border-rose-300 animate-in fade-in">
                        <span className="text-[11px] font-black text-rose-800">정말 삭제?</span>
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteQuestion(selectedQuestion.id);
                            setSelectedQuestion(null);
                            setConfirmDeleteQ(false);
                          }}
                          className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-black shadow-xs"
                        >
                          삭제
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteQ(false)}
                          className="px-1.5 py-0.5 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold border border-slate-300"
                        >
                          취소
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteQ(true)}
                        className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-xl flex items-center gap-1"
                        title="관리자 질문 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>삭제</span>
                      </button>
                    )
                  )}

                  <button
                    type="button"
                    onClick={() => handleToggleLike(selectedQuestion.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                      likedQuestions.includes(selectedQuestion.id)
                        ? 'bg-rose-100 text-rose-600'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>
                      응원해요{' '}
                      {selectedQuestion.likes + (likedQuestions.includes(selectedQuestion.id) ? 1 : 0)}
                    </span>
                  </button>
                </div>
              </div>

              {/* Question Card */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-amber-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                        selectedQuestion.subject === 'math'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {selectedQuestion.subject === 'math' ? '📐 수학' : '🔬 과학'}
                    </span>

                    {selectedQuestion.textbookRef && (
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                        {selectedQuestion.textbookRef}
                      </span>
                    )}

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-black flex items-center gap-1 ${
                        selectedQuestion.status === 'answered'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-orange-100 text-orange-800 animate-pulse'
                      }`}
                    >
                      {selectedQuestion.status === 'answered' ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                          <span>선생님 답변 완료</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3.5 h-3.5 text-orange-600" />
                          <span>답변 대기중</span>
                        </>
                      )}
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-400 font-medium">
                    {selectedQuestion.createdAt}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  {selectedQuestion.title}
                </h3>

                <div className="p-3.5 bg-amber-50/40 rounded-xl border border-amber-100 text-xs sm:text-sm text-slate-800 font-medium whitespace-pre-wrap leading-relaxed">
                  {selectedQuestion.content}
                </div>

                {selectedQuestion.imageUrl && (
                  <div
                    onClick={() => setZoomImageUrl(selectedQuestion.imageUrl || null)}
                    className="group/img relative rounded-2xl overflow-hidden border-2 border-amber-300 max-h-64 bg-slate-900 flex items-center justify-center cursor-pointer shadow-xs hover:shadow-md transition-all"
                  >
                    <img
                      src={selectedQuestion.imageUrl}
                      alt="질문 첨부 사진"
                      className="max-h-64 w-auto object-contain transition-transform group-hover/img:scale-101"
                    />
                    <div className="absolute top-2 right-2 px-2.5 py-1 bg-black/70 backdrop-blur-xs text-white rounded-xl text-[11px] font-bold flex items-center gap-1 opacity-90 group-hover/img:opacity-100 shadow-md">
                      <Maximize2 className="w-3 h-3" /> 크게 보기
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2 text-xs text-slate-500 font-medium border-t border-slate-100">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black text-[10px]">
                    🎒
                  </span>
                  <span className="font-bold text-slate-700">{selectedQuestion.authorName}</span>
                  <span>·</span>
                  <span>{selectedQuestion.authorSchool}</span>
                </div>
              </div>

              {/* ========================================================== */}
              {/* TEACHER ANSWER DISPLAY SECTION */}
              {/* ========================================================== */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                    <span>👑</span>
                    <span>선생님 맞춤 해설 및 답변</span>
                  </h4>

                  {/* ADMIN EDIT / WRITE BUTTON */}
                  {userProfile.role === 'admin' && !isAnswering && (
                    <button
                      type="button"
                      onClick={() => handleOpenAnswering(selectedQuestion)}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black rounded-xl shadow-xs flex items-center gap-1 transition-all active:scale-95"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>
                        {selectedQuestion.teacherAnswer ? '선생님 답변 수정' : '선생님 답변 작성하기'}
                      </span>
                    </button>
                  )}
                </div>

                {/* IF ADMIN IS WRITING ANSWER */}
                {isAnswering && userProfile.role === 'admin' ? (
                  <motion.form
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleSubmitAnswer}
                    className="p-4 sm:p-5 bg-gradient-to-br from-amber-50/90 to-orange-50/70 border-2 border-amber-300 rounded-2xl shadow-md space-y-3.5"
                  >
                    <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-amber-700" />
                        <span className="text-xs font-black text-amber-900">
                          {userProfile.nickname} 선생님의 공식 답변 작성
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={handleGenerateAiDraft}
                        disabled={isAiDrafting}
                        className="px-2.5 py-1 bg-white text-amber-800 border border-amber-300 hover:bg-amber-100 rounded-lg text-[11px] font-black flex items-center gap-1 shadow-2xs"
                      >
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        <span>{isAiDrafting ? 'AI 해설 초안 작성 중...' : 'AI 초안 불러오기'}</span>
                      </button>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-amber-950 block mb-1">
                        선생님 해설 총평 및 핵심 설명 <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                        placeholder="학생이 헷갈리는 핵심 포인트를 짚어주고 전반적인 개념을 설명해주세요."
                        className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-amber-300 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs leading-relaxed"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-amber-950 block mb-1">
                        핵심 공식 / 원리 요약
                      </label>
                      <input
                        type="text"
                        value={answerKeyFormula}
                        onChange={(e) => setAnswerKeyFormula(e.target.value)}
                        placeholder="예: D/4 = (b')² - ac > 0 / 운동의 독립성: g = 9.8 m/s²"
                        className="w-full px-3 py-2 bg-white rounded-xl border border-amber-300 text-xs font-bold text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs font-mono"
                      />
                    </div>

                    {/* Photo Attachment for Teacher Answer */}
                    <div>
                      <label className="text-xs font-bold text-amber-950 block mb-1">
                        선생님 풀이 사진 / 손글씨 판서 첨부 (선택)
                      </label>
                      {answerImageUrl ? (
                        <div className="relative rounded-2xl border-2 border-amber-300 bg-slate-900 p-2 overflow-hidden flex flex-col items-center">
                          <img
                            src={answerImageUrl}
                            alt="선생님 풀이 첨부 사진"
                            className="max-h-56 rounded-xl object-contain w-full"
                          />
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              type="button"
                              onClick={() => setZoomImageUrl(answerImageUrl)}
                              className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-bold flex items-center gap-1 backdrop-blur-xs"
                            >
                              <Maximize2 className="w-3 h-3" /> 크게 보기
                            </button>
                            <button
                              type="button"
                              onClick={() => setAnswerImageUrl(null)}
                              className="px-3 py-1 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" /> 삭제
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => answerCameraInputRef.current?.click()}
                            className="flex-1 py-2.5 px-3 bg-white hover:bg-amber-100 border border-amber-300 rounded-xl text-xs font-bold text-amber-900 flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-2xs"
                          >
                            <Camera className="w-4 h-4 text-amber-600" />
                            <span>손글씨/판서 바로 촬영</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => answerFileInputRef.current?.click()}
                            className="flex-1 py-2.5 px-3 bg-white hover:bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-2xs"
                          >
                            <Upload className="w-4 h-4 text-slate-500" />
                            <span>풀이 사진 파일 찾기</span>
                          </button>
                        </div>
                      )}

                      <input
                        ref={answerFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageFileRead(file, (url) => setAnswerImageUrl(url));
                        }}
                        className="hidden"
                      />
                      <input
                        ref={answerCameraInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageFileRead(file, (url) => setAnswerImageUrl(url));
                        }}
                        className="hidden"
                      />
                    </div>

                    {/* Step by step builders */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-amber-950">
                          단계별 상세 풀이 과정 (선택)
                        </label>
                        <button
                          type="button"
                          onClick={handleAddStep}
                          className="text-[11px] font-bold text-amber-700 hover:underline flex items-center gap-0.5"
                        >
                          <Plus className="w-3 h-3" />
                          <span>단계 추가</span>
                        </button>
                      </div>

                      {steps.map((step, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-white rounded-xl border border-amber-200 space-y-2 relative shadow-2xs"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[11px] font-black flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <input
                              type="text"
                              value={step.title}
                              onChange={(e) => handleStepChange(idx, 'title', e.target.value)}
                              placeholder={`단계 제목 (예: ${idx + 1}단계 공식 적용)`}
                              className="flex-1 px-2.5 py-1 text-xs font-bold bg-amber-50/50 rounded-lg border border-amber-200"
                            />
                            {steps.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveStep(idx)}
                                className="text-slate-400 hover:text-rose-500 p-1"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          <textarea
                            rows={2}
                            value={step.explanation}
                            onChange={(e) => handleStepChange(idx, 'explanation', e.target.value)}
                            placeholder="해당 단계의 풀이 과정 및 주의점을 설명하세요."
                            className="w-full p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs font-medium"
                          />
                        </div>
                      ))}
                    </div>

                    <div>
                      <label className="text-xs font-bold text-amber-950 block mb-1">
                        선생님의 열공 팁 (피드백)
                      </label>
                      <input
                        type="text"
                        value={answerTeacherTip}
                        onChange={(e) => setAnswerTeacherTip(e.target.value)}
                        placeholder="예: 💡 짝수 공식과 판별식 기호를 잊지 마세요!"
                        className="w-full px-3 py-2 bg-white rounded-xl border border-amber-300 text-xs font-bold text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsAnswering(false)}
                        className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-bold"
                      >
                        취소
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-black shadow-md flex items-center gap-1.5"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>선생님 답변 등록하기</span>
                      </button>
                    </div>
                  </motion.form>
                ) : selectedQuestion.teacherAnswer ? (
                  /* ALREADY ANSWERED VIEW */
                  <div className="bg-[#FFFDF5] rounded-2xl p-4 sm:p-5 border-2 border-amber-300 shadow-sm space-y-3">
                    <div className="flex items-center justify-between border-b border-amber-200 pb-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center text-sm shadow-xs font-black">
                          👑
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-amber-950">
                              {selectedQuestion.teacherAnswer.authorName}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-black border border-amber-300 flex items-center gap-0.5">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                              <span>검수 완료</span>
                            </span>
                          </div>
                          <span className="text-[11px] text-amber-700 font-medium">
                            {selectedQuestion.teacherAnswer.authorSchool}
                          </span>
                        </div>
                      </div>

                      <span className="text-[11px] text-amber-800/80 font-medium">
                        {selectedQuestion.teacherAnswer.answeredAt}
                      </span>
                    </div>

                    {/* Answer Text */}
                    <div className="text-xs sm:text-sm text-slate-800 font-semibold leading-relaxed whitespace-pre-wrap">
                      {selectedQuestion.teacherAnswer.answerText}
                    </div>

                    {/* Key Formula Box */}
                    {selectedQuestion.teacherAnswer.keyFormula && (
                      <div className="p-3 bg-amber-100/70 border border-amber-300 rounded-xl text-xs font-black text-amber-950 flex items-center gap-2 font-mono">
                        <span className="text-sm">🔑</span>
                        <span>{selectedQuestion.teacherAnswer.keyFormula}</span>
                      </div>
                    )}

                    {/* Teacher Answer Attached Photo */}
                    {selectedQuestion.teacherAnswer.imageUrl && (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-xs font-black text-amber-950">
                          <span className="flex items-center gap-1">
                            <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
                            선생님 첨부 풀이 / 판서 사진
                          </span>
                          <span className="text-[11px] text-amber-700 font-semibold">
                            사진을 누르면 크게 볼 수 있습니다
                          </span>
                        </div>
                        <div
                          onClick={() => setZoomImageUrl(selectedQuestion.teacherAnswer?.imageUrl || null)}
                          className="group/ansimg relative rounded-2xl overflow-hidden border-2 border-amber-300 bg-slate-900 p-2 cursor-pointer flex items-center justify-center hover:shadow-md transition-all"
                        >
                          <img
                            src={selectedQuestion.teacherAnswer.imageUrl}
                            alt="선생님 풀이 첨부 사진"
                            className="max-h-72 w-auto object-contain rounded-xl transition-transform group-hover/ansimg:scale-101"
                          />
                          <div className="absolute top-3 right-3 px-3 py-1.5 bg-black/70 backdrop-blur-xs text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-lg opacity-90 group-hover/ansimg:opacity-100">
                            <Maximize2 className="w-3.5 h-3.5" /> 크게 보기
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Solution Steps if available */}
                    {selectedQuestion.teacherAnswer.solutionSteps &&
                      selectedQuestion.teacherAnswer.solutionSteps.length > 0 && (
                        <div className="space-y-2 pt-1">
                          <span className="text-xs font-black text-slate-700 block">
                            📌 단계별 풀이 해설
                          </span>
                          <div className="space-y-2">
                            {selectedQuestion.teacherAnswer.solutionSteps.map((st, i) => (
                              <div
                                key={i}
                                className="p-3 bg-white rounded-xl border border-amber-200 shadow-2xs space-y-1"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center">
                                    {st.stepNumber}
                                  </span>
                                  <span className="text-xs font-black text-slate-800">
                                    {st.title}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-700 font-medium leading-relaxed pl-7">
                                  {st.explanation}
                                </p>
                                {st.formulaOrKey && (
                                  <div className="ml-7 p-1.5 bg-blue-50/70 border border-blue-200 rounded-lg text-blue-950 font-mono text-[11px] font-bold">
                                    {st.formulaOrKey}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Teacher Tip Box */}
                    {selectedQuestion.teacherAnswer.teacherTip && (
                      <div className="p-3 bg-gradient-to-r from-amber-100/90 to-yellow-100/80 border border-amber-300 rounded-xl text-xs text-amber-950 font-bold flex items-start gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span>{selectedQuestion.teacherAnswer.teacherTip}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  /* WAITING STATE */
                  <div className="p-6 bg-slate-50 border-2 border-dashed border-amber-200 rounded-2xl text-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-2xl mx-auto animate-bounce">
                      ⏳
                    </div>
                    <h5 className="text-sm font-black text-slate-800">
                      선생님의 맞춤 해설을 기다리고 있습니다
                    </h5>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                      우리 학교 선생님이 질문을 검토한 후 상세한 단계별 풀이와 팁을 달아주실 예정입니다.
                    </p>

                    {/* STUDENT ROLE NOTICE */}
                    {userProfile.role === 'student' && (
                      <div className="mt-3 p-2.5 bg-blue-50/80 border border-blue-200 rounded-xl text-[11px] text-blue-800 font-bold inline-flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-blue-600" />
                        <span>신뢰도 높은 검수 해설을 위해 학생 계정은 답변을 작성할 수 없습니다.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            /* ========================================================== */
            /* VIEW 3: COMMUNITY QUESTIONS LIST */
            /* ========================================================== */
            <div className="space-y-4">
              {/* Search & Filter Bar */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="질문 제목, 교과서 단원, 문제 내용, 작성자 검색..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white rounded-2xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-xs"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      지우기
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between flex-wrap gap-2">
                  {/* Status Filter Tabs */}
                  <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-black">
                    <button
                      onClick={() => setActiveTab('all')}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        activeTab === 'all'
                          ? 'bg-white text-slate-800 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      전체 ({questions.length})
                    </button>
                    <button
                      onClick={() => setActiveTab('waiting')}
                      className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                        activeTab === 'waiting'
                          ? 'bg-orange-500 text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      <span>답변 대기 ({waitingCount})</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('answered')}
                      className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                        activeTab === 'answered'
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>선생님 답변 완료 ({answeredCount})</span>
                    </button>
                  </div>

                  {/* Subject Filter */}
                  <div className="flex items-center gap-1 text-xs font-bold">
                    <button
                      onClick={() => setSelectedSubject('all')}
                      className={`px-2.5 py-1 rounded-lg border ${
                        selectedSubject === 'all'
                          ? 'bg-slate-800 text-white border-slate-800'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      전체 과목
                    </button>
                    <button
                      onClick={() => setSelectedSubject('math')}
                      className={`px-2.5 py-1 rounded-lg border ${
                        selectedSubject === 'math'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50'
                      }`}
                    >
                      📐 수학
                    </button>
                    <button
                      onClick={() => setSelectedSubject('science')}
                      className={`px-2.5 py-1 rounded-lg border ${
                        selectedSubject === 'science'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                      }`}
                    >
                      🔬 과학
                    </button>
                  </div>
                </div>
              </div>

              {/* Questions List */}
              {filteredQuestions.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200 space-y-2">
                  <span className="text-3xl">🔍</span>
                  <h4 className="text-sm font-black text-slate-700">해당하는 질문이 없습니다</h4>
                  <p className="text-xs text-slate-400">
                    새로운 질문을 등록하거나 검색 조건을 변경해보세요!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredQuestions.map((q) => (
                    <motion.div
                      key={q.id}
                      onClick={() => setSelectedQuestion(q)}
                      whileHover={{ scale: 1.01, y: -1 }}
                      whileTap={{ scale: 0.99 }}
                      className="p-4 bg-white rounded-2xl border-2 border-amber-200 hover:border-amber-400 hover:shadow-md cursor-pointer transition-all space-y-2 relative group"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                              q.subject === 'math'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {q.subject === 'math' ? '📐 수학' : '🔬 과학'}
                          </span>

                          {q.textbookRef && (
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold">
                              {q.textbookRef}
                            </span>
                          )}

                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-black flex items-center gap-1 ${
                              q.status === 'answered'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-orange-100 text-orange-800'
                            }`}
                          >
                            {q.status === 'answered' ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-amber-600" />
                                <span>선생님 답변 완료</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3 text-orange-600" />
                                <span>답변 대기</span>
                              </>
                            )}
                          </span>
                        </div>

                        <span className="text-[11px] text-slate-400 font-medium">
                          {q.createdAt}
                        </span>
                      </div>

                      <h4 className="text-sm sm:text-base font-black text-slate-900 group-hover:text-amber-700 transition-colors">
                        {q.title}
                      </h4>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {q.content}
                      </p>

                      {/* Footer Info & Admin Action Hint */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-500 font-medium text-[11px]">
                          <span>👤 {q.authorName}</span>
                          <span>·</span>
                          <span>{q.authorSchool}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {userProfile.role === 'admin' && q.status === 'waiting' && (
                            <span className="px-2 py-0.5 bg-amber-500 text-white rounded-lg text-[10px] font-black animate-pulse flex items-center gap-0.5">
                              <ShieldCheck className="w-3 h-3" />
                              <span>답변 작성하기</span>
                            </span>
                          )}
                          <span className="text-slate-400 text-[11px] font-bold">
                            👍 {q.likes}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="p-3.5 bg-amber-50/80 border-t border-amber-100 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium text-[11px]">
            풀어 DREAM · 우리 학교 수학·과학 학습 지원 Q&A 시스템
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-900 transition-colors"
          >
            닫기
          </button>
        </div>
      </motion.div>

      {/* Enlarged Photo Lightbox Modal */}
      <AnimatePresence>
        {zoomImageUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomImageUrl(null)}
            className="fixed inset-0 z-70 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl max-h-[90vh] bg-slate-950 rounded-2xl overflow-hidden border border-white/20 flex flex-col items-center shadow-2xl"
            >
              <button
                onClick={() => setZoomImageUrl(null)}
                className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-colors shadow-md"
              >
                <X className="w-5 h-5" />
              </button>
              <img
                src={zoomImageUrl}
                alt="확대 이미지"
                className="max-w-full max-h-[80vh] object-contain p-2"
              />
              <div className="p-2.5 text-center text-xs text-white/70 font-medium bg-black/50 w-full">
                바깥 영역이나 닫기 버튼을 누르면 닫힙니다
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
