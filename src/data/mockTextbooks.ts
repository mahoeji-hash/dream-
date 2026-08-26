import { TextbookInfo, ProblemItem } from '../types';

export const TEXTBOOKS: TextbookInfo[] = [
  // Math Textbook: 미래엔 공통수학 2
  {
    id: 'tb-math-mr-h2',
    name: '미래엔 공통수학 2',
    publisher: '미래엔',
    subject: 'math',
    grade: 'high_1',
    category: '교과서',
    color: '#2563EB',
    badgeText: '공통수학 2 (미래엔)',
    totalChapters: 3,
  },

  // Science Textbook: 비상교육 통합과학 2
  {
    id: 'tb-sci-bs-h2',
    name: '비상교육 통합과학 2',
    publisher: '비상교육',
    subject: 'science',
    grade: 'high_1',
    category: '교과서',
    color: '#10B981',
    badgeText: '통합과학 2 (비상교육)',
    totalChapters: 3,
  },
];

// Completely empty problem array - no pre-seeded mock problems
export const INITIAL_CURRICULUM_PROBLEMS: ProblemItem[] = [];

const PROBLEMS_STORAGE_KEY = 'puleo_dream_stored_problems_v7_sci2';

export const getStoredProblems = (): ProblemItem[] => {
  try {
    // Clear old problem storage keys that had pre-seeded mock data
    const oldKeys = [
      'puleo_problems_v2',
      'puleo_dream_stored_problems_v3_math2',
      'puleo_dream_stored_problems_v4_clean',
      'puleo_dream_stored_problems_v5_empty',
      'puleo_dream_stored_problems_v6_clean'
    ];
    oldKeys.forEach((k) => {
      try {
        localStorage.removeItem(k);
      } catch {}
    });

    const raw = localStorage.getItem(PROBLEMS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PROBLEMS_STORAGE_KEY, JSON.stringify([]));
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch {
    return [];
  }
};

export const saveStoredProblems = (problems: ProblemItem[]): void => {
  try {
    localStorage.setItem(PROBLEMS_STORAGE_KEY, JSON.stringify(problems));
  } catch (err) {
    console.error('Failed to save problems to storage:', err);
  }
};
