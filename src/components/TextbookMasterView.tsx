import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Search, BookOpen, ChevronRight, Filter, Sparkles, PlusCircle, 
  CheckCircle2, Bookmark, ArrowLeft, Trash2, ShieldCheck, Award, 
  FileQuestion, Camera, Upload, Image as ImageIcon, Maximize2, X, 
  Lightbulb, Layers, ChevronDown, Check, PlayCircle, BookMarked, Compass,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SubjectType, GradeType, TextbookInfo, ProblemItem, SolutionStep, UserRole, InterestingFactItem, QuizAttemptRecord } from '../types';
import { getStoredUnitQuizzes, saveStoredUnitQuizzes, UnitQuiz, QuizQuestion } from '../data/mockUnitTests';
import { getCurriculumForSubject, ChapterGroup, SubUnitItem } from '../data/curriculumData';
import { UnitTestModal } from './UnitTestModal';
import { InterestingFactsGallery } from './InterestingFactsGallery';

interface TextbookMasterViewProps {
  subject: SubjectType;
  textbooks: TextbookInfo[];
  problems: ProblemItem[];
  bookmarkedProblemIds: string[];
  userRole?: UserRole;
  currentUserId?: string;
  facts?: InterestingFactItem[];
  onSelectProblem: (problem: ProblemItem) => void;
  onGoBack: () => void;
  onAddNewProblem: (newProblem: ProblemItem) => void;
  onDeleteProblem?: (problemId: string) => void;
  onAddNewFact?: (fact: InterestingFactItem) => void;
  onDeleteFact?: (factId: string) => void;
  onToggleLikeFact?: (factId: string) => void;
  onCompleteQuiz?: (attempt: QuizAttemptRecord) => void;
}

export const TextbookMasterView: React.FC<TextbookMasterViewProps> = ({
  subject,
  textbooks,
  problems,
  bookmarkedProblemIds,
  userRole = 'student',
  currentUserId,
  facts = [],
  onSelectProblem,
  onGoBack,
  onAddNewProblem,
  onDeleteProblem,
  onAddNewFact,
  onDeleteFact,
  onToggleLikeFact,
  onCompleteQuiz,
}) => {
  const [selectedTextbookId, setSelectedTextbookId] = useState<string | null>(null);
  
  // Navigation & Dropdown Selection State
  const [isUnitSelectorOpen, setIsUnitSelectorOpen] = useState(false);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [selectedSubUnitId, setSelectedSubUnitId] = useState<string | null>(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<'all' | '중단원 마무리' | '대단원 평가'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Active Tab: Problems vs Interesting Facts vs Unit Tests
  const [activeTab, setActiveTab] = useState<'problems' | 'facts' | 'unit_tests'>('problems');
  const [selectedQuiz, setSelectedQuiz] = useState<UnitQuiz | null>(null);

  // Unit Quizzes State & Admin Persistence
  const [allQuizzes, setAllQuizzes] = useState<UnitQuiz[]>(() => getStoredUnitQuizzes());
  
  // Admin Quiz Management States
  const [showAddQuizModal, setShowAddQuizModal] = useState(false);
  const [showManageQuizModal, setShowManageQuizModal] = useState(false);
  const [targetQuizIdForAdd, setTargetQuizIdForAdd] = useState<string>('');
  const [selectedQuizForManage, setSelectedQuizForManage] = useState<UnitQuiz | null>(null);

  // Admin Quiz Duration Setting Modal States
  const [showEditQuizTimeModal, setShowEditQuizTimeModal] = useState(false);
  const [editingQuizForTime, setEditingQuizForTime] = useState<UnitQuiz | null>(null);
  const [customQuizMinutes, setCustomQuizMinutes] = useState<number>(10);

  // New Quiz Question Form Fields
  const [newQuizQuestionText, setNewQuizQuestionText] = useState('');
  const [newQuizOpt1, setNewQuizOpt1] = useState('');
  const [newQuizOpt2, setNewQuizOpt2] = useState('');
  const [newQuizOpt3, setNewQuizOpt3] = useState('');
  const [newQuizOpt4, setNewQuizOpt4] = useState('');
  const [newQuizCorrectIdx, setNewQuizCorrectIdx] = useState(0);
  const [newQuizExplanation, setNewQuizExplanation] = useState('');
  const [newQuizHint, setNewQuizHint] = useState('');
  const [newQuizQuestionImage, setNewQuizQuestionImage] = useState<string | null>(null);
  const [newQuizExplanationImage, setNewQuizExplanationImage] = useState<string | null>(null);

  const quizQuestionFileInputRef = useRef<HTMLInputElement>(null);
  const quizExplanationFileInputRef = useRef<HTMLInputElement>(null);

  // New problem registration modal (Admin only)
  const [showAddProblemModal, setShowAddProblemModal] = useState(false);
  const [newChapterName, setNewChapterName] = useState(
    subject === 'math' ? 'I. 도형의 방정식' : 'I. 변화와 다양성'
  );
  const [newUnitName, setNewUnitName] = useState(
    subject === 'math' ? '1. 평면좌표와 직선의 방정식' : '1. 지구 환경 변화와 생물다양성'
  );
  const [newProbType, setNewProbType] = useState<'중단원 마무리' | '대단원 평가' | '개념 예제' | '확인 문제' | '발전/심화 문제'>('중단원 마무리');
  const [newPageNum, setNewPageNum] = useState('');
  const [newProbNum, setNewProbNum] = useState('');
  const [newProbText, setNewProbText] = useState('');
  const [newStep1, setNewStep1] = useState('');
  const [newStep2, setNewStep2] = useState('');
  const [newFinalAns, setNewFinalAns] = useState('');
  const [newTip, setNewTip] = useState('');
  const [newSolutionImage, setNewSolutionImage] = useState<string | null>(null);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  const selectorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Curriculum structure for this subject
  const curriculumChapters = useMemo(() => {
    return getCurriculumForSubject(subject);
  }, [subject]);

  // Click outside listener for dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
        setIsUnitSelectorOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleImageFileRead = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        setNewSolutionImage(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // High 1 Subject major chapter quizzes
  const subjectQuizzes = useMemo(() => {
    return allQuizzes.filter((q) => q.subject === subject);
  }, [allQuizzes, subject]);

  const handleOpenAddQuizQuestion = (quizId?: string) => {
    if (quizId) {
      setTargetQuizIdForAdd(quizId);
    } else if (subjectQuizzes.length > 0) {
      setTargetQuizIdForAdd(subjectQuizzes[0].id);
    }
    setNewQuizQuestionText('');
    setNewQuizOpt1('');
    setNewQuizOpt2('');
    setNewQuizOpt3('');
    setNewQuizOpt4('');
    setNewQuizCorrectIdx(0);
    setNewQuizExplanation('');
    setNewQuizHint('');
    setNewQuizQuestionImage(null);
    setNewQuizExplanationImage(null);
    setShowAddQuizModal(true);
  };

  const handleSaveQuizQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetQuizIdForAdd || !newQuizQuestionText.trim()) return;

    const opts = [
      newQuizOpt1.trim(),
      newQuizOpt2.trim(),
      newQuizOpt3.trim(),
      newQuizOpt4.trim(),
    ].filter(Boolean);

    if (opts.length < 2) {
      alert('최소 2개 이상의 보기를 입력해주세요.');
      return;
    }

    const newQuestion: QuizQuestion = {
      id: `custom-q-${Date.now()}`,
      questionText: newQuizQuestionText.trim(),
      options: opts,
      correctIndex: Math.min(newQuizCorrectIdx, opts.length - 1),
      explanation: newQuizExplanation.trim() || '상세 해설이 등록되었습니다.',
      hint: newQuizHint.trim() || undefined,
      questionImage: newQuizQuestionImage || undefined,
      explanationImage: newQuizExplanationImage || undefined,
    };

    const updated = allQuizzes.map((quiz) => {
      if (quiz.id === targetQuizIdForAdd) {
        const updatedQuestions = [...quiz.questions, newQuestion];
        const updatedQuiz = {
          ...quiz,
          questions: updatedQuestions,
          estimatedMinutes: Math.max(5, updatedQuestions.length * 3),
        };
        if (selectedQuizForManage && selectedQuizForManage.id === quiz.id) {
          setSelectedQuizForManage(updatedQuiz);
        }
        return updatedQuiz;
      }
      return quiz;
    });

    setAllQuizzes(updated);
    saveStoredUnitQuizzes(updated);
    setShowAddQuizModal(false);
  };

  const handleDeleteQuizQuestion = (quizId: string, questionId: string) => {
    if (!confirm('이 문제를 대단원 TEST에서 삭제하시겠습니까?')) return;

    const updated = allQuizzes.map((quiz) => {
      if (quiz.id === quizId) {
        const updatedQuestions = quiz.questions.filter((q) => q.id !== questionId);
        const updatedQuiz = {
          ...quiz,
          questions: updatedQuestions,
          estimatedMinutes: Math.max(5, updatedQuestions.length * 3),
        };
        if (selectedQuizForManage && selectedQuizForManage.id === quiz.id) {
          setSelectedQuizForManage(updatedQuiz);
        }
        return updatedQuiz;
      }
      return quiz;
    });

    setAllQuizzes(updated);
    saveStoredUnitQuizzes(updated);
  };

  const handleOpenEditQuizTime = (quiz: UnitQuiz) => {
    setEditingQuizForTime(quiz);
    setCustomQuizMinutes(quiz.estimatedMinutes ?? 10);
    setShowEditQuizTimeModal(true);
  };

  const handleSaveQuizTime = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuizForTime) return;
    const minutes = Math.max(0, Math.min(180, Number(customQuizMinutes)));
    const updated = allQuizzes.map((q) => {
      if (q.id === editingQuizForTime.id) {
        const updatedQuiz = { ...q, estimatedMinutes: minutes };
        if (selectedQuizForManage && selectedQuizForManage.id === q.id) {
          setSelectedQuizForManage(updatedQuiz);
        }
        return updatedQuiz;
      }
      return q;
    });
    setAllQuizzes(updated);
    saveStoredUnitQuizzes(updated);
    setShowEditQuizTimeModal(false);
  };

  // Filtered textbooks for this subject
  const subjectTextbooks = useMemo(() => {
    return textbooks.filter((tb) => tb.subject === subject);
  }, [textbooks, subject]);

  // Active Textbook
  const activeTextbook = useMemo(() => {
    if (selectedTextbookId) {
      return textbooks.find((tb) => tb.id === selectedTextbookId) || subjectTextbooks[0];
    }
    return subjectTextbooks[0];
  }, [selectedTextbookId, textbooks, subjectTextbooks]);

  // Current active chapter object
  const activeChapterObj = useMemo(() => {
    if (!selectedChapterId) return null;
    return curriculumChapters.find((ch) => ch.id === selectedChapterId) || null;
  }, [curriculumChapters, selectedChapterId]);

  // Current active subunit object
  const activeSubUnitObj = useMemo(() => {
    if (!activeChapterObj || !selectedSubUnitId) return null;
    if (activeChapterObj.grandAssessment.id === selectedSubUnitId) {
      return activeChapterObj.grandAssessment;
    }
    return activeChapterObj.subUnits.find((su) => su.id === selectedSubUnitId) || null;
  }, [activeChapterObj, selectedSubUnitId]);

  // Filtered problems according to selected Chapter / Sub-Unit / Search Query
  const filteredProblems = useMemo(() => {
    return problems.filter((prob) => {
      if (prob.subject !== subject) return false;
      if (activeTextbook && prob.textbookId !== activeTextbook.id) return false;

      // Filter by Chapter
      if (activeChapterObj) {
        const matchesChapter = 
          prob.chapter.includes(activeChapterObj.chapterName) ||
          prob.chapter.includes(`${activeChapterObj.chapterNumber}`) ||
          prob.unitNumber === activeChapterObj.chapterNumber;
        if (!matchesChapter) return false;
      }

      // Filter by Sub-Unit
      if (activeSubUnitObj) {
        if (activeSubUnitObj.category === '대단원 평가') {
          const isGrand = prob.problemType === '발전/심화 문제' || 
                          prob.unitName.includes('대단원') || 
                          prob.problemNumber.includes('대단원');
          if (!isGrand) return false;
        } else {
          // 중단원 마무리
          const cleanTitle = activeSubUnitObj.title.replace(/^\d+\.\s*/, '');
          const matchesSub = prob.unitName.includes(cleanTitle) || prob.unitName.includes(activeSubUnitObj.title);
          if (!matchesSub) return false;
        }
      }

      // Filter by Category Type pill (if selected)
      if (selectedCategoryFilter === '중단원 마무리') {
        if (prob.problemType !== '중단원 마무리' && !prob.problemNumber.includes('중단원')) return false;
      } else if (selectedCategoryFilter === '대단원 평가') {
        if (!prob.problemNumber.includes('대단원') && !prob.unitName.includes('대단원') && prob.problemType !== '발전/심화 문제') return false;
      }

      // Search query string
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesPage = `p.${prob.pageNumber}`.includes(q) || `${prob.pageNumber}`.includes(q);
        const matchesNum = prob.problemNumber.toLowerCase().includes(q);
        const matchesText = prob.problemText.toLowerCase().includes(q);
        const matchesUnit = prob.unitName.toLowerCase().includes(q);
        const matchesConcepts = prob.coreConcepts?.some((c) => c.toLowerCase().includes(q)) || false;
        return matchesPage || matchesNum || matchesText || matchesUnit || matchesConcepts;
      }

      return true;
    });
  }, [problems, subject, activeTextbook, activeChapterObj, activeSubUnitObj, selectedCategoryFilter, searchQuery]);

  // Find corresponding quiz for current selection
  const matchingQuizForSelection = useMemo(() => {
    if (!activeSubUnitObj) return null;
    return subjectQuizzes.find((q) => q.unitCode === activeSubUnitObj.unitCode) || null;
  }, [activeSubUnitObj, subjectQuizzes]);

  // Select Unit & Close Dropdown
  const handleSelectSubUnit = (chapter: ChapterGroup, subUnit: SubUnitItem) => {
    setSelectedChapterId(chapter.id);
    setSelectedSubUnitId(subUnit.id);
    setSelectedCategoryFilter(subUnit.category === '대단원 평가' ? '대단원 평가' : '중단원 마무리');
    setIsUnitSelectorOpen(false);
    setSearchQuery('');
  };

  const handleSelectWholeChapter = (chapter: ChapterGroup) => {
    setSelectedChapterId(chapter.id);
    setSelectedSubUnitId(null);
    setSelectedCategoryFilter('all');
    setIsUnitSelectorOpen(false);
    setSearchQuery('');
  };

  const handleResetUnitFilter = () => {
    setSelectedChapterId(null);
    setSelectedSubUnitId(null);
    setSelectedCategoryFilter('all');
    setSearchQuery('');
  };

  const handleCreateProblem = (e: React.FormEvent) => {
    e.preventDefault();
    if (userRole !== 'admin') {
      alert('교과서 문제 및 풀이 등록은 관리자(선생님)만 가능합니다.');
      return;
    }
    if (!newUnitName.trim() || !newProbText.trim() || !newFinalAns.trim()) return;

    const steps: SolutionStep[] = [];
    if (newStep1.trim()) {
      steps.push({
        stepNumber: 1,
        title: '핵심 개념 및 공식 적용',
        explanation: newStep1.trim(),
      });
    }
    if (newStep2.trim()) {
      steps.push({
        stepNumber: steps.length + 1,
        title: '풀이 전개 및 정리',
        explanation: newStep2.trim(),
      });
    }
    if (steps.length === 0) {
      steps.push({
        stepNumber: 1,
        title: '단계별 해설',
        explanation: '교과서 공식과 정의를 활용하여 차례대로 계산합니다.',
      });
    }

    const created: ProblemItem = {
      id: `prob-custom-${Date.now()}`,
      textbookId: activeTextbook?.id || (subject === 'math' ? 'tb-math-mr-h2' : 'tb-sci-bs-h1'),
      subject: subject,
      grade: 'high_1',
      chapter: newChapterName.trim(),
      unitNumber: parseInt(newPageNum, 10) ? Math.floor(parseInt(newPageNum, 10) / 40) + 1 : 1,
      unitName: newUnitName.trim(),
      pageNumber: parseInt(newPageNum, 10) || 1,
      problemNumber: newProbNum.trim() || '연습 문제 1번',
      problemType: newProbType,
      difficulty: newProbType === '대단원 평가' ? '도전' : '보통',
      problemText: newProbText.trim(),
      solutionSteps: steps,
      finalAnswer: newFinalAns.trim(),
      coreConcepts: [newUnitName.trim(), newProbType],
      dreamTip: newTip.trim() || '💡 핵심 개념과 공식을 꼼꼼히 확인하고 부호 실수를 조심하세요!',
      solutionImage: newSolutionImage || undefined,
      peerTips: [],
      studentSolutions: [],
      views: 1,
      likes: 0,
    };

    onAddNewProblem(created);
    setShowAddProblemModal(false);

    // Reset inputs
    setNewProbNum('');
    setNewProbText('');
    setNewStep1('');
    setNewStep2('');
    setNewFinalAns('');
    setNewTip('');
    setNewSolutionImage(null);
    alert('새 교과서 문제 및 풀이가 성공적으로 등록되었습니다! 🎉');
  };

  const themeBorder = subject === 'math' ? 'border-blue-500' : 'border-emerald-500';
  const themeBgLight = subject === 'math' ? 'bg-blue-50' : 'bg-emerald-50';
  const themeBadge = subject === 'math' ? 'bg-blue-600' : 'bg-emerald-600';

  return (
    <div id="textbook-master-container" className="w-full max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-5 space-y-4 sm:space-y-5">
      {/* Top Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-amber-200/90">
        <button
          id="btn-back-to-home"
          type="button"
          onClick={onGoBack}
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border-2 border-amber-200 hover:border-amber-400 hover:bg-amber-50/70 text-slate-700 text-xs sm:text-sm font-black shadow-sm transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-amber-700" />
          <span>홈으로 돌아가기</span>
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          {userRole === 'admin' && (
            <button
              id="btn-admin-add-problem-top"
              type="button"
              onClick={() => setShowAddProblemModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-black shadow-md transition-all active:scale-95"
            >
              <PlusCircle className="w-3.5 h-3.5 text-white" />
              <span>+ 풀이 직접 등록 (선생님)</span>
            </button>
          )}

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border-2 border-amber-200 shadow-2xs">
            <span className="text-xs font-bold text-slate-500">과목:</span>
            <span className={`text-xs font-black px-2.5 py-0.5 rounded-xl ${themeBadge} text-white shadow-2xs`}>
              {subject === 'math' ? '수학 (미래엔 공통수학 2)' : '과학 (비상교육 통합과학 2)'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Tab Navigator (Clean, Spacious, Beautiful Segmented Control) */}
      <div className="bg-amber-100/80 p-1.5 sm:p-2 rounded-3xl border-2 border-amber-200 shadow-inner flex flex-col sm:flex-row gap-1.5 sm:gap-2">
        <button
          id="tab-btn-problems"
          type="button"
          onClick={() => setActiveTab('problems')}
          className={`flex-1 py-3 px-3 sm:px-4 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all relative ${
            activeTab === 'problems'
              ? 'bg-white text-blue-900 border-2 border-blue-400 shadow-md scale-[1.01]'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50 border-2 border-transparent'
          }`}
        >
          <BookOpen className={`w-4 h-4 shrink-0 ${activeTab === 'problems' ? 'text-blue-600' : 'text-slate-500'}`} />
          <span className="tracking-tight whitespace-nowrap">교과서 문제 풀이</span>
        </button>

        <button
          id="tab-btn-facts"
          type="button"
          onClick={() => setActiveTab('facts')}
          className={`flex-1 py-3 px-3 sm:px-4 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all relative ${
            activeTab === 'facts'
              ? 'bg-white text-amber-950 border-2 border-amber-400 shadow-md scale-[1.01]'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50 border-2 border-transparent'
          }`}
        >
          <Sparkles className={`w-4 h-4 shrink-0 ${activeTab === 'facts' ? 'text-amber-500 fill-amber-400' : 'text-slate-500'}`} />
          <span className="tracking-tight whitespace-nowrap">흥미로운 사실 포스터</span>
          <span className="px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black rounded-full shadow-2xs">
            HOT
          </span>
        </button>

        <button
          id="tab-btn-unit-tests"
          type="button"
          onClick={() => setActiveTab('unit_tests')}
          className={`flex-1 py-3 px-3 sm:px-4 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all relative ${
            activeTab === 'unit_tests'
              ? 'bg-white text-orange-950 border-2 border-orange-400 shadow-md scale-[1.01]'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50 border-2 border-transparent'
          }`}
        >
          <Award className={`w-4 h-4 shrink-0 ${activeTab === 'unit_tests' ? 'text-orange-500' : 'text-slate-500'}`} />
          <span className="tracking-tight whitespace-nowrap">대단원 실전 TEST</span>
        </button>
      </div>

      {/* ========================================================== */}
      {/* TAB: 흥미로운 사실 포스터 갤러리 */}
      {/* ========================================================== */}
      {activeTab === 'facts' && (
        <InterestingFactsGallery
          subject={subject}
          userRole={userRole}
          currentUserId={currentUserId}
          facts={facts}
          onAddNewFact={(newFact) => onAddNewFact && onAddNewFact(newFact)}
          onDeleteFact={(factId) => onDeleteFact && onDeleteFact(factId)}
          onToggleLikeFact={(factId) => onToggleLikeFact && onToggleLikeFact(factId)}
        />
      )}

      {/* ========================================================== */}
      {/* TAB 1: 교과서 문제 & 풀이 보기 */}
      {/* ========================================================== */}
      {activeTab === 'problems' && (
        <div className="space-y-4">
          {/* Grade & Textbook Banner */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 rounded-3xl shadow-md flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-[11px] font-black tracking-wide uppercase">
                  {subject === 'math' ? '미래엔 교과서' : '비상교육 교과서'}
                </span>
                <span className="text-xs text-blue-100 font-semibold">
                  고등학교 1학년
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight">
                {subject === 'math' ? '미래엔 공통수학 2 교과서 마스터' : '비상교육 통합과학 2 교과서 마스터'}
              </h2>
              <p className="text-xs text-blue-100 font-medium">
                {subject === 'math'
                  ? '도형의 방정식 · 집합과 명제 · 함수와 그래프 중단원 마무리 & 대단원 평가 풀이 수록'
                  : '변화와 다양성 · 환경과 에너지 · 과학과 미래 사회 중단원 마무리 & 대단원 마무리 풀이 수록'}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/30 flex items-center justify-center text-3xl shadow-inner shrink-0 ml-2">
              {subject === 'math' ? '📐' : '🔬'}
            </div>
          </div>

          {/* ========================================================== */}
          {/* SMART SEARCH & UNIT SELECTOR DROPDOWN (돋보기 클릭 시 단원 선택지) */}
          {/* ========================================================== */}
          <div ref={selectorRef} className="relative z-30 space-y-2">
            <label className="text-xs font-black text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-blue-600" />
                <span>단원 및 문제 바로가기 (돋보기를 누르면 단원 선택지가 열립니다)</span>
              </span>
              <span className="text-[11px] text-blue-600 font-bold">
                클릭하여 단원/평가 선택
              </span>
            </label>

            {/* The Search Bar / Dropdown Trigger */}
            <div className="relative">
              <button
                type="button"
                id="btn-unit-selector-trigger"
                onClick={() => setIsUnitSelectorOpen((prev) => !prev)}
                className={`w-full py-3.5 pl-11 pr-10 bg-white rounded-2xl border-2 text-left text-xs sm:text-sm font-semibold transition-all shadow-sm flex items-center justify-between ${
                  isUnitSelectorOpen 
                    ? 'border-blue-500 ring-4 ring-blue-100 shadow-md' 
                    : activeSubUnitObj || activeChapterObj 
                      ? 'border-blue-400 bg-blue-50/40 text-blue-950' 
                      : 'border-amber-200 hover:border-blue-300 text-slate-800'
                }`}
              >
                {/* Left Search/Magnifier Icon */}
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Search className="w-4 h-4" />
                </div>

                <div className="flex-1 pr-2 min-w-0">
                  {activeSubUnitObj && activeChapterObj ? (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 bg-blue-600 text-white font-black text-[10px] rounded-md shrink-0">
                        {activeChapterObj.chapterName}
                      </span>
                      <span className="font-black text-slate-900 break-keep">
                        {activeSubUnitObj.title}
                      </span>
                      <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded shrink-0">
                        {activeSubUnitObj.badge}
                      </span>
                    </div>
                  ) : activeChapterObj ? (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 bg-blue-600 text-white font-black text-[10px] rounded-md shrink-0">
                        선택됨
                      </span>
                      <span className="font-black text-slate-900 break-keep">
                        {activeChapterObj.fullName} (전체)
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-400 font-medium break-keep">
                      🔍 돋보기를 눌러 몇 단원(중단원 마무리/대단원 평가)을 풀지 선택하세요!
                    </span>
                  )}
                </div>

                {/* Right Arrow Indicator */}
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isUnitSelectorOpen ? 'rotate-180 text-blue-600' : ''}`} />
                </div>
              </button>
            </div>

            {/* Dropdown Selection Menu Panel */}
            <AnimatePresence>
              {isUnitSelectorOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.99 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.99 }}
                  transition={{ duration: 0.18 }}
                  className="absolute left-0 right-0 top-full mt-1.5 bg-[#FFFDF9] rounded-3xl border-2 border-blue-400 shadow-2xl overflow-hidden z-50 p-3 sm:p-4 space-y-3"
                >
                  {/* Dropdown Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-amber-200">
                    <div className="flex items-center gap-1.5">
                      <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-black">
                        1
                      </span>
                      <h4 className="text-xs sm:text-sm font-black text-slate-900">
                        공부할 대단원 & 중단원 마무리 / 대단원 평가를 선택하세요
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleResetUnitFilter()}
                      className="text-[11px] font-bold text-slate-500 hover:text-rose-600 px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-rose-50 transition-colors"
                    >
                      전체 단원 보기 (초기화)
                    </button>
                  </div>

                  {/* Chapter List with Direct Subunit Actions */}
                  <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                    {curriculumChapters.map((ch) => {
                      const isChActive = activeChapterObj?.id === ch.id;
                      return (
                        <div
                          key={ch.id}
                          className={`rounded-2xl border-2 overflow-hidden transition-all ${
                            isChActive
                              ? 'border-blue-500 bg-blue-50/50 shadow-sm'
                              : 'border-amber-200 bg-white hover:border-amber-300'
                          }`}
                        >
                          {/* Chapter Header row */}
                          <div className="p-3 bg-gradient-to-r from-amber-50/80 to-white flex items-center justify-between border-b border-amber-100">
                            <div className="flex items-center gap-2">
                              <span className="w-7 h-7 rounded-xl bg-blue-600 text-white text-xs font-black flex items-center justify-center shadow-2xs">
                                {ch.chapterNumber}
                              </span>
                              <div>
                                <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider block">
                                  {ch.chapterNumber}단원
                                </span>
                                <h5 className="text-xs sm:text-sm font-black text-slate-900">
                                  {ch.chapterName}
                                </h5>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleSelectWholeChapter(ch)}
                              className="text-[11px] font-black px-2.5 py-1 rounded-xl bg-blue-100 hover:bg-blue-600 text-blue-700 hover:text-white transition-all shadow-2xs"
                            >
                              {ch.chapterNumber}단원 전체 보기
                            </button>
                          </div>

                          {/* Subunits & Grand Assessment buttons */}
                          <div className="p-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {/* 중단원 마무리 문제들 */}
                            {ch.subUnits.map((su) => {
                              const isSubActive = activeSubUnitObj?.id === su.id;
                              return (
                                <button
                                  key={su.id}
                                  type="button"
                                  onClick={() => handleSelectSubUnit(ch, su)}
                                  className={`p-2.5 rounded-xl border text-left flex items-center justify-between gap-2 transition-all group ${
                                    isSubActive
                                      ? 'bg-blue-600 text-white border-blue-600 shadow-md font-bold'
                                      : 'bg-white hover:bg-blue-50 text-slate-800 border-amber-100 hover:border-blue-300'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md shrink-0 ${isSubActive ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-800'}`}>
                                      중단원
                                    </span>
                                    <span className="text-xs font-bold break-keep">
                                      {su.title}
                                    </span>
                                  </div>
                                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${isSubActive ? 'bg-white text-blue-900' : 'bg-amber-100 text-amber-900'}`}>
                                    마무리 문제
                                  </span>
                                </button>
                              );
                            })}

                            {/* 대단원 평가 문제 (전체) */}
                            <button
                              type="button"
                              onClick={() => handleSelectSubUnit(ch, ch.grandAssessment)}
                              className={`sm:col-span-2 p-2.5 rounded-xl border-2 text-left flex items-center justify-between gap-2 transition-all ${
                                activeSubUnitObj?.id === ch.grandAssessment.id
                                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-500 shadow-md font-bold'
                                  : 'bg-amber-50/80 hover:bg-amber-100/80 text-amber-950 border-amber-300 hover:border-amber-400'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-base">🏆</span>
                                <div>
                                  <span className="text-xs font-black block">
                                    {ch.grandAssessment.title}
                                  </span>
                                  <span className={`text-[10px] font-medium ${activeSubUnitObj?.id === ch.grandAssessment.id ? 'text-amber-100' : 'text-amber-700'}`}>
                                    {ch.chapterNumber}단원 전체 범위 실전 대단원 평가 문제 풀기
                                  </span>
                                </div>
                              </div>
                              <span className={`text-[10px] font-black px-2.5 py-1 rounded-full shrink-0 shadow-2xs ${
                                activeSubUnitObj?.id === ch.grandAssessment.id
                                  ? 'bg-white text-amber-800'
                                  : 'bg-amber-500 text-white'
                              }`}>
                                대단원 평가 풀기 →
                              </span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2 border-t border-amber-200 flex items-center justify-between text-xs text-slate-500">
                    <span>💡 원하시는 단원이나 평가를 누르면 즉시 맞춤 문제와 풀이가 열립니다.</span>
                    <button
                      type="button"
                      onClick={() => setIsUnitSelectorOpen(false)}
                      className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-bold"
                    >
                      닫기
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Active Selection Breadcrumb & Quick Filter Pills */}
          <div className="flex items-center justify-between flex-wrap gap-2 bg-white p-2.5 rounded-2xl border border-amber-200 shadow-2xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-black text-slate-500">현재 단원:</span>
              {activeChapterObj ? (
                <span className="px-2.5 py-0.5 rounded-lg bg-blue-100 text-blue-900 text-xs font-black flex items-center gap-1">
                  <span>{activeChapterObj.fullName}</span>
                  {activeSubUnitObj && <span>&gt; {activeSubUnitObj.title}</span>}
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold">
                  전체 단원
                </span>
              )}

              {selectedCategoryFilter !== 'all' && (
                <span className="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-900 text-xs font-black">
                  [{selectedCategoryFilter}]
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {(activeChapterObj || selectedCategoryFilter !== 'all') && (
                <button
                  type="button"
                  onClick={handleResetUnitFilter}
                  className="text-[11px] font-bold text-slate-400 hover:text-slate-700 flex items-center gap-0.5 px-2 py-0.5 rounded-md hover:bg-slate-100"
                >
                  <X className="w-3 h-3" />
                  <span>필터 초기화</span>
                </button>
              )}

              <span className="text-xs font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                {filteredProblems.length}문제 수록
              </span>
            </div>
          </div>

          {/* Unit Test Direct Link Banner (if matching quiz exists) */}
          {matchingQuizForSelection && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-2xl text-white shadow-md flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🏆</span>
                <div>
                  <span className="text-xs font-black block">
                    {matchingQuizForSelection.unitName} 실전 TEST 준비 완료!
                  </span>
                  <span className="text-[11px] text-amber-100 font-medium">
                    {matchingQuizForSelection.questions.length}문항 실전 테스트를 바로 풀어보고 자동 채점해 보세요.
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedQuiz(matchingQuizForSelection)}
                className="px-3 py-1.5 rounded-xl bg-white text-amber-900 text-xs font-black shadow-sm hover:bg-amber-50 active:scale-95 transition-all shrink-0 ml-2"
              >
                TEST 시작하기 →
              </button>
            </motion.div>
          )}

          {/* Problem Cards List */}
          <div className="space-y-3">
            {filteredProblems.length === 0 ? (
              <div className="p-10 text-center bg-white rounded-3xl border-2 border-dashed border-amber-200 space-y-3">
                <span className="text-3xl block">🔍</span>
                <p className="text-sm font-bold text-slate-800">
                  선택하신 단원의 등록된 교과서 문제가 없습니다.
                </p>
                {userRole === 'admin' ? (
                  <>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      선생님 권한으로 이 단원의 새 중단원 마무리 또는 대단원 평가 문제와 단계별 풀이를 직접 등록할 수 있습니다.
                    </p>
                    <button
                      onClick={() => setShowAddProblemModal(true)}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95"
                    >
                      + 이 단원에 새 문제 & 풀이 등록하기
                    </button>
                  </>
                ) : (
                  <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                    다른 단원을 선택하시거나, 상단 돋보기 버튼을 눌러 원하는 중단원 마무리/대단원 평가 문제를 골라보세요!
                  </p>
                )}
              </div>
            ) : (
              filteredProblems.map((prob) => {
                const isBookmarked = bookmarkedProblemIds.includes(prob.id);
                return (
                  <div
                    key={prob.id}
                    onClick={() => onSelectProblem(prob)}
                    className="p-4 bg-white rounded-2xl border-2 border-amber-200/90 hover:border-blue-400 hover:shadow-md cursor-pointer transition-all space-y-2.5 group"
                  >
                    {/* Header row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                          p.{prob.pageNumber}
                        </span>
                        <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                          prob.problemNumber.includes('대단원')
                            ? 'bg-amber-500 text-white'
                            : 'bg-amber-100 text-amber-900'
                        }`}>
                          {prob.problemNumber}
                        </span>
                        <span className="text-[11px] text-slate-500 font-semibold">
                          [{prob.problemType}]
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {userRole === 'admin' && (
                          <div className="flex items-center gap-1">
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 text-[10px] font-black border border-amber-400 flex items-center gap-0.5">
                              <ShieldCheck className="w-3 h-3 text-amber-600" />
                              <span>선생님 검수</span>
                            </span>
                            {onDeleteProblem && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm(`'p.${prob.pageNumber} ${prob.problemNumber}' 문제를 목록에서 삭제하시겠습니까? (관리자 전용)`)) {
                                    onDeleteProblem(prob.id);
                                  }
                                }}
                                className="p-1 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                                title="관리자 권한으로 문제 삭제"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                        <span className="text-[11px] font-bold text-slate-400">
                          난이도: <span className="text-amber-600 font-black">{prob.difficulty}</span>
                        </span>
                        {isBookmarked && (
                          <span className="text-xs text-amber-500">⭐️</span>
                        )}
                      </div>
                    </div>

                    {/* Unit Name */}
                    <h3 className="text-xs font-bold text-slate-500 flex items-center gap-1">
                      <span className="text-blue-600 font-black">{prob.chapter}</span>
                      <span>·</span>
                      <span>{prob.unitName}</span>
                    </h3>

                    {/* Problem text snippet */}
                    <p className="text-xs sm:text-sm font-semibold text-slate-800 line-clamp-2 leading-relaxed">
                      {prob.problemText}
                    </p>

                    {/* Bottom row */}
                    <div className="pt-1 flex items-center justify-between border-t border-slate-100 text-xs">
                      <div className="flex items-center gap-2 text-slate-500 font-medium">
                        <span>💡 친구 꿀팁 {prob.peerTips?.length || 0}개</span>
                        <span>•</span>
                        <span className="text-emerald-600 font-bold">정답 & 단계별 풀이 제공</span>
                      </div>

                      <span className="font-black text-blue-600 group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                        풀이 보기 <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* TAB 2: 단원별 실전 마스터 TEST */}
      {/* ========================================================== */}
      {activeTab === 'unit_tests' && (
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="px-2.5 py-0.5 bg-white/20 text-[10px] font-black rounded-full uppercase tracking-wider">
                {subject === 'math' ? '미래엔 공통수학 2' : '비상교육 통합과학 2'} 대단원 실전 TEST
              </span>
              <h3 className="text-base sm:text-lg font-black tracking-tight">
                대단원(큰 단원)별 실전 TEST로 나의 실력을 점검하세요!
              </h3>
              <p className="text-xs text-amber-100 font-medium">
                작은 단원(소단원/중단원)을 통합한 큰 단원별 평가이며, 선생님(관리자)이 직접 문제를 출제·관리할 수 있습니다.
              </p>
            </div>
            {userRole === 'admin' && (
              <button
                type="button"
                onClick={() => handleOpenAddQuizQuestion()}
                className="px-4 py-2.5 bg-white text-amber-700 hover:bg-amber-50 rounded-2xl text-xs font-black shadow-md flex items-center gap-1.5 shrink-0 active:scale-95 transition-all"
              >
                <PlusCircle className="w-4 h-4 text-amber-600" />
                <span>+ 새 TEST 문제 출제</span>
              </button>
            )}
          </div>

          {/* Big Chapters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {subjectQuizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="p-5 bg-white rounded-3xl border-2 border-amber-200/90 hover:border-amber-400 hover:shadow-lg transition-all flex flex-col justify-between space-y-4 relative group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-amber-100 text-amber-900 border border-amber-200">
                      {quiz.unitCode} (대단원)
                    </span>
                    <span className="text-[11px] font-bold text-slate-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-600" />
                      <span>{quiz.estimatedMinutes === 0 ? '무제한' : `${quiz.estimatedMinutes}분`}</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-xs text-slate-500 font-bold block">
                      {quiz.chapterName}
                    </span>
                    <h4 className="text-base font-black text-slate-900 mt-0.5">
                      {quiz.unitName}
                    </h4>
                  </div>

                  <p className="text-xs text-slate-600 font-medium line-clamp-2 leading-relaxed bg-amber-50/50 p-2.5 rounded-xl border border-amber-100">
                    {quiz.description || '대단원 전체 종합 평가 및 실전 모의 테스트'}
                  </p>

                  <div className="flex items-center flex-wrap gap-2 text-xs font-bold text-slate-600 pt-1">
                    <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700">
                      출제 문항: <strong className="text-amber-600">{quiz.questions.length}</strong>개
                    </span>
                    <span className="text-emerald-600 flex items-center gap-0.5 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 자동 채점
                    </span>
                    <span className="text-amber-700 flex items-center gap-0.5 text-[11px] bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      <Camera className="w-3 h-3 text-amber-600" /> 사진 첨부 풀이
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  {/* Start Test Button */}
                  <button
                    type="button"
                    onClick={() => setSelectedQuiz(quiz)}
                    className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-2xl text-xs font-black shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                  >
                    <span>TEST 응시하기 ({quiz.questions.length}문항 · {quiz.estimatedMinutes === 0 ? '자유 풀이' : `${quiz.estimatedMinutes}분`})</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  {/* Admin Controls */}
                  {userRole === 'admin' && (
                    <div className="space-y-1.5 pt-1">
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenAddQuizQuestion(quiz.id)}
                          className="py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-[11px] font-bold border border-amber-200 flex items-center justify-center gap-1 transition-all"
                        >
                          <PlusCircle className="w-3 h-3 text-amber-600" />
                          <span>문제 출제</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedQuizForManage(quiz);
                            setShowManageQuizModal(true);
                          }}
                          className="py-1.5 px-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-[11px] font-bold border border-slate-200 flex items-center justify-center gap-1 transition-all"
                        >
                          <span>문항 관리 ({quiz.questions.length})</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenEditQuizTime(quiz)}
                        className="w-full py-1.5 px-2 bg-orange-50 hover:bg-orange-100 text-orange-900 rounded-xl text-[11px] font-bold border border-orange-200 flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Clock className="w-3.5 h-3.5 text-orange-600" />
                        <span>⏱️ 시험 시간 설정 ({quiz.estimatedMinutes === 0 ? '무제한' : `${quiz.estimatedMinutes}분`})</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Admin Edit Quiz Duration */}
      <AnimatePresence>
        {showEditQuizTimeModal && editingQuizForTime && (
          <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-[#FFFDF9] rounded-3xl shadow-2xl border-4 border-amber-200 overflow-hidden flex flex-col"
            >
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-4 text-white flex items-center justify-between shadow-md">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-200" />
                  <div>
                    <h3 className="text-base font-black">대단원 TEST 제한 시간 설정</h3>
                    <p className="text-[11px] text-amber-100 font-medium">
                      {editingQuizForTime.chapterName} · {editingQuizForTime.unitName}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEditQuizTimeModal(false)}
                  className="p-1 rounded-lg hover:bg-white/20 text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveQuizTime} className="p-5 space-y-4">
                <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-950 font-medium space-y-1">
                  <p className="font-bold flex items-center gap-1 text-amber-900">
                    <span>💡</span> 시험 시간 작동 방식
                  </p>
                  <p className="leading-relaxed">
                    선생님이 설정한 시험 시간이 학생 화면 상단에 실시간 카운트다운 타이머로 표시됩니다.
                    시간이 종료되면 풀던 답안이 자동으로 채점 처리됩니다.
                  </p>
                </div>

                {/* Preset Time Buttons */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-800 block">
                    빠른 시간 프리셋 선택
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[5, 10, 15, 20, 30, 45, 60, 0].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setCustomQuizMinutes(mins)}
                        className={`py-2 px-1 rounded-xl text-xs font-black border transition-all ${
                          customQuizMinutes === mins
                            ? 'bg-amber-500 text-white border-amber-600 shadow-sm scale-105'
                            : 'bg-white text-slate-700 border-amber-200 hover:bg-amber-50 hover:border-amber-400'
                        }`}
                      >
                        {mins === 0 ? '무제한' : `${mins}분`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Number Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-800 flex items-center justify-between">
                    <span>직접 분(Minute) 입력</span>
                    <span className="text-[11px] text-amber-600 font-bold">
                      {customQuizMinutes === 0 ? '시간 제한 없음' : `현재 설정: ${customQuizMinutes}분`}
                    </span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      min="0"
                      max="180"
                      value={customQuizMinutes}
                      onChange={(e) => setCustomQuizMinutes(Number(e.target.value))}
                      placeholder="0은 무제한 (최대 180분)"
                      className="w-full p-3 rounded-2xl border-2 border-amber-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 outline-none text-sm font-bold text-slate-900"
                    />
                    <span className="absolute right-4 text-xs font-black text-slate-400">
                      분 (mins)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">
                    * 0을 입력하시면 타이머 없이 무제한으로 문제를 풀 수 있습니다.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-amber-200">
                  <button
                    type="button"
                    onClick={() => setShowEditQuizTimeModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-black shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>설정 저장하기</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Unit Test Modal */}
      <AnimatePresence>
        {selectedQuiz && (
          <UnitTestModal
            quiz={selectedQuiz}
            onClose={() => setSelectedQuiz(null)}
            onCompleteQuiz={(_score, _total, attempt) => {
              if (attempt && onCompleteQuiz) {
                onCompleteQuiz(attempt);
              }
            }}
          />
        )}
      </AnimatePresence>

      {/* Modal: Admin Add Quiz Question */}
      <AnimatePresence>
        {showAddQuizModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#FFFDF9] rounded-3xl shadow-2xl border-4 border-amber-200 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 text-white flex items-center justify-between shadow-md">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📝</span>
                  <h3 className="text-base font-black">
                    대단원 실전 TEST 문제 직접 출제 (선생님/관리자)
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddQuizModal(false)}
                  className="p-1 rounded-lg hover:bg-white/20"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveQuizQuestion} className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
                {/* Target Big Chapter Selector */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    출제할 대단원(큰 단원) 선택
                  </label>
                  <select
                    value={targetQuizIdForAdd}
                    onChange={(e) => setTargetQuizIdForAdd(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white rounded-xl border border-amber-300 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    {subjectQuizzes.map((q) => (
                      <option key={q.id} value={q.id}>
                        {q.unitCode} - {q.chapterName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Question Text */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    문제 지문 / 내용 <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    placeholder="대단원 실전 문제 질문과 지문을 입력해주세요..."
                    value={newQuizQuestionText}
                    onChange={(e) => setNewQuizQuestionText(e.target.value)}
                    rows={3}
                    required
                    className="w-full px-3 py-2.5 bg-white rounded-xl border border-amber-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                {/* Question Image Attachment (Diagram / Graphic) */}
                <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
                      <span>문제 도형/지문 사진 첨부 (선택)</span>
                    </label>
                    {newQuizQuestionImage && (
                      <button
                        type="button"
                        onClick={() => setNewQuizQuestionImage(null)}
                        className="text-[11px] text-rose-600 font-bold hover:underline flex items-center gap-0.5"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>사진 제거</span>
                      </button>
                    )}
                  </div>

                  <input
                    ref={quizQuestionFileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        if (typeof ev.target?.result === 'string') {
                          setNewQuizQuestionImage(ev.target.result);
                        }
                      };
                      reader.readAsDataURL(file);
                      e.target.value = '';
                    }}
                  />

                  {newQuizQuestionImage ? (
                    <div className="relative rounded-xl overflow-hidden border border-amber-300 max-h-32 bg-white flex items-center justify-center">
                      <img
                        src={newQuizQuestionImage}
                        alt="문제 사진 미리보기"
                        className="max-h-32 object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => quizQuestionFileInputRef.current?.click()}
                      className="w-full py-2 px-3 bg-white border border-dashed border-amber-300 hover:bg-amber-50/50 rounded-xl text-xs font-bold text-amber-900 flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Camera className="w-3.5 h-3.5 text-amber-600" />
                      <span>문제 그림/도형/지문 사진 파일 첨부하기</span>
                    </button>
                  )}
                </div>

                {/* 4 Choices */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">
                      보기 4지선다 입력 및 정답 선택 <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-amber-700 font-bold">
                      정답인 보기 앞 라디오 버튼을 체크하세요
                    </span>
                  </div>

                  {[
                    { val: newQuizOpt1, setVal: setNewQuizOpt1, idx: 0, label: '①번 보기' },
                    { val: newQuizOpt2, setVal: setNewQuizOpt2, idx: 1, label: '②번 보기' },
                    { val: newQuizOpt3, setVal: setNewQuizOpt3, idx: 2, label: '③번 보기' },
                    { val: newQuizOpt4, setVal: setNewQuizOpt4, idx: 3, label: '④번 보기' },
                  ].map((optItem) => (
                    <div key={optItem.idx} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setNewQuizCorrectIdx(optItem.idx)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-black border transition-all flex items-center gap-1 shrink-0 ${
                          newQuizCorrectIdx === optItem.idx
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {newQuizCorrectIdx === optItem.idx ? '✓ 정답' : `${optItem.idx + 1}번`}
                      </button>
                      <input
                        type="text"
                        placeholder={`${optItem.label} 내용을 입력하세요`}
                        value={optItem.val}
                        onChange={(e) => optItem.setVal(e.target.value)}
                        required={optItem.idx < 2}
                        className="flex-1 px-3 py-2 bg-white rounded-xl border border-amber-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                    </div>
                  ))}
                </div>

                {/* Explanation */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    정답 해설 및 풀이 과정
                  </label>
                  <textarea
                    placeholder="학생들이 풀이를 마친 후 확인할 상세 해설을 입력하세요..."
                    value={newQuizExplanation}
                    onChange={(e) => setNewQuizExplanation(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-amber-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                {/* Explanation Image Attachment */}
                <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
                      <span>해설 풀이 과정/손글씨 사진 첨부 (선택)</span>
                    </label>
                    {newQuizExplanationImage && (
                      <button
                        type="button"
                        onClick={() => setNewQuizExplanationImage(null)}
                        className="text-[11px] text-rose-600 font-bold hover:underline flex items-center gap-0.5"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>사진 제거</span>
                      </button>
                    )}
                  </div>

                  <input
                    ref={quizExplanationFileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        if (typeof ev.target?.result === 'string') {
                          setNewQuizExplanationImage(ev.target.result);
                        }
                      };
                      reader.readAsDataURL(file);
                      e.target.value = '';
                    }}
                  />

                  {newQuizExplanationImage ? (
                    <div className="relative rounded-xl overflow-hidden border border-amber-300 max-h-32 bg-white flex items-center justify-center">
                      <img
                        src={newQuizExplanationImage}
                        alt="해설 사진 미리보기"
                        className="max-h-32 object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => quizExplanationFileInputRef.current?.click()}
                      className="w-full py-2 px-3 bg-white border border-dashed border-amber-300 hover:bg-amber-50/50 rounded-xl text-xs font-bold text-amber-900 flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Camera className="w-3.5 h-3.5 text-amber-600" />
                      <span>해설/손글씨 풀이 사진 파일 첨부하기</span>
                    </button>
                  )}
                </div>

                {/* Hint */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    풀이 힌트 / 공식 팁 (선택)
                  </label>
                  <input
                    type="text"
                    placeholder="예: 두 점 사이의 거리 공식 d = √((x2-x1)² + (y2-y1)²) 활용"
                    value={newQuizHint}
                    onChange={(e) => setNewQuizHint(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-amber-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                {/* Submit Buttons */}
                <div className="pt-2 flex items-center justify-end gap-2 border-t border-amber-100">
                  <button
                    type="button"
                    onClick={() => setShowAddQuizModal(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black shadow-md active:scale-95 transition-all"
                  >
                    대단원 TEST에 문제 등록
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Admin Manage Questions for a Big Chapter */}
      <AnimatePresence>
        {showManageQuizModal && selectedQuizForManage && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-[#FFFDF9] rounded-3xl shadow-2xl border-4 border-amber-200 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="bg-amber-500 p-4 text-white flex items-center justify-between shadow-md">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-white/20 rounded-full">
                    {selectedQuizForManage.unitCode} 문항 관리
                  </span>
                  <h3 className="text-base font-black">
                    {selectedQuizForManage.chapterName} 출제 문제 목록
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowManageQuizModal(false)}
                  className="p-1 rounded-lg hover:bg-white/20"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
                {/* Quiz Duration Admin Control Banner inside Manage Modal */}
                <div className="p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-amber-200 text-amber-900">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-amber-950 block">
                        시험 제한 시간: {selectedQuizForManage.estimatedMinutes === 0 ? '무제한 (자유 풀이)' : `${selectedQuizForManage.estimatedMinutes}분`}
                      </span>
                      <span className="text-[11px] text-amber-800 font-medium">
                        시험 시작 시 카운트다운 타이머가 작동하며 시간 종료 시 자동 채점됩니다.
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenEditQuizTime(selectedQuizForManage)}
                    className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black shadow-xs flex items-center gap-1.5 shrink-0 transition-all active:scale-95"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>시간 변경</span>
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-200">
                  <span className="text-xs font-bold text-slate-600">
                    현재 등록된 문제: <strong>{selectedQuizForManage.questions.length}</strong>개
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setShowManageQuizModal(false);
                      handleOpenAddQuizQuestion(selectedQuizForManage.id);
                    }}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black shadow-xs flex items-center gap-1"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>+ 새 문제 추가 출제</span>
                  </button>
                </div>

                {selectedQuizForManage.questions.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 space-y-2">
                    <p className="text-2xl">📭</p>
                    <p className="text-xs font-bold">등록된 문제가 없습니다. 새로운 문제를 출제해보세요!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedQuizForManage.questions.map((q, idx) => (
                      <div
                        key={q.id}
                        className="p-4 bg-white rounded-2xl border-2 border-slate-200 space-y-3 shadow-2xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded-lg text-xs font-black">
                              Q{idx + 1}
                            </span>
                            <span className="text-xs font-bold text-slate-800">
                              {q.questionText}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteQuizQuestion(selectedQuizForManage.id, q.id)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                            title="문제 삭제"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Options preview */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                          {q.options.map((opt, optIdx) => (
                            <div
                              key={optIdx}
                              className={`p-2 rounded-xl text-xs font-medium flex items-center gap-2 border ${
                                optIdx === q.correctIndex
                                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-bold'
                                  : 'bg-slate-50 text-slate-600 border-slate-200'
                              }`}
                            >
                              <span
                                className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                                  optIdx === q.correctIndex
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-200 text-slate-600'
                                }`}
                              >
                                {optIdx + 1}
                              </span>
                              <span>{opt}</span>
                              {optIdx === q.correctIndex && (
                                <span className="ml-auto text-[10px] text-emerald-600 font-black">
                                  ✓ 정답
                                </span>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Explanation */}
                        {q.explanation && (
                          <div className="p-2.5 bg-amber-50/60 rounded-xl text-[11px] text-slate-700 border border-amber-100">
                            <strong className="text-amber-800">해설:</strong> {q.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowManageQuizModal(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-300"
                >
                  닫기
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Add New Problem & Solution (Admin only) */}
      <AnimatePresence>
        {showAddProblemModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#FFFDF9] rounded-3xl shadow-2xl border-4 border-amber-200 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="bg-amber-500 p-4 text-white flex items-center justify-between shadow-md">
                <div className="flex items-center gap-2">
                  <span className="text-xl">✍️</span>
                  <h3 className="text-base font-black">교과서 문제 & 단계별 풀이 등록 (관리자)</h3>
                </div>
                <button
                  onClick={() => setShowAddProblemModal(false)}
                  className="p-1 rounded-lg hover:bg-white/20"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateProblem} className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3">
                {/* Chapter & Unit Selectors */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">단원 선택</label>
                  <select
                    value={newChapterName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewChapterName(val);
                      if (val.includes('도형')) {
                        setNewUnitName('1. 평면좌표와 직선의 방정식');
                      } else if (val.includes('집합')) {
                        setNewUnitName('1. 집합');
                      } else if (val.includes('함수')) {
                        setNewUnitName('1. 함수');
                      } else if (val.includes('변화와 다양성')) {
                        setNewUnitName('1. 지구 환경 변화와 생물다양성');
                      } else if (val.includes('환경과 에너지')) {
                        setNewUnitName('1. 생태계와 환경 변화');
                      } else if (val.includes('과학과 미래 사회')) {
                        setNewUnitName('1. 과학 기술의 활용');
                      }
                    }}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-amber-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    {subject === 'math' ? (
                      <>
                        <option value="I. 도형의 방정식">1단원: I. 도형의 방정식</option>
                        <option value="II. 집합과 명제">2단원: II. 집합과 명제</option>
                        <option value="III. 함수와 그래프">3단원: III. 함수와 그래프</option>
                      </>
                    ) : (
                      <>
                        <option value="I. 변화와 다양성">1단원: I. 변화와 다양성</option>
                        <option value="II. 환경과 에너지">2단원: II. 환경과 에너지</option>
                        <option value="III. 과학과 미래 사회">3단원: III. 과학과 미래 사회</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">세부 단원명</label>
                    <input
                      type="text"
                      placeholder="예: 2. 원의 방정식"
                      value={newUnitName}
                      onChange={(e) => setNewUnitName(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-white rounded-xl border border-amber-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">문제 분류</label>
                    <select
                      value={newProbType}
                      onChange={(e) => setNewProbType(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-amber-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                    >
                      <option value="중단원 마무리">중단원 마무리</option>
                      <option value="대단원 평가">대단원 평가</option>
                      <option value="발전/심화 문제">발전/심화 문제</option>
                      <option value="개념 예제">개념 예제</option>
                      <option value="확인 문제">확인 문제</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">교과서 페이지</label>
                    <input
                      type="number"
                      placeholder="예: 52"
                      value={newPageNum}
                      onChange={(e) => setNewPageNum(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-white rounded-xl border border-amber-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">문제 번호</label>
                    <input
                      type="text"
                      placeholder="예: 중단원 마무리 03번"
                      value={newProbNum}
                      onChange={(e) => setNewProbNum(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-white rounded-xl border border-amber-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">문제 내용</label>
                  <textarea
                    placeholder="교과서 문제 지문을 입력해주세요..."
                    value={newProbText}
                    onChange={(e) => setNewProbText(e.target.value)}
                    rows={3}
                    required
                    className="w-full px-3 py-2 bg-white rounded-xl border border-amber-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">1단계 풀이 (핵심 식 & 공식)</label>
                  <textarea
                    placeholder="적용 공식 및 식 세우기..."
                    value={newStep1}
                    onChange={(e) => setNewStep1(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-amber-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">2단계 풀이 (식 전개 및 도출)</label>
                  <textarea
                    placeholder="풀이 전개 과정을 입력하세요..."
                    value={newStep2}
                    onChange={(e) => setNewStep2(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-amber-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">최종 정답</label>
                  <input
                    type="text"
                    placeholder="예: k = 4, (2, -3)"
                    value={newFinalAns}
                    onChange={(e) => setNewFinalAns(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white rounded-xl border border-amber-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                {/* Solution Photo Attachment */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    손글씨 풀이 / 해설 사진 첨부 (선택)
                  </label>
                  {newSolutionImage ? (
                    <div className="relative rounded-2xl border-2 border-amber-300 bg-slate-900 p-2 overflow-hidden flex flex-col items-center">
                      <img
                        src={newSolutionImage}
                        alt="풀이 첨부 사진"
                        className="max-h-48 rounded-xl object-contain w-full"
                      />
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => setZoomImage(newSolutionImage)}
                          className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                        >
                          <Maximize2 className="w-3 h-3" /> 크게 보기
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewSolutionImage(null)}
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
                        onClick={() => cameraInputRef.current?.click()}
                        className="flex-1 py-2 px-3 bg-amber-50 hover:bg-amber-100/80 border border-amber-300 rounded-xl text-xs font-bold text-amber-900 flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-2xs"
                      >
                        <Camera className="w-4 h-4 text-amber-600" />
                        <span>카메라로 바로 촬영</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-2xs"
                      >
                        <Upload className="w-4 h-4 text-slate-500" />
                        <span>사진 파일 찾기</span>
                      </button>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageFileRead(file);
                    }}
                    className="hidden"
                  />
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageFileRead(file);
                    }}
                    className="hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">친구들을 위한 풀이 팁 (선택)</label>
                  <input
                    type="text"
                    placeholder="예: 상수항 부호 실수에 주의하세요!"
                    value={newTip}
                    onChange={(e) => setNewTip(e.target.value)}
                    className="w-full px-3 py-2 bg-white rounded-xl border border-amber-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddProblemModal(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-500 text-white rounded-xl text-xs font-black shadow-md hover:bg-amber-600 active:scale-95"
                  >
                    등록 완료
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Enlarged Photo Lightbox Modal */}
      <AnimatePresence>
        {zoomImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomImage(null)}
            className="fixed inset-0 z-70 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl max-h-[90vh] bg-slate-950 rounded-2xl overflow-hidden border border-white/20 flex flex-col items-center shadow-2xl"
            >
              <button
                onClick={() => setZoomImage(null)}
                className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-colors shadow-md"
              >
                <X className="w-5 h-5" />
              </button>
              <img
                src={zoomImage}
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
