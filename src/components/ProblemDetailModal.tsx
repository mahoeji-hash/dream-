import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Bookmark,
  BookmarkCheck,
  MessageSquarePlus,
  Sparkles,
  HelpCircle,
  Share2,
  Lightbulb,
  Image as ImageIcon,
  Maximize2,
  TrendingUp,
  Heart,
  PenTool,
  Trash2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { ProblemItem, TextbookInfo, StudentSolution, UserRole } from '../types';
import { ProblemDiagram } from './ProblemDiagram';
import { DrawScratchpad } from './DrawScratchpad';

interface ProblemDetailModalProps {
  problem: ProblemItem;
  textbook?: TextbookInfo;
  isBookmarked: boolean;
  userRole?: UserRole;
  onToggleBookmark: (problemId: string) => void;
  onClose: () => void;
  onAskAIAboutProblem: (problem: ProblemItem) => void;
  onDeleteProblem?: (problemId: string) => void;
}

export const ProblemDetailModal: React.FC<ProblemDetailModalProps> = ({
  problem,
  textbook,
  isBookmarked,
  userRole = 'student',
  onToggleBookmark,
  onClose,
  onAskAIAboutProblem,
  onDeleteProblem,
}) => {
  const [activeTab, setActiveTab] = useState<'solution' | 'my_note'>('solution');
  const [isSolved, setIsSolved] = useState(false);
  const [studentSolutions, setStudentSolutions] = useState<StudentSolution[]>(problem.studentSolutions || []);
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // In-line interactive graph scratchpad for step-by-step solution tab
  const [showStepScratchpad, setShowStepScratchpad] = useState(false);

  // New student solution form
  const [showAddSolution, setShowAddSolution] = useState(false);
  const [newSolutionAuthor, setNewSolutionAuthor] = useState('');
  const [newSolutionDesc, setNewSolutionDesc] = useState('');
  const [savedDrawing, setSavedDrawing] = useState('');

  const handleCelebrateSolved = () => {
    setIsSolved(true);
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#3B82F6', '#10B981', '#EC4899'],
      });
    } catch (e) {
      console.log('Confetti triggered');
    }
  };

  const handleLikeSolution = (solId: string) => {
    setStudentSolutions((prev) =>
      prev.map((s) => (s.id === solId ? { ...s, likes: s.likes + 1 } : s))
    );
  };

  const handleAddSolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSolutionDesc.trim() && !savedDrawing) return;

    const newSol: StudentSolution = {
      id: `ss-${Date.now()}`,
      author: newSolutionAuthor.trim() || (userRole === 'admin' ? '선생님 풀이' : '우리반 친구 풀이'),
      authorSchool: '대구화원고',
      date: new Date().toLocaleDateString('ko-KR'),
      description: newSolutionDesc.trim(),
      drawingImage: savedDrawing || undefined,
      likes: 1,
    };

    setStudentSolutions([newSol, ...studentSolutions]);
    setNewSolutionAuthor('');
    setNewSolutionDesc('');
    setSavedDrawing('');
    setShowAddSolution(false);
  };

  return (
    <div id="problem-detail-modal-overlay" className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-2xl bg-[#FFFDF9] rounded-3xl shadow-2xl border-4 border-amber-200 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 p-4 sm:p-5 text-white flex items-center justify-between relative shadow-md">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shadow-inner">
              {problem.subject === 'math' ? '📐' : '🔬'}
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-full bg-white/25 text-[11px] font-bold tracking-wide">
                  {textbook?.name || (problem.subject === 'math' ? '수학 교과서' : '과학 교과서')}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-blue-900/30 text-[11px] font-bold">
                  p.{problem.pageNumber}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white text-amber-800 text-[11px] font-black shadow-sm">
                  {problem.problemNumber}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white mt-0.5 tracking-tight">
                {problem.unitName}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {userRole === 'admin' && onDeleteProblem && (
              confirmDelete ? (
                <div className="flex items-center gap-1 bg-rose-600/90 text-white p-1 rounded-xl shadow-md animate-in fade-in">
                  <span className="text-[11px] font-black px-1">삭제할까요?</span>
                  <button
                    type="button"
                    onClick={() => {
                      onDeleteProblem(problem.id);
                      onClose();
                    }}
                    className="px-2 py-0.5 bg-white text-rose-700 hover:bg-rose-50 rounded-lg text-xs font-black shadow-xs"
                  >
                    삭제
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="px-1.5 py-0.5 bg-rose-800/80 hover:bg-rose-800 text-white rounded-lg text-xs font-bold"
                  >
                    취소
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="p-2 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white transition-all active:scale-95 flex items-center gap-1 shadow-sm"
                  title="관리자 권한으로 문제 삭제"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-xs font-bold hidden sm:inline">문제 삭제</span>
                </button>
              )
            )}
            <button
              onClick={() => onToggleBookmark(problem.id)}
              className={`p-2 rounded-xl transition-all ${
                isBookmarked
                  ? 'bg-amber-100 text-amber-600 shadow-sm'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
              title="북마크 저장"
            >
              {isBookmarked ? <BookmarkCheck className="w-5 h-5 fill-amber-500" /> : <Bookmark className="w-5 h-5" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-all active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto border-b border-amber-200/80 bg-amber-50/60 px-3 sm:px-4 pt-2 gap-2 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('solution')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all border-b-2 shrink-0 ${
              activeTab === 'solution'
                ? 'border-blue-600 text-blue-700 bg-white/70 rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>📝 단계별 풀이</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('my_note')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all border-b-2 shrink-0 ${
              activeTab === 'my_note'
                ? 'border-emerald-600 text-emerald-700 bg-white/70 rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>✍️ 우리가 적은 풀이 ({studentSolutions.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* Problem Statement Card */}
          <div className="p-4 bg-white rounded-2xl border-2 border-amber-200/90 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
                {problem.problemType} · 난이도 [{problem.difficulty}]
              </span>
              <div className="flex items-center gap-1">
                {problem.coreConcepts.map((concept, idx) => (
                  <span key={idx} className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                    #{concept}
                  </span>
                ))}
              </div>
            </div>
            <p className="text-slate-800 text-base sm:text-lg font-semibold leading-relaxed whitespace-pre-line">
              {problem.problemText}
            </p>

            {/* Problem Diagram if present */}
            {problem.diagramSvgType && (
              <ProblemDiagram type={problem.diagramSvgType} label={problem.diagramLabel} />
            )}
          </div>

          {/* TAB 1: SOLUTION */}
          {activeTab === 'solution' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  정확하고 알기 쉬운 단계별 풀이
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowStepScratchpad(!showStepScratchpad)}
                    className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 transition-all shadow-2xs active:scale-95 ${
                      showStepScratchpad
                        ? 'bg-blue-600 text-white shadow-blue-500/20'
                        : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>{showStepScratchpad ? '연습장 닫기' : '📊 실시간 그래프 & 연습장 열기'}</span>
                  </button>
                  <button
                    onClick={() => onAskAIAboutProblem(problem)}
                    className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold hover:bg-amber-200 flex items-center gap-1 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    AI에게 질문하기
                  </button>
                </div>
              </div>

              {/* Embedded Live Graph & Scratchpad (Step-by-step assistant) */}
              <AnimatePresence>
                {showStepScratchpad && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-sky-50/90 rounded-2xl border-2 border-blue-300 shadow-sm space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-black text-blue-950">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                        <span>실시간 수학 그래프 & 좌표평면 연습장</span>
                      </div>
                      <span className="text-[11px] text-blue-700 font-bold">
                        풀이를 보면서 자유롭게 함수 그래프를 그리고 계산해보세요!
                      </span>
                    </div>
                    <DrawScratchpad height={220} showFunctionPlotterDefault={true} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Attached Problem / Solution Photo */}
              {problem.solutionImage && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1">
                      <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
                      선생님 풀이 / 판서 사진
                    </span>
                    <span className="text-[11px] text-slate-500">클릭하여 확대</span>
                  </div>
                  <div
                    onClick={() => setZoomImage(problem.solutionImage || null)}
                    className="group relative rounded-2xl overflow-hidden border-2 border-amber-300 bg-slate-900 p-2 cursor-pointer flex items-center justify-center hover:shadow-md transition-all"
                  >
                    <img
                      src={problem.solutionImage}
                      alt="풀이 첨부 사진"
                      className="max-h-64 w-auto object-contain rounded-xl transition-transform group-hover:scale-101"
                    />
                    <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/70 backdrop-blur-xs text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-lg opacity-90 group-hover:opacity-100">
                      <Maximize2 className="w-3.5 h-3.5" /> 크게 보기
                    </div>
                  </div>
                </div>
              )}

              {/* Step list */}
              <div className="space-y-3">
                {problem.solutionSteps.map((step) => (
                  <div
                    key={step.stepNumber}
                    className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-sm">
                        {step.stepNumber}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-slate-800 mb-1">
                          {step.title}
                        </h4>
                        <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                          {step.explanation}
                        </p>
                        {step.formulaOrKey && (
                          <div className="mt-2.5 p-2.5 bg-sky-50/80 rounded-xl border border-sky-200 text-blue-900 font-mono text-xs sm:text-sm font-bold tracking-tight">
                            {step.formulaOrKey}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Final Answer Card */}
              <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl text-white shadow-md flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-blue-200 tracking-wider uppercase">최종 정답</span>
                  <p className="text-lg sm:text-xl font-black mt-0.5">{problem.finalAnswer}</p>
                </div>
                <button
                  onClick={handleCelebrateSolved}
                  className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 ${
                    isSolved
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white text-blue-700 hover:bg-amber-100 hover:text-amber-900'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isSolved ? '이해 완료! 🎉' : '이해했어요!'}
                </button>
              </div>

              {/* Dream Mascot Tip */}
              <div className="p-4 bg-amber-50 rounded-2xl border-2 border-amber-300 flex items-start gap-3">
                <div className="text-2xl">🐶</div>
                <div>
                  <div className="text-xs font-black text-amber-800 tracking-wide mb-0.5 flex items-center gap-1">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                    풀어 DREAM 마스코트의 꿀팁!
                  </div>
                  <p className="text-amber-900 text-sm font-medium leading-relaxed">
                    {problem.dreamTip}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STUDENT SOLUTIONS / SCRATCHPAD */}
          {activeTab === 'my_note' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    우리가 직접 손으로 적은 풀이 & 연습장
                  </h3>
                  <p className="text-xs text-slate-500">
                    친구들과 나누고 싶은 나만의 다른 풀이법이나 손글씨 수식, 그래프를 공유해보세요!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddSolution(!showAddSolution)}
                  className="px-3.5 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>{showAddSolution ? '작성 닫기' : '✏️ 풀이 & 그래프 작성하기'}</span>
                </button>
              </div>

              {/* Add Solution Form with Drawing & Graph Canvas */}
              <AnimatePresence>
                {showAddSolution && (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={handleAddSolution}
                    className="p-4 bg-emerald-50/70 rounded-3xl border-2 border-emerald-300 shadow-md space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                        <PenTool className="w-3.5 h-3.5 text-emerald-700" />
                        나만의 수학 풀이 & 그래프 작성
                      </span>
                      <span className="text-[11px] text-emerald-700 font-bold">
                        수식 설명과 함께 그래프를 그릴 수 있어요!
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="작성자 이름 또는 닉네임 (예: 화원고 2반 수학천재)"
                        value={newSolutionAuthor}
                        onChange={(e) => setNewSolutionAuthor(e.target.value)}
                        className="w-full sm:w-1/2 px-3 py-2 bg-white rounded-xl border border-emerald-300 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <textarea
                      placeholder="이 문제의 핵심 아이디어, 풀이 과정, 주의할 점을 적어주세요."
                      value={newSolutionDesc}
                      onChange={(e) => setNewSolutionDesc(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-emerald-300 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />

                    <div>
                      <span className="text-xs font-bold text-emerald-900 block mb-1.5 flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
                        좌표평면 & 함수 그래프 / 수식 그리기 (선택)
                      </span>
                      <DrawScratchpad
                        onSaveDrawing={setSavedDrawing}
                        height={220}
                        showFunctionPlotterDefault={true}
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowAddSolution(false)}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200"
                      >
                        취소
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-1.5 rounded-xl text-xs font-black bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm active:scale-95 transition-all"
                      >
                        풀이 등록 완료 ✨
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Student solution list */}
              {studentSolutions.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-300">
                  <p className="text-slate-500 text-sm font-medium">
                    아직 등록된 친구 풀이가 없어요. 내가 첫 번째 풀이와 그래프를 등록해보세요! ✨
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {studentSolutions.map((sol) => (
                    <div
                      key={sol.id}
                      className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2.5 hover:border-emerald-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800">{sol.author}</span>
                          <span className="text-[10px] text-slate-400 font-semibold">{sol.authorSchool} · {sol.date}</span>
                          {sol.drawingImage && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center gap-0.5">
                              <TrendingUp className="w-2.5 h-2.5" /> 그래프 포함
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleLikeSolution(sol.id)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all active:scale-95"
                          title="이 풀이 추천하기"
                        >
                          <Heart className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                          <span>{sol.likes}</span>
                        </button>
                      </div>

                      {sol.description && (
                        <p className="text-xs sm:text-sm text-slate-700 font-medium whitespace-pre-line">
                          {sol.description}
                        </p>
                      )}

                      {sol.handwrittenNotes && (
                        <div className="p-2.5 bg-slate-50 rounded-xl space-y-1">
                          {sol.handwrittenNotes.map((note, idx) => (
                            <div key={idx} className="text-xs text-slate-600 font-mono">
                              {note}
                            </div>
                          ))}
                        </div>
                      )}

                      {sol.drawingImage && (
                        <div
                          onClick={() => setZoomImage(sol.drawingImage || null)}
                          className="group relative rounded-2xl overflow-hidden border border-slate-200 cursor-pointer hover:border-emerald-400 transition-all bg-white"
                        >
                          <img src={sol.drawingImage} alt="학생 손글씨 풀이 및 그래프" className="w-full object-contain max-h-56 bg-white p-1" />
                          <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-xs text-white rounded-lg text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                            <Maximize2 className="w-3 h-3" /> 크게 보기
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-amber-50/70 border-t border-amber-200 flex items-center justify-between">
          <button
            onClick={() => onAskAIAboutProblem(problem)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-amber-300 text-amber-900 font-bold text-xs sm:text-sm shadow-sm hover:bg-amber-100 active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>이 문제 AI에게 질문하기</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 text-white text-xs sm:text-sm font-bold hover:bg-slate-900 active:scale-95 transition-all shadow-sm"
          >
            닫기
          </button>
        </div>
      </motion.div>

      {/* Enlarged Photo Lightbox Modal */}
      <AnimatePresence>
        {zoomImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomImage(null)}
            className="fixed inset-0 z-70 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl max-h-[90vh] bg-slate-950 rounded-2xl overflow-hidden border border-white/20 flex flex-col items-center shadow-2xl"
            >
              <button
                onClick={() => setZoomImage(null)}
                className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-colors shadow-md"
              >
                <X className="w-5 h-5" />
              </button>
              <img
                src={zoomImage}
                alt="확대 이미지"
                className="max-w-full max-h-[80vh] object-contain p-2"
              />
              <div className="p-2.5 text-center text-xs text-white/70 font-medium bg-black/50 w-full">
                바깥 영역이나 닫기 버튼을 누르면 닫힙니다
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
