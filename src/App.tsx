import React, { useState, useEffect } from 'react';
import { getStoredQuestions } from './data/mockCommunityQuestions';
import { getStoredInterestingFacts } from './data/mockInterestingFacts';
import { getStoredProblems } from './data/mockTextbooks';

export default function App() {
  // 1. 상태를 무조건 빈 배열([])로 안전하게 시작합니다.
  const [questions, setQuestions] = useState<any[]>([]);
  const [facts, setFacts] = useState<any[]>([]);
  const [problems, setProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 2. 화면이 켜지면 Supabase에서 데이터를 안전하게 가져옵니다.
  useEffect(() => {
    async function loadAllData() {
      try {
        const [qData, fData, pData] = await Promise.all([
          getStoredQuestions(),
          getStoredInterestingFacts(),
          getStoredProblems()
        ]);

        // 배열이 맞는지 확인 후 상태에 저장 (에러 방지)
        setQuestions(Array.isArray(qData) ? qData : []);
        setFacts(Array.isArray(fData) ? fData : []);
        setProblems(Array.isArray(pData) ? pData : []);
      } catch (error) {
        console.error("데이터 로딩 중 에러 발생:", error);
      } finally {
        setLoading(false);
      }
    }

    loadAllData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
        <h2>데이터를 불러오는 중입니다...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>
        <h1 style={{ color: '#333' }}>풀어 DREAM - 수학 학습 플랫폼</h1>
      </header>

      <main>
        {/* Q&A 질문 섹션 */}
        <section style={{ marginBottom: '30px' }}>
          <h2>Q&A 질문 목록 ({(questions || []).length}개)</h2>
          {(questions || []).length === 0 ? (
            <p style={{ color: '#888' }}>등록된 질문이 없습니다.</p>
          ) : (
            <ul>
              {(questions || []).map((q) => (
                <li key={q.id} style={{ marginBottom: '8px' }}>
                  <strong>[{q.subject || '일반'}]</strong> {q.title}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* 흥미로운 사실 / 포스터 섹션 */}
        <section style={{ marginBottom: '30px' }}>
          <h2>수학 포스터 목록 ({(facts || []).length}개)</h2>
          {(facts || []).length === 0 ? (
            <p style={{ color: '#888' }}>등록된 포스터가 없습니다.</p>
          ) : (
            <ul>
              {(facts || []).map((f) => (
                <li key={f.id} style={{ marginBottom: '8px' }}>
                  <strong>[{f.category || '포스터'}]</strong> {f.title}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* 교재 문제 섹션 */}
        <section style={{ marginBottom: '30px' }}>
          <h2>교재 문제 목록 ({(problems || []).length}개)</h2>
          {(problems || []).length === 0 ? (
            <p style={{ color: '#888' }}>등록된 문제가 없습니다.</p>
          ) : (
            <ul>
              {(problems || []).map((p) => (
                <li key={p.id} style={{ marginBottom: '8px' }}>
                  {p.title || p.content}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}