import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ChevronRight, ShieldCheck, MessageSquare } from 'lucide-react';
import { PuleoDreamHeader } from './PuleoDreamHeader';
import { UserRole } from '../types';
import mascotImg from '../assets/images/puleo_dream_mascot_1787679912561.jpg';

interface HomeScreenProps {
  onSelectMath: () => void;
  onSelectScience: () => void;
  onSelectAskQuestion: () => void;
  onSelectQnA: () => void;
  onOpenProfile: () => void;
  onLogout?: () => void;
  userRole?: UserRole;
  solvedCount: number;
  waitingQuestionsCount?: number;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onSelectMath,
  onSelectScience,
  onSelectAskQuestion,
  onSelectQnA,
  onOpenProfile,
  onLogout,
  userRole = 'student',
  solvedCount,
  waitingQuestionsCount = 0,
}) => {
  return (
    <div id="home-screen-container" className="w-full max-w-md mx-auto px-3 sm:px-4 pb-8 flex flex-col items-center justify-between min-h-[92vh] select-none">
      {/* 1. Header with Profile & 3D Clay "풀어 DREAM" Logo */}
      <PuleoDreamHeader
        onOpenProfile={onOpenProfile}
        onLogout={onLogout}
        userRole={userRole}
        isHome={true}
      />

      {/* 2. Main Clay Action Buttons */}
      <div id="home-action-buttons-group" className="w-full space-y-3 my-2">
        {/* BUTTON 1: 수학 마스터 하기! */}
        <motion.button
          id="btn-math-master"
          onClick={onSelectMath}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3.5 px-4 sm:px-5 rounded-[26px] bg-white border-[3px] border-[#3B82F6] shadow-[0_8px_20px_rgba(59,130,246,0.18),0_2px_6px_rgba(0,0,0,0.04)] flex items-center justify-between group transition-all relative overflow-hidden"
        >
          {/* Subtle Clay Highlight Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-400 via-sky-300 to-blue-500 opacity-90" />

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-500 text-white flex items-center justify-center text-xl shadow-md border-2 border-white group-hover:rotate-6 transition-transform">
              📐
            </div>
            <div className="text-left">
              <span className="text-[11px] font-bold text-blue-600 tracking-wide uppercase block">
                미래엔 공통수학 2 교과서 풀이
              </span>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                수학 마스터 하기!
              </h2>
            </div>
          </div>

          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-xs">
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </motion.button>

        {/* BUTTON 2: 과학 마스터 하기! */}
        <motion.button
          id="btn-science-master"
          onClick={onSelectScience}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3.5 px-4 sm:px-5 rounded-[26px] bg-white border-[3px] border-[#10B981] shadow-[0_8px_20px_rgba(16,185,129,0.18),0_2px_6px_rgba(0,0,0,0.04)] flex items-center justify-between group transition-all relative overflow-hidden"
        >
          {/* Subtle Clay Highlight Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 opacity-90" />

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-xl shadow-md border-2 border-white group-hover:rotate-6 transition-transform">
              🔬
            </div>
            <div className="text-left">
              <span className="text-[11px] font-bold text-emerald-600 tracking-wide uppercase block">
                비상교육 통합과학 2 교과서 풀이
              </span>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                과학 마스터 하기!
              </h2>
            </div>
          </div>

          <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors shadow-xs">
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </motion.button>

        {/* BUTTON 3: 모르는 문제가 있어요! (사진 질문) */}
        <motion.button
          id="btn-ask-question"
          onClick={onSelectAskQuestion}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3.5 px-4 sm:px-5 rounded-[26px] bg-gradient-to-r from-amber-50 to-orange-50 border-[3px] border-[#F59E0B] shadow-[0_8px_20px_rgba(245,158,11,0.22),0_2px_6px_rgba(0,0,0,0.04)] flex items-center justify-between group transition-all relative overflow-hidden"
        >
          {/* Subtle Clay Highlight Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-400" />

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center text-xl shadow-md border-2 border-white group-hover:rotate-6 transition-transform relative">
              📸
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-ping" />
            </div>
            <div className="text-left">
              <span className="text-[11px] font-bold text-amber-700 tracking-wide uppercase flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" /> 사진 찍고 AI 해결
              </span>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                모르는 문제가 있어요!
              </h2>
            </div>
          </div>

          <div className="w-8 h-8 rounded-full bg-amber-200/80 text-amber-900 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors shadow-xs">
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </motion.button>

        {/* BUTTON 4: 실시간 학생 Q&A 질문 & 선생님 답변 게시판 */}
        <motion.button
          id="btn-community-qna"
          onClick={onSelectQnA}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full py-3.5 px-4 sm:px-5 rounded-[26px] bg-white border-[3px] shadow-[0_8px_20px_rgba(217,119,6,0.18),0_2px_6px_rgba(0,0,0,0.04)] flex items-center justify-between group transition-all relative overflow-hidden ${
            userRole === 'admin'
              ? 'border-amber-400 bg-gradient-to-r from-amber-50/80 to-yellow-50/80'
              : 'border-indigo-400 bg-gradient-to-r from-indigo-50/40 to-blue-50/40'
          }`}
        >
          {/* Top highlight bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-indigo-400 to-purple-400" />

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 text-white flex items-center justify-center text-xl shadow-md border-2 border-white group-hover:rotate-6 transition-transform relative">
              📚
              {waitingQuestionsCount > 0 && userRole === 'admin' && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-rose-500 text-white font-black text-[9px] rounded-full border border-white animate-bounce">
                  {waitingQuestionsCount}
                </span>
              )}
            </div>
            <div className="text-left">
              <span className="text-[11px] font-bold text-amber-700 tracking-wide uppercase flex items-center gap-1">
                {userRole === 'admin' ? (
                  <>
                    <ShieldCheck className="w-3 h-3 text-amber-600" />
                    <span>선생님 맞춤 답변 대기 ({waitingQuestionsCount}건)</span>
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-3 h-3 text-indigo-600" />
                    <span>우리 학교 실시간 Q&A 모음</span>
                  </>
                )}
              </span>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                <span>질문 & 선생님 답변</span>
                {userRole === 'admin' && (
                  <span className="text-xs px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black rounded-full shadow-2xs">
                    답변 달기
                  </span>
                )}
              </h2>
            </div>
          </div>

          <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-xs">
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </motion.button>
      </div>

      {/* 3. Clay Mascot Studying at Desk */}
      <div id="mascot-study-section" className="w-full mt-1 flex flex-col items-center relative">
        {/* Mascot Speech Bubble */}
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative px-4 py-1.5 bg-white/95 backdrop-blur-sm rounded-2xl border-2 border-amber-200 shadow-sm text-xs text-amber-950 font-bold max-w-xs text-center mb-[-8px] z-10"
        >
          <p className="flex items-center justify-center gap-1">
            <span>✨</span>
            <span>
              {userRole === 'admin'
                ? '선생님! 학생들이 올린 질문에 명쾌한 풀이를 남겨주세요 👑'
                : '어려운 문제는 질문 게시판에 올리면 선생님이 답변해줘요!'}
            </span>
          </p>
          {/* Speech bubble tail pointing down */}
          <div className="w-2.5 h-2.5 bg-white border-r-2 border-b-2 border-amber-200 rotate-45 mx-auto mt-[-5px]" />
        </motion.div>

        {/* Mascot Image Card */}
        <div className="w-32 sm:w-36 aspect-square rounded-3xl overflow-hidden border-4 border-white shadow-[0_12px_28px_rgba(0,0,0,0.1)] bg-amber-100/50 p-0.5 relative group">
          <img
            src={mascotImg}
            alt="풀어 DREAM 열공 마스코트"
            className="w-full h-full object-cover rounded-[20px] group-hover:scale-105 transition-transform duration-300"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-amber-400/90 text-[10px] font-black text-amber-950 shadow-xs backdrop-blur-xs flex items-center gap-0.5">
            <span>💡</span>
            <span>{userRole === 'admin' ? '선생님 채점 모드' : '열공 모드'}</span>
          </div>
        </div>

        {/* Bottom School Info */}
        <p className="text-[11px] text-slate-400 font-medium mt-1.5">
          우리 학교 친구들과 선생님이 함께 완성하는 교과서 풀이 아카이브
        </p>
      </div>
    </div>
  );
};
