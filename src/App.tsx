import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { TEXTBOOKS, getStoredProblems } from './data/mockTextbooks';
import { getStoredQuestions } from './data/mockCommunityQuestions';
import { getStoredInterestingFacts } from './data/mockInterestingFacts';
import { ProblemItem, TextbookInfo, UserProfile, AIQuestionResult, CommunityQuestion, TeacherAnswer, InterestingFactItem, QuizAttemptRecord } from './types';
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

  // Persistent State (초기값을 안전하게 빈 배열 []로 설정)
  const [problems, setProblems] = useState<ProblemItem[]>([]);
  const [communityQuestions, setCommunityQuestions] = useState<CommunityQuestion[]>([]);
  const [interestingFacts, setInterestingFacts] = useState<InterestingFactItem[]>([]);

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('puleo_user_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (
          Array.isArray(parsed.bookmarkedProblemIds) &&
          parsed.bookmarkedProblemIds.length === 2 &&
          parsed.bookmarkedProblemIds[0] === 'prob-math-1' &&
          parsed.bookmarkedProblemIds[1] === 'prob-sci-1'
        ) {
          parsed.bookmarkedProblemIds = [];
        }
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

  // Supabase 클라우드 데이터 비동기 로드
  useEffect(() => {
    async function fetchSupabaseData() {
      try {
        const [pData, qData, fData] = await Promise.all([
          getStoredProblems(),
          getStoredQuestions(),
          getStoredInterestingFacts(),
        ]);
        setProblems(Array.isArray(pData) ? pData : []);
        setCommunityQuestions(Array.isArray(qData) ? qData : []);
        setInterestingFacts(Array.isArray(fData) ? fData : []);
      } catch (error) {
        console.error('Supabase 데이터 로드 실패:', error);
      }
    }

    if (isLoggedIn) {
      fetchSupabaseData();
    }
  }, [isLoggedIn]);

  // 로컬 사용자 프로필 저장
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

      const newWrongQuestionIds = new Set(attempt.wrongAnswers.map((w) => w.questionId));
      const remainingOldWrong = currentWrong.filter((w) => {
        if (w.quizId === attempt.quizId) {
          return newWrongQuestionIds.has(w.questionId);
        }
        return true;
      });

      const updatedWrong = [
        ...attempt.wrongAnswers,
        ...remainingOldWrong.filter((w) => !newWrongQuestionIds.has(w.questionId)),
      ];

      return {
        ...prev,
        solvedCount: prev.solvedCount + 1,
        quizAttempts: updatedAttempts,
        wrongQuizQuestions: updatedWrong,
      };
    });
  };

  const handleAddNewProblem = (newProb: ProblemItem, autoOpen = false) => {
    setProblems((prev) => [newProb, ...prev]);
    if (autoOpen) {
      setSelectedProblem(newProb);
    }
  };

  const handleAddNewProblems = (newProbs: ProblemItem[]) => {
    if (!newProbs || newProbs.length === 0) return;
    setProblems((prev) => [...newProbs, ...prev]);
  };

  const handleDeleteProblem = (problemId: string) => {
    setProblems((prev) => prev.filter((p) => p.id !== problemId));
    if (selectedProblem?.id === problemId) {
      setSelectedProblem(null);
    }
  };

  const handleAddNewFact = (newFact: InterestingFactItem) => {
    setInterestingFacts((prev) => [newFact, ...prev]);
  };

  const handleDeleteFact = (factId: string) => {
    setInterestingFacts((prev) => prev.filter((f) => f.id !== factId));
  };

  const handleToggleLikeFact = (factId: string) => {
    const activeUserId = userProfile.id || userProfile.loginId || 'user_account_default';
    setInterestingFacts((prev) =>
      prev.map((f) => {
        if (f.id !== factId) return f;
        const currentLikedUsers = Array.isArray(f.likedUserIds) ? f.likedUserIds : [];
        const isAlreadyLiked = currentLikedUsers.includes(activeUserId);

        if (isAlreadyLiked) {
          const updatedUsers = currentLikedUsers.filter((uid) => uid !== activeUserId);
          return {
            ...f,
            likes: Math.max(0, (f.likes || 1) - 1),
            likedUserIds: updatedUsers,
          };
        } else {
          return {
            ...f,
            likes: (f.likes || 0) + 1,
            likedUserIds: [...currentLikedUsers, activeUserId],
          };
        }
      })
    );
  };

  const handleAddCommunityQuestion = (newQ: CommunityQuestion) => {
    setCommunityQuestions((prev) => [newQ, ...prev]);
  };

  const handleAnswerCommunityQuestion = (questionId: string, answer: TeacherAnswer) => {
    setCommunityQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? {
              ...q,
              status: 'answered',
              teacherAnswer: answer,
            }
          : q
      )
    );
  };

  const handleDeleteCommunityQuestion = (questionId: string) => {
    setCommunityQuestions((prev) => prev.filter((q) => q.id !== questionId));
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

  // 대기 중인 질문 수 계산 (안전장치 추가)
  const waitingCount = (Array.isArray(communityQuestions) ? communityQuestions : []).filter(
    (q) => q.status === 'waiting' || q.status === '대기중'
  ).length;

  if (!isLoggedIn) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div id="puleo-dream-app" className="min-h-screen bg-[#F8F5EE] bg-[radial-gradient(#E8DFCA_1px,transparent_1px)] [background-size:24px_24px] text-slate-800 flex flex-col justify-between selection:bg-amber-200">
      <main className="flex-1 w-full flex flex-col items-center justify-start py-2 sm:py-4">
        <AnimatePresence mode="wait">
          {currentView === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="w-full"
            >
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

          {currentView === 'math' && (
            <motion.div
              key="math"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="w-full"
            >
              <TextbookMasterView
                subject="math"
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

          {currentView === 'science' && (
            <motion.div
              key="science"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="w-full"
            >
              <TextbookMasterView
                subject="science"
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

      {/* Problem Detail Modal */}
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

      {/* Ask Question Modal */}
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

      {/* Community Q&A Modal */}
      <AnimatePresence>
        {isQnAOpen && (
          <CommunityQnAModal
            userProfile={userProfile}
            questions={communityQuestions}
            onClose={() => setIsQnAOpen(false)}
            onAddQuestion={handleAddCommunityQuestion}
            onAnswerQuestion={handleAnswerCommunityQuestion}
            onDeleteQuestion={userProfile.role === 'admin' ? handleDeleteCommunityQuestion : undefined}
          />
        )}
      </AnimatePresence>

      {/* User Profile & Bookmarks Modal */}
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