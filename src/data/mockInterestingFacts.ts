import { InterestingFactItem, SubjectType } from '../types';

export const INITIAL_INTERESTING_FACTS: InterestingFactItem[] = [
  {
    id: 'fact-math-1',
    subject: 'math',
    title: '자연 속에 숨겨진 마법의 비율, 피보나치 수열과 황금비',
    subtitle: '해바라기 씨앗부터 은하수의 나선까지',
    category: '자연과 수학',
    content: '1, 1, 2, 3, 5, 8, 13, 21... 앞의 두 수를 더해 다음 수가 되는 피보나치 수열! 해바라기 씨앗의 나선 개수, 솔방울의 비늘, 파인애플 껍질의 눈까지 자연계의 모든 최적화 배열은 이 비율을 따릅니다. 인접한 두 수의 비율은 약 1:1.618인 황금비로 수렴하며, 신용카드, 모나리자, 애플 로고에도 쓰이고 있습니다.',
    authorName: '선생님 공식 포스터',
    createdAt: '2026-08-25',
    tags: ['#피보나치', '#황금비', '#자연의규칙'],
    likes: 12,
    bgGradient: 'from-blue-600 via-indigo-600 to-purple-700',
  },
  {
    id: 'fact-sci-1',
    subject: 'science',
    title: '지구상 모든 인류의 원자 속 빈 공간을 빼면 각설탕 하나?',
    subtitle: '원자의 99.9999999%는 텅 빈 공간',
    category: '미시세계의 비밀',
    content: '우리를 이루는 원자는 축구장 한가운데 놓인 탁구공(원자핵)과 관람석을 도는 파리(전자)처럼 거의 텅 비어 있습니다. 지구상의 전 인류(약 80억 명) 몸속 모든 원자에서 빈 공간을 완전히 압축해 원자핵들만 뭉치면 각설탕 하나 크기(약 1cm³)에 불과합니다!',
    authorName: '선생님 공식 포스터',
    createdAt: '2026-08-25',
    tags: ['#통합과학', '#원자구조', '#물리의신비'],
    likes: 18,
    bgGradient: 'from-emerald-600 via-teal-600 to-cyan-700',
  },
];

const FACTS_STORAGE_KEY = 'puleo_dream_interesting_facts_v1';

export const getStoredInterestingFacts = (): InterestingFactItem[] => {
  try {
    const raw = localStorage.getItem(FACTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(FACTS_STORAGE_KEY, JSON.stringify(INITIAL_INTERESTING_FACTS));
      return INITIAL_INTERESTING_FACTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return INITIAL_INTERESTING_FACTS;
  } catch {
    return INITIAL_INTERESTING_FACTS;
  }
};

export const saveStoredInterestingFacts = (facts: InterestingFactItem[]): void => {
  try {
    localStorage.setItem(FACTS_STORAGE_KEY, JSON.stringify(facts));
  } catch (err) {
    console.error('Failed to save interesting facts:', err);
  }
};
