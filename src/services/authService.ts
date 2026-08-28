import { supabase } from '../supabaseClient';
import { UserAccount, UserProfile, GradeType } from '../types';

export const ADMIN_CREATION_SECRET_KEY = 'dream2026';

// 전체 계정 목록 조회 (비동기)
export const getStoredAccounts = async (): Promise<UserAccount[]> => {
  try {
    const { data, error } = await supabase.from('user_accounts').select('*');
    if (error || !Array.isArray(data)) return [];

    return data.map((acc) => ({
      id: acc.id,
      loginId: acc.login_id,
      passwordHash: acc.password_hash,
      role: acc.role,
      nickname: acc.nickname,
      schoolName: acc.school_name,
      grade: acc.grade,
      avatarSeed: acc.avatar_seed,
      createdAt: acc.created_at,
    }));
  } catch {
    return [];
  }
};

// 계정 삭제
export const deleteAccountById = async (accountId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_accounts')
      .delete()
      .or(`id.eq.${accountId},login_id.eq.${accountId}`);

    return !error;
  } catch {
    return false;
  }
};

// 회원가입 (Supabase DB 저장)
export const registerAccount = async (data: {
  loginId: string;
  password: string;
  role: 'student' | 'admin';
  nickname: string;
  schoolName: string;
  grade: GradeType;
  adminSecretKey?: string;
}): Promise<{ success: boolean; error?: string; account?: UserAccount }> => {
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

  if (data.role === 'admin') {
    if (!data.adminSecretKey || data.adminSecretKey.trim() !== ADMIN_CREATION_SECRET_KEY) {
      return {
        success: false,
        error: '관리자 계정 가입을 위한 보안 인증 코드가 올바르지 않습니다.',
      };
    }
  }

  try {
    // 1. 중복 아이디 확인
    const { data: existing } = await supabase
      .from('user_accounts')
      .select('id')
      .ilike('login_id', loginIdClean)
      .maybeSingle();

    if (existing) {
      return { success: false, error: '이미 사용 중인 아이디입니다. 다른 아이디를 입력해주세요.' };
    }

    // 2. 계정 생성 데이터 준비
    const newAccountId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newAccountData = {
      id: newAccountId,
      login_id: loginIdClean,
      password_hash: passwordClean,
      role: data.role,
      nickname: nicknameClean,
      school_name: schoolNameClean,
      grade: data.grade,
      avatar_seed: data.role === 'admin' ? 'admin_avatar' : 'student_avatar',
    };

    // 3. Supabase DB Insert
    const { error: insertError } = await supabase.from('user_accounts').insert([newAccountData]);

    if (insertError) {
      return { success: false, error: `회원가입 실패: ${insertError.message}` };
    }

    const createdAccount: UserAccount = {
      id: newAccountId,
      loginId: loginIdClean,
      passwordHash: passwordClean,
      role: data.role,
      nickname: nicknameClean,
      schoolName: schoolNameClean,
      grade: data.grade,
      avatarSeed: newAccountData.avatar_seed,
      createdAt: new Date().toISOString(),
    };

    return { success: true, account: createdAccount };
  } catch (err: any) {
    return { success: false, error: '회원가입 처리 중 오류가 발생했습니다.' };
  }
};

// 사용자 인증 (Supabase DB 조회)
export const authenticateUser = async (
  loginId: string,
  password: string,
  expectedRole: 'student' | 'admin'
): Promise<{ success: boolean; error?: string; userProfile?: UserProfile }> => {
  const loginIdClean = loginId.trim();
  const passwordClean = password.trim();

  if (!loginIdClean || !passwordClean) {
    return { success: false, error: '아이디와 비밀번호를 모두 입력해주세요.' };
  }

  try {
    const { data: account, error } = await supabase
      .from('user_accounts')
      .select('*')
      .ilike('login_id', loginIdClean)
      .maybeSingle();

    if (error || !account) {
      return {
        success: false,
        error: '존재하지 않는 아이디입니다. [회원가입]을 먼저 진행해주세요.',
      };
    }

    if (account.password_hash !== passwordClean) {
      return {
        success: false,
        error: '비밀번호가 일치하지 않습니다. 다시 확인해주세요.',
      };
    }

    if (account.role !== expectedRole) {
      if (expectedRole === 'admin' && account.role === 'student') {
        return {
          success: false,
          error: '해당 계정은 학생 계정입니다. [학생 / 일반 회원] 탭에서 로그인해주세요.',
        };
      }
      if (expectedRole === 'student' && account.role === 'admin') {
        return {
          success: false,
          error: '해당 계정은 선생님 계정입니다. [선생님 / 관리자] 탭에서 로그인해주세요.',
        };
      }
    }

    const profile: UserProfile = {
      id: account.id,
      loginId: account.login_id,
      role: account.role,
      nickname: account.nickname,
      schoolName: account.school_name,
      grade: account.grade,
      avatarSeed: account.avatar_seed,
      solvedCount: account.role === 'admin' ? 48 : 0,
      helpedCount: account.role === 'admin' ? 32 : 0,
      bookmarkedProblemIds: [],
      historyQuestions: [],
      quizAttempts: [],
      wrongQuizQuestions: [],
    };

    return { success: true, userProfile: profile };
  } catch {
    return { success: false, error: '로그인 중 오류가 발생했습니다.' };
  }
};