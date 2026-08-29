import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { TEXTBOOKS } from './data/mockTextbooks';
import {
  ProblemItem,
  UserProfile,
  AIQuestionResult,
  CommunityQuestion,
  TeacherAnswer,
  InterestingFactItem,
  QuizAttemptRecord,
} from './types';
import { getStoredAccounts } from './services/authService';
import { HomeScreen } from './components/HomeScreen';
import { TextbookMasterView } from './components/TextbookMasterView';
import { ProblemDetailModal } from './components/ProblemDetailModal';
import { AskQuestionModal } from './components/AskQuestionModal';
import { UserProfileModal } from './components/UserProfileModal';
import { CommunityQnAModal } from './components/CommunityQnAModal';
import { LoginScreen } from './components/LoginScreen';

const DEFAULT_PROFILE: UserProfile = {
  role: 'student',
  nickname: '화원고열공이',
  schoolName: '대구화원고등학교',
  grade: 'high_1',
  avatarSeed: 'puppy',
  solvedCount: 0,
  helpedCount: 0,
  bookmarkedProblemIds: [],
  historyQuestions: [],
  quizAttempts: [],
  wrongQuizQuestions: [],
};

function mapDbRowToInterestingFact(row: any): InterestingFactItem {
  return {
    id: String(row.id),
    subject: row.subject,
    title: row.title,
    subtitle: row.subtitle || undefined,
    category: row.category,
    content: row.content,
    posterImage: row.poster_image || undefined,
    authorName: row.author_name || '선생님',
    createdAt: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : '',
    tags: row.tags || [],
    likes: row.likes || 0,
    likedUserIds: row.liked_user_ids || [],
    bgGradient: row.bg_gradient || undefined,
  };
}

// DB row(snake_case) -> ProblemItem(camelCase) 변환
function mapDbRowToProblemItem(row: any): ProblemItem {
  return {
    id: String(row.id),
    textbookId: row.textbook_id || '',
    subject: row.subject,
    grade: row.grade || 'high_1',
    chapter: row.chapter || '',
    unitNumber: row.unit_number || 0,
    unitName: row.unit_name || '',
    subUnitId: row.sub_unit_id || undefined,
    unitCode: row.unit_code || undefined,
    pageNumber: row.page_number || 0,
    problemNumber: row.problem_number || '',
    problemType: row.problem_type || '중단원 마무리',
    difficulty: row.difficulty || '보통',
    problemText: row.problem_text || '',
    solutionSteps: row.solution_steps || [],
    finalAnswer: row.final_answer || '',
    coreConcepts: row.core_concepts || [],
    dreamTip: row.dream_tip || '',
    solutionImage: row.solution_image || undefined,
    peerTips: [],
    studentSolutions: [],
    views: row.views || 0,
    likes: row.likes || 0,
  };
}

// DB row(snake_case) -> CommunityQuestion(camelCase) 변환
function mapDbRowToCommunityQuestion(row: any): CommunityQuestion {
  return {
    id: String(row.id),
    authorId: row.author_id || '',
    authorName: row.author_name || '익명',
    authorRole: row.author_role || 'student',
    authorSchool: row.author_school || '',
    authorGrade: row.author_grade || 'high_1',
    subject: row.subject || 'math',
    textbookRef: row.textbook_ref || undefined,
    title: row.title || '',
    content: row.content || '',
    imageUrl: row.image_url || undefined,
    createdAt: row.created_at
      ? new Date(row.created_at).toLocaleDateString('ko-KR', {
          month: 'numeric',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '',
    status: row.status || 'waiting',
    teacherAnswer: row.teacher_answer || undefined,
    likes: row.likes || 0,
  };
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const accounts = getStoredAccounts();
    if (accounts.length === 0) {
      localStorage.removeItem('puleo_is_logged_in');
      localStorage.removeItem('puleo_user_profile');
      return false;
    }
    const savedLogin = localStorage.getItem('puleo_is_logged_in');
    return savedLogin === 'true';
  });

  const [currentView, setCurrentView] = useState<'home' | 'math' | 'science'>('home');
  const [selectedProblem, setSelectedProblem] = useState<ProblemItem | null>(null);
  const [isAskQuestionOpen, setIsAskQuestionOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isQnAOpen, setIsQnAOpen] = useState(false);
  const [problemForAI, setProblemForAI] = useState<ProblemItem | null>(null);

  const [problems, setProblems] = useState<ProblemItem[]>([]);
  const [communityQuestions, setCommunityQuestions] = useState<CommunityQuestion[]>([]);
  const [interestingFacts, setInterestingFacts] = useState<InterestingFactItem[]>([]);

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('puleo_user_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_PROFILE,
          ...parsed,
          bookmarkedProblemIds: Array.isArray(parsed.bookmarkedProblemIds) ? parsed.bookmarkedProblemIds : [],
          quizAttempts: Array.isArray(parsed.quizAttempts) ? parsed.quizAttempts : [],
          wrongQuizQuestions: Array.isArray(parsed.wrongQuizQuestions) ? parsed.wrongQuizQuestions : [],
        };
      } catch (e) {
        return DEFAULT_PROFILE;
      }
    }
    return DEFAULT_PROFILE;
  });

  // Supabase 데이터 로드
  useEffect(() => {
  async function fetchAllData() {
    try {
      const [problemRows, qnaRows, factRows] = await Promise.all([
        dbFetchTextbookProblems(),
        dbFetchCommunityQuestions(),
        dbFetchInterestingFacts(),
      ]);
      setProblems(problemRows.map(mapDbRowToProblemItem));
      setCommunityQuestions(qnaRows.map(mapDbRowToCommunityQuestion));
      setInterestingFacts(factRows.map(mapDbRowToInterestingFact));
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    }
  }

  if (isLoggedIn) {
    fetchAllData();
  }
}, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('puleo_user_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('puleo_is_logged_in', isLoggedIn ? 'true' : 'false');
  }, [isLoggedIn]);

  const handleLoginSuccess = (profile: UserProfile) => {
    setUserProfile(profile);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsProfileOpen(false);
    setIsQnAOpen(false);
    setCurrentView('home');
  };

  const handleToggleBookmark = (problemId: string) => {
    setUserProfile((prev) => {
      const exists = prev.bookmarkedProblemIds.includes(problemId);
      const updated = exists
        ? prev.bookmarkedProblemIds.filter((id) => id !== problemId)
        : [...prev.bookmarkedProblemIds, problemId];
      return { ...prev, bookmarkedProblemIds: updated };
    });
  };

  const handleSaveAIQuestionResult = (result: AIQuestionResult) => {
    setUserProfile((prev) => ({
      ...prev,
      historyQuestions: [result, ...prev.historyQuestions],
      solvedCount: prev.solvedCount + 1,
    }));
  };

  const handleCompleteQuiz = (attempt: QuizAttemptRecord) => {
    setUserProfile((prev) => {
      const currentAttempts = prev.quizAttempts || [];
      const currentWrong = prev.wrongQuizQuestions || [];
      const updatedAttempts = [attempt, ...currentAttempts];
      const newWrongIds = new Set(attempt.wrongAnswers.map((w) => w.questionId));
      const remainingOldWrong = currentWrong.filter((w) => {
        if (w.quizId === attempt.quizId) return newWrongIds.has(w.questionId);
        return true;
      });
      const updatedWrong = [
        ...attempt.wrongAnswers,
        ...remainingOldWrong.filter((w) => !newWrongIds.has(w.questionId)),
      ];
      return {
        ...prev,
        solvedCount: prev.solvedCount + 1,
        quizAttempts: updatedAttempts,
        wrongQuizQuestions: updatedWrong,
      };
    });
  };

  // 교과서 문제 (Supabase)
  const handleRefreshProblems = async () => {
    const rows = await dbFetchTextbookProblems();
    setProblems(rows.map(mapDbRowToProblemItem));
  };

  const handleAddNewProblem = async (newProb: ProblemItem, autoOpen = false) => {
    const res = await dbSaveTextbookProblem(newProb);
    if (res.success) {
      await handleRefreshProblems();
      if (autoOpen) setSelectedProblem(newProb);
    } else {
      alert(`문제 저장 실패: ${res.error}`);
    }
  };

  const handleAddNewProblems = async (newProbs: ProblemItem[]) => {
    if (!newProbs || newProbs.length === 0) return;
    for (const p of newProbs) {
      await dbSaveTextbookProblem(p);
    }
    await handleRefreshProblems();
  };

  const handleDeleteProblem = (problemId: string) => {
    setProblems((prev) => prev.filter((p) => p.id !== problemId));
    if (selectedProblem?.id === problemId) {
      setSelectedProblem(null);
    }
  };

  // 흥미로운 사실 (로컬)
  const handleAddNewFact = async (newFact: InterestingFactItem) => {
  const res = await dbSaveInterestingFact(newFact);
  if (res.success) {
    const rows = await dbFetchInterestingFacts();
    setInterestingFacts(rows.map(mapDbRowToInterestingFact));
  } else {
    alert(`포스터 저장 실패: ${res.error}`);
  }
};

const handleDeleteFact = async (factId: string) => {
  const res = await dbDeleteInterestingFact(factId);
  if (res.success) {
    setInterestingFacts((prev) => prev.filter((f) => f.id !== factId));
  }
};

const handleToggleLikeFact = async (factId: string) => {
  const activeUserId = userProfile.id || userProfile.loginId || 'user_account_default';
  const fact = interestingFacts.find((f) => f.id === factId);
  const isLiked = !!(fact?.likedUserIds?.includes(activeUserId));

  setInterestingFacts((prev) =>
    prev.map((f) => {
      if (f.id !== factId) return f;
      const currentLikedUsers = Array.isArray(f.likedUserIds) ? f.likedUserIds : [];
      if (isLiked) {
        return {
          ...f,
          likes: Math.max(0, (f.likes || 1) - 1),
          likedUserIds: currentLikedUsers.filter((uid) => uid !== activeUserId),
        };
      }
      return {
        ...f,
        likes: (f.likes || 0) + 1,
        likedUserIds: [...currentLikedUsers, activeUserId],
      };
    })
  );

  await dbToggleLikeInterestingFact(factId, activeUserId, isLiked);
};

  // 커뮤니티 Q&A (Supabase)
  const handleAddCommunityQuestion = async (newQ: any) => {
    const res = await dbSaveCommunityQuestion(newQ);
    if (res.success) {
      const rows = await dbFetchCommunityQuestions();
      setCommunityQuestions(rows.map(mapDbRowToCommunityQuestion));
    } else {
      alert(`질문 저장 실패: ${res.error}`);
    }
  };

  const handleAnswerCommunityQuestion = async (questionId: string, answer: TeacherAnswer) => {
    const res = await dbAnswerCommunityQuestion(questionId, answer);
    if (res.success) {
      const rows = await dbFetchCommunityQuestions();
      setCommunityQuestions(rows.map(mapDbRowToCommunityQuestion));
    } else {
      alert(`답변 저장 실패: ${res.error}`);
    }
  };

  const handleDeleteCommunityQuestion = async (questionId: string) => {
    const res = await dbDeleteCommunityQuestion(questionId);
    if (res.success) {
      setCommunityQuestions((prev) => prev.filter((q) => q.id !== questionId));
    }
  };

  const handleToggleLikeCommunityQuestion = async (questionId: string, isLiked: boolean) => {
    await dbToggleLikeCommunityQuestion(questionId, !isLiked);
  };

  const handleAskAIAboutSpecificProblem = (problem: ProblemItem) => {
    setProblemForAI(problem);
    setSelectedProblem(null);
    setIsAskQuestionOpen(true);
  };

  const handleSelectHistoryQuestion = (historyItem: AIQuestionResult) => {
    setProblemForAI(null);
    setIsAskQuestionOpen(true);
  };

  const waitingCount = (Array.isArray(communityQuestions) ? communityQuestions : []).filter(
    (q) => q.status === 'waiting'
  ).length;

  if (!isLoggedIn) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div id="puleo-dream-app" className="min-h-screen bg-[#F8F5EE] bg-[radial-gradient(#E8DFCA_1px,transparent_1px)] [background-size:24px_24px] text-slate-800 flex flex-col justify-between selection:bg-amber-200">
      <main className="flex-1 w-full flex flex-col items-center justify-start py-2 sm:py-4">
        <AnimatePresence mode="wait">
          {currentView === 'home' && (
            <motion.div key="home" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} className="w-full">
              <HomeScreen
                onSelectMath={() => setCurrentView('math')}
                onSelectScience={() => setCurrentView('science')}
                onSelectAskQuestion={() => {
                  setProblemForAI(null);
                  setIsAskQuestionOpen(true);
                }}
                onSelectQnA={() => setIsQnAOpen(true)}
                onOpenProfile={() => setIsProfileOpen(true)}
                onLogout={handleLogout}
                userRole={userProfile.role}
                solvedCount={userProfile.solvedCount}
                waitingQuestionsCount={waitingCount}
              />
            </motion.div>
          )}

          {(currentView === 'math' || currentView === 'science') && (
            <motion.div key={currentView} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} className="w-full">
              <TextbookMasterView
                subject={currentView}
                textbooks={TEXTBOOKS}
                problems={problems}
                bookmarkedProblemIds={userProfile.bookmarkedProblemIds}
                userRole={userProfile.role}
                currentUserId={userProfile.id || userProfile.loginId || 'user_account_default'}
                facts={interestingFacts}
                onSelectProblem={(prob) => setSelectedProblem(prob)}
                onGoBack={() => setCurrentView('home')}
                onAddNewProblem={handleAddNewProblem}
                onAddNewProblems={handleAddNewProblems}
                onDeleteProblem={handleDeleteProblem}
                onAddNewFact={handleAddNewFact}
                onDeleteFact={handleDeleteFact}
                onToggleLikeFact={handleToggleLikeFact}
                onCompleteQuiz={handleCompleteQuiz}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {selectedProblem && (
          <ProblemDetailModal
            problem={selectedProblem}
            textbook={TEXTBOOKS.find((tb) => tb.id === selectedProblem.textbookId)}
            isBookmarked={userProfile.bookmarkedProblemIds.includes(selectedProblem.id)}
            userRole={userProfile.role}
            onToggleBookmark={handleToggleBookmark}
            onClose={() => setSelectedProblem(null)}
            onAskAIAboutProblem={handleAskAIAboutSpecificProblem}
            onDeleteProblem={userProfile.role === 'admin' ? handleDeleteProblem : undefined}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAskQuestionOpen && (
          <AskQuestionModal
            initialProblem={problemForAI}
            userProfile={userProfile}
            onClose={() => {
              setIsAskQuestionOpen(false);
              setProblemForAI(null);
            }}
            onSaveToHistory={handleSaveAIQuestionResult}
            onPostToCommunity={handleAddCommunityQuestion}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isQnAOpen && (
          <CommunityQnAModal
            userProfile={userProfile}
            questions={communityQuestions}
            onClose={() => setIsQnAOpen(false)}
            onAddQuestion={handleAddCommunityQuestion}
            onAnswerQuestion={handleAnswerCommunityQuestion}
            onDeleteQuestion={userProfile.role === 'admin' ? handleDeleteCommunityQuestion : undefined}
            onToggleLike={handleToggleLikeCommunityQuestion}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isProfileOpen && (
          <UserProfileModal
            userProfile={userProfile}
            problems={problems}
            onUpdateProfile={(updated) => setUserProfile((prev) => ({ ...prev, ...updated }))}
            onSelectProblem={(prob) => setSelectedProblem(prob)}
            onSelectHistoryQuestion={handleSelectHistoryQuestion}
            onLogout={handleLogout}
            onClose={() => setIsProfileOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}