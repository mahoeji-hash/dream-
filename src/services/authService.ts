import { UserAccount, UserProfile, GradeType } from '../types';

const STORAGE_ACCOUNTS_KEY = 'puleo_dream_user_accounts_clean_v2';

// No pre-registered accounts: completely empty state
const INITIAL_DEMO_ACCOUNTS: UserAccount[] = [];

// Secret security verification code required ONLY for Admin registration
export const ADMIN_CREATION_SECRET_KEY = 'dream2026';

// Clean old storage on first import if present
try {
  localStorage.removeItem('puleo_dream_user_accounts_v1');
} catch {
  // ignore
}

export const getStoredAccounts = (): UserAccount[] => {
  try {
    const raw = localStorage.getItem(STORAGE_ACCOUNTS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_ACCOUNTS_KEY, JSON.stringify([]));
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

export const saveAccounts = (accounts: UserAccount[]): void => {
  try {
    localStorage.setItem(STORAGE_ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch (err) {
    console.error('Failed to save accounts to storage:', err);
  }
};

export const clearAllAccounts = (): void => {
  try {
    localStorage.setItem(STORAGE_ACCOUNTS_KEY, JSON.stringify([]));
    localStorage.removeItem('puleo_dream_user_accounts_v1');
    localStorage.removeItem('puleo_is_logged_in');
    localStorage.removeItem('puleo_user_profile');
  } catch (err) {
    console.error('Failed to clear accounts:', err);
  }
};

export const deleteAccountById = (accountId: string): boolean => {
  try {
    const accounts = getStoredAccounts();
    const filtered = accounts.filter(acc => acc.id !== accountId && acc.loginId !== accountId);
    saveAccounts(filtered);
    return true;
  } catch {
    return false;
  }
};

export const registerAccount = (data: {
  loginId: string;
  password: string;
  role: 'student' | 'admin';
  nickname: string;
  schoolName: string;
  grade: GradeType;
  adminSecretKey?: string;
}): { success: boolean; error?: string; account?: UserAccount } => {
  const loginIdClean = data.loginId.trim();
  const passwordClean = data.password.trim();
  const nicknameClean = data.nickname.trim();
  const schoolNameClean = data.schoolName.trim() || '우리학교';

  if (!loginIdClean || loginIdClean.length < 3) {
    return { success: false, error: '아이디는 최소 3글자 이상이어야 합니다.' };
  }

  if (!passwordClean || passwordClean.length < 4) {
    return { success: false, error: '비밀번호는 최소 4글자 이상이어야 합니다.' };
  }

  if (!nicknameClean) {
    return { success: false, error: '사용할 닉네임(또는 성함)을 입력해주세요.' };
  }

  // Check Admin security code if registering as Admin
  if (data.role === 'admin') {
    if (!data.adminSecretKey || data.adminSecretKey.trim() !== ADMIN_CREATION_SECRET_KEY) {
      return { 
        success: false, 
        error: '관리자 계정 가입을 위한 보안 인증 코드가 올바르지 않습니다. 관리자 권한은 담당 교사에게만 부여됩니다.' 
      };
    }
  }

  const currentAccounts = getStoredAccounts();

  // Check if ID already exists
  const existing = currentAccounts.find(
    (acc) => acc.loginId.toLowerCase() === loginIdClean.toLowerCase()
  );
  if (existing) {
    return { success: false, error: '이미 사용 중인 아이디입니다. 다른 아이디를 입력해주세요.' };
  }

  const newAccount: UserAccount = {
    id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    loginId: loginIdClean,
    passwordHash: passwordClean,
    role: data.role,
    nickname: nicknameClean,
    schoolName: schoolNameClean,
    grade: data.grade,
    avatarSeed: data.role === 'admin' ? 'admin_avatar' : 'student_avatar',
    createdAt: new Date().toISOString(),
  };

  const updatedAccounts = [...currentAccounts, newAccount];
  saveAccounts(updatedAccounts);

  return { success: true, account: newAccount };
};

export const authenticateUser = (
  loginId: string,
  password: string,
  expectedRole: 'student' | 'admin'
): { success: boolean; error?: string; userProfile?: UserProfile } => {
  const loginIdClean = loginId.trim();
  const passwordClean = password.trim();

  if (!loginIdClean || !passwordClean) {
    return { success: false, error: '아이디와 비밀번호를 모두 입력해주세요.' };
  }

  const currentAccounts = getStoredAccounts();
  const account = currentAccounts.find(
    (acc) => acc.loginId.toLowerCase() === loginIdClean.toLowerCase()
  );

  if (!account) {
    return {
      success: false,
      error: '존재하지 않는 아이디입니다. 아직 회원이 아니시라면 [회원가입]을 먼저 진행해주세요.',
    };
  }

  if (account.passwordHash !== passwordClean) {
    return {
      success: false,
      error: '비밀번호가 일치하지 않습니다. 다시 확인해주세요.',
    };
  }

  if (account.role !== expectedRole) {
    if (expectedRole === 'admin' && account.role === 'student') {
      return {
        success: false,
        error: '해당 계정은 [학생 / 일반 회원] 계정입니다. 관리자 로그인 권한이 없습니다. [학생 / 일반 회원] 탭에서 로그인해주세요.',
      };
    }
    if (expectedRole === 'student' && account.role === 'admin') {
      return {
        success: false,
        error: '해당 계정은 [선생님 / 관리자] 계정입니다. [선생님 / 관리자] 탭에서 로그인해주세요.',
      };
    }
  }

  const profile: UserProfile = {
    id: account.id,
    loginId: account.loginId,
    role: account.role,
    nickname: account.nickname,
    schoolName: account.schoolName,
    grade: account.grade,
    avatarSeed: account.avatarSeed,
    solvedCount: account.role === 'admin' ? 48 : 0,
    helpedCount: account.role === 'admin' ? 32 : 0,
    bookmarkedProblemIds: [],
    historyQuestions: [],
    quizAttempts: [],
    wrongQuizQuestions: [],
  };

  return { success: true, userProfile: profile };
};
