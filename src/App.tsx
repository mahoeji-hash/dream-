import React, { useState, useEffect } from 'react';
import { 
  CommunityQuestion, 
  UserProfile, 
  SubjectType,
  TextbookInfo,
  ProblemItem
} from './types';
import
  {mockCommunityQuestions }
 from './data/mockCommunityQuestions';
import { 
  dbFetchCommunityQuestions, 
  dbSaveCommunityQuestion, 
  dbFetchTextbookProblems,
  dbSaveTextbookProblem
} from './services/dbService';

// 컴포넌트 불러오기
import PuleoDreamHeader from './components/PuleoDreamHeader';
import TextbookMasterView from './components/TextbookMasterView';
import CommunityQnAModal from './components/CommunityQnAModal';
import AskQuestionModal from './components/AskQuestionModal';
import UnitTestModal from './components/UnitTestModal';
import UserProfileModal from './components/UserProfileModal';
import InterestingFactsGallery from './components/InterestingFactsGallery';
import LoginScreen from './components/LoginScreen';
import ProblemDetailModal from './components/ProblemDetailModal';

// 기본 교과서 목록 (DB에 별도 테이블이 없어서 코드에 고정으로 정의)
const DEFAULT_TEXTBOOKS: TextbookInfo[] = [
  {
    id: 'tb-math-mr-h2',
    name: '미래엔 공통수학 2',
    publisher: '미래엔',
    subject: 'math',
    grade: 'high_1',
    category: '교과서',
    color: '#2563EB',
    badgeText: '수학',
    totalChapters: 5,
  },
  {
    id: 'tb-sci-bs-h1',
    name: '비상교육 통합과학 2',
    publisher: '비상교육',
    subject: 'science',
    grade: 'high_1',
    category: '교과서',
    color: '#059669',
    badgeText: '과학',
    totalChapters: 5,
  },
];

// DB row(snake_case) -> ProblemItem(camelCase) 변환 함수
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

export default function App() {
  // 1. 사용자 및 화면 상태
  const [currentUser, setCurrentUser] = useState<UserProfile | null>({
    id: 'user-1',
    role: 'student',
    nickname: '열공학생',
    schoolName: '대구화원고',
    grade: 'high_1',
    avatarSeed: 'user-1',
    solvedCount: 0,
    helpedCount: 0,
    bookmarkedProblemIds: [],
    historyQuestions: [],
  });
  const [selectedSubject, setSelectedSubject] = useState<SubjectType>('math');
  const [activeTab, setActiveTab] = useState<'textbook' | 'unittest' | 'facts'>('textbook');

  // 2. DB 데이터 상태
  const [communityQuestions, setCommunityQuestions] = useState<CommunityQuestion[]>(mockCommunityQuestions);
  const [problems, setProblems] = useState<ProblemItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [bookmarkedProblemIds, setBookmarkedProblemIds] = useState<string[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<ProblemItem | null>(null);

  // 3. 모달 제어 상태
  const [isQnAModalOpen, setIsQnAModalOpen] = useState<boolean>(false);
  const [isAskModalOpen, setIsAskModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isUnitTestModalOpen, setIsUnitTestModalOpen] = useState<boolean>(false);

  // 교과서 문제 DB 재로드 함수
  const handleRefreshProblems = async () => {
    const rows = await dbFetchTextbookProblems();
    setProblems(rows.map(mapDbRowToProblemItem));
  };

  // 4. 앱 로딩 시 Supabase DB 데이터 불러오기
  useEffect(() => {
    async function loadAllDbData() {
      setIsLoading(true);
      try {
        const qnaData = await dbFetchCommunityQuestions();
        if (qnaData && qnaData.length > 0) {
          setCommunityQuestions(qnaData);
        }

        const problemRows = await dbFetchTextbookProblems();
        setProblems(problemRows.map(mapDbRowToProblemItem));
      } catch (error) {
        console.error('DB 데이터를 불러오는 중 오류 발생:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadAllDbData();
  }, []);

  // 5. 질문 추가 핸들러 (커뮤니티 Q&A)
  const handleAddQuestion = async (newQuestion: any) => {
    const res = await dbSaveCommunityQuestion(newQuestion);
    if (res.success) {
      const refreshed = await dbFetchCommunityQuestions();
      setCommunityQuestions(refreshed);
      setIsAskModalOpen(false);
    } else {
      alert(`질문 저장 실패: ${res.error}`);
    }
  };

  // 6. 교과서 문제 추가 핸들러 (단일)
  const handleAddNewProblem = async (newProblem: ProblemItem) => {
    const res = await dbSaveTextbookProblem(newProblem);
    if (res.success) {
      await handleRefreshProblems();
    } else {
      alert(`문제 저장 실패: ${res.error}`);
    }
  };

  // 7. 교과서 문제 추가 핸들러 (일괄)
  const handleAddNewProblems = async (newProblems: ProblemItem[]) => {
    for (const p of newProblems) {
      await dbSaveTextbookProblem(p);
    }
    await handleRefreshProblems();
  };

  const handleToggleBookmark = (problemId: string) => {
    setBookmarkedProblemIds((prev) =>
      prev.includes(problemId) ? prev.filter((id) => id !== problemId) : [...prev, problemId]
    );
  };

  // 미로그인 상태 처리
  if (!currentUser) {
    return <LoginScreen onLogin={(user: UserProfile) => setCurrentUser(user)} />;
  }

  const activeTextbook = DEFAULT_TEXTBOOKS.find((tb) => tb.subject === selectedSubject);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* 헤더 바 */}
      <PuleoDreamHeader
        onOpenProfile={() => setIsProfileModalOpen(true)}
        userRole={currentUser.role}
        isHome={activeTab === 'textbook'}
      />

      {/* 메인 구역 */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        <TextbookMasterView
          subject={selectedSubject}
          textbooks={DEFAULT_TEXTBOOKS}
          problems={problems}
          bookmarkedProblemIds={bookmarkedProblemIds}
          userRole={currentUser.role}
          currentUserId={currentUser.id}
          onSelectProblem={(problem) => setSelectedProblem(problem)}
          onGoBack={() => {}}
          onAddNewProblem={handleAddNewProblem}
          onAddNewProblems={handleAddNewProblems}
        />
      </main>

      {/* 문제 상세 모달 */}
      {selectedProblem && (
        <ProblemDetailModal
          problem={selectedProblem}
          textbook={activeTextbook}
          isBookmarked={bookmarkedProblemIds.includes(selectedProblem.id)}
          userRole={currentUser.role}
          onToggleBookmark={handleToggleBookmark}
          onClose={() => setSelectedProblem(null)}
          onAskAIAboutProblem={() => setIsAskModalOpen(true)}
        />
      )}

      {/* 모달 모음 */}
      {isQnAModalOpen && (
        <CommunityQnAModal
          isOpen={isQnAModalOpen}
          onClose={() => setIsQnAModalOpen(false)}
          questions={communityQuestions}
          currentUser={currentUser}
          onOpenAskModal={() => setIsAskModalOpen(true)}
          onRefreshData={async () => {
            const data = await dbFetchCommunityQuestions();
            setCommunityQuestions(data);
          }}
        />
      )}

      {isAskModalOpen && (
        <AskQuestionModal
          isOpen={isAskModalOpen}
          onClose={() => setIsAskModalOpen(false)}
          onSubmit={handleAddQuestion}
          currentUser={currentUser}
        />
      )}

      {isProfileModalOpen && (
        <UserProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          currentUser={currentUser}
          onUpdateUser={(updated: UserProfile) => setCurrentUser(updated)}
        />
      )}

      {isUnitTestModalOpen && (
        <UnitTestModal
          isOpen={isUnitTestModalOpen}
          onClose={() => setIsUnitTestModalOpen(false)}
          subject={selectedSubject}
        />
      )}
    </div>
  );
}