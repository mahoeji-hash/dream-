import React, { useState, useEffect } from 'react';
import { 
  CommunityQuestion, 
  UserProfile, 
  SubjectType 
} from './types';
import
  {mockCommunityQuestions }
 from './data/mockCommunityQuestions';
import { 
  dbFetchCommunityQuestions, 
  dbSaveCommunityQuestion, 
  dbFetchTextbookQuestions 
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

export default function App() {
  // 1. 사용자 및 화면 상태
  const [currentUser, setCurrentUser] = useState<UserProfile | null>({
    id: 'user-1',
    name: '열공학생',
    role: 'student',
    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
  });
  const [selectedSubject, setSelectedSubject] = useState<SubjectType>('math');
  const [activeTab, setActiveTab] = useState<'textbook' | 'unittest' | 'facts'>('textbook');

  // 2. DB 데이터 상태
  const [communityQuestions, setCommunityQuestions] = useState<CommunityQuestion[]>(mockCommunityQuestions);
  const [textbookQuestions, setTextbookQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 3. 모달 제어 상태
  const [isQnAModalOpen, setIsQnAModalOpen] = useState<boolean>(false);
  const [isAskModalOpen, setIsAskModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isUnitTestModalOpen, setIsUnitTestModalOpen] = useState<boolean>(false);

  // 교과서 문제 DB 재로드 함수
  const handleRefreshTextbookQuestions = async () => {
    const textbookData = await dbFetchTextbookQuestions();
    if (textbookData) {
      setTextbookQuestions(textbookData);
    }
  };

  // 4. 앱 로딩 시 Supabase DB 데이터 불러오기
  useEffect(() => {
    async function loadAllDbData() {
      setIsLoading(true);
      try {
        // Q&A 목록 불러오기
        const qnaData = await dbFetchCommunityQuestions();
        if (qnaData && qnaData.length > 0) {
          setCommunityQuestions(qnaData);
        }

        // 교과서 문제 DB 불러오기
        const textbookData = await dbFetchTextbookQuestions();
        if (textbookData && textbookData.length > 0) {
          setTextbookQuestions(textbookData);
          console.log('교과서 문제 DB 동기화 완료:', textbookData);
        }
      } catch (error) {
        console.error('DB 데이터를 불러오는 중 오류 발생:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadAllDbData();
  }, []);

  // 5. 질문 추가 핸들러
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

  // 미로그인 상태 처리
  if (!currentUser) {
    return <LoginScreen onLogin={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* 헤더 바 */}
      <PuleoDreamHeader
        currentUser={currentUser}
        selectedSubject={selectedSubject}
        onSelectSubject={setSelectedSubject}
        onOpenQnA={() => setIsQnAModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      {/* 메인 구역 */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {/* 네비게이션 탭 */}
        <div className="flex space-x-2 mb-6 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('textbook')}
            className={`px-4 py-2 font-medium rounded-lg transition-colors ${
              activeTab === 'textbook'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            교과서 풀이
          </button>
          <button
            onClick={() => setActiveTab('unittest')}
            className={`px-4 py-2 font-medium rounded-lg transition-colors ${
              activeTab === 'unittest'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            단원 평가
          </button>
          <button
            onClick={() => setActiveTab('facts')}
            className={`px-4 py-2 font-medium rounded-lg transition-colors ${
              activeTab === 'facts'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            재미있는 상식
          </button>
        </div>

        {/* 탭 전환 뷰 */}
        {activeTab === 'textbook' && (
          <TextbookMasterView 
            subject={selectedSubject}
            textbookQuestions={textbookQuestions}
            isLoading={isLoading}
            onRefreshData={handleRefreshTextbookQuestions}
          />
        )}

        {activeTab === 'unittest' && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center py-12">
            <h3 className="text-xl font-bold mb-2">단원 평가 테스트</h3>
            <p className="text-slate-500 mb-6">개념 복습 후 평가를 통해 나의 실력을 확인해보세요.</p>
            <button
              onClick={() => setIsUnitTestModalOpen(true)}
              className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition"
            >
              단원 평가 시작하기
            </button>
          </div>
        )}

        {activeTab === 'facts' && (
          <InterestingFactsGallery subject={selectedSubject} />
        )}
      </main>

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
          onUpdateUser={(updated) => setCurrentUser(updated)}
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
