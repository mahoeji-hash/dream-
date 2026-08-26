import { CommunityQuestion } from '../types';

// Starts completely clean as requested
export const INITIAL_MOCK_QUESTIONS: CommunityQuestion[] = [];

const STORAGE_KEY = 'puleo_community_questions_v2';

export const getStoredQuestions = (): CommunityQuestion[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
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

export const saveStoredQuestions = (questions: CommunityQuestion[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
  } catch (err) {
    console.error('Failed to save questions:', err);
  }
};

