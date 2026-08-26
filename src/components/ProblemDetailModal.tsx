import React, { useState } from 'react';
import { X, CheckCircle2, Bookmark, BookmarkCheck, ThumbsUp, MessageSquarePlus, Sparkles, HelpCircle, Share2, Lightbulb, Image as ImageIcon, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { ProblemItem, TextbookInfo, PeerTip, StudentSolution, UserRole } from '../types';
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
}

export const ProblemDetailModal: React.FC<ProblemDetailModalProps> = ({
  problem,
  textbook,
  isBookmarked,
  userRole = 'student',
  onToggleBookmark,
  onClose,
  onAskAIAboutProblem,
}) => {
  const [activeTab, setActiveTab] = useState<'solution' | 'peer_tips' | 'my_note'>('solution');
  const [isSolved, setIsSolved] = useState(false);
  const [peerTips, setPeerTips] = useState<PeerTip[]>(problem.peerTips || []);
  const [studentSolutions, setStudentSolutions] = useState<StudentSolution[]>(problem.studentSolutions || []);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  // New tip form state
  const [showAddTip, setShowAddTip] = useState(false);
  const [newTipText, setNewTipText] = useState('');
  const [newTipAuthor, setNewTipAuthor] = useState('');

  // New student solution form
  const [showAddSolution, setShowAddSolution] = useState(false);
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

  const handleLikeTip = (tipId: string) => {
    setPeerTips((prev) =>
      prev.map((t) => (t.id === tipId ? { ...t, likes: t.likes + 1, isHelpful: true } : t))
    );
  };

  const handleAddTip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTipText.trim()) return;

    const newTip: PeerTip = {
      id: `pt-${Date.now()}`,
      author: newTipAuthor.trim() || '우리반 친구',
      authorBadge: '새로운 꿀팁',
      tip: newTipText.trim(),
      likes: 1,
      isHelpful: false,
    };

    setPeerTips([newTip, ...peerTips]);
    setNewTipText('');
    setShowAddTip(false);
  };

  const handleAddSolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSolutionDesc.trim() && !savedDrawing) return;

    const newSol: StudentSolution = {
      id: `ss-${Date.now()}`,
      author: '나의 풀이 노트',
      authorSchool: '내 교과서 풀이',
      date: new Date().toLocaleDateString('ko-KR'),
      description: newSolutionDesc.trim(),
      drawingImage: savedDrawing || undefined,
      likes: 1,
    };

    setStudentSolutions([newSol, ...studentSolutions]);
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
            onClick={() => setActiveTab('peer_tips')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-black flex items-center gap-1.5 transition-all border-b-2 shrink-0 ${
              activeTab === 'peer_tips'
                ? 'border-amber-600 text-amber-700 bg-white/70 rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>💡 친구 꿀팁 ({peerTips.length})</span>
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
                <button
                  onClick={() => onAskAIAboutProblem(problem)}
                  className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold hover:bg-amber-200 flex items-center gap-1 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  AI에게 질문하기
                </button>
              </div>

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

          {/* TAB 2: PEER TIPS */}
          {activeTab === 'peer_tips' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    우리 친구들이 직접 남긴 꿀팁 & 실수 방지 비법
                  </h3>
                  <p className="text-xs text-slate-500">
                    친구들의 풀이 노하우를 보고 도움을 받았다면 따봉을 눌러주세요!
                  </p>
                </div>
                {userRole === 'admin' && (
                  <button
                    onClick={() => setShowAddTip(!showAddTip)}
                    className="px-3 py-1.5 rounded-full bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 flex items-center gap-1 shadow-sm transition-colors"
                  >
                    <MessageSquarePlus className="w-3.5 h-3.5" />
                    꿀팁 남기기 (관리자)
                  </button>
                )}
              </div>

              {/* Add Tip Form */}
              <AnimatePresence>
                {showAddTip && (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={handleAddTip}
                    className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 space-y-2.5"
                  >
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="닉네임 (예: 화원고2반)"
                        value={newTipAuthor}
                        onChange={(e) => setNewTipAuthor(e.target.value)}
                        className="w-1/3 px-3 py-1.5 bg-white rounded-xl border border-amber-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                      <input
                        type="text"
                        placeholder="이 문제 풀 때 기억해야 할 핵심 꿀팁을 적어주세요!"
                        value={newTipText}
                        onChange={(e) => setNewTipText(e.target.value)}
                        required
                        className="flex-1 px-3 py-1.5 bg-white rounded-xl border border-amber-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddTip(false)}
                        className="px-3 py-1 rounded-lg text-xs text-slate-600 hover:bg-slate-200"
                      >
                        취소
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-500 text-white hover:bg-amber-600 shadow-sm"
                      >
                        등록하기
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Tip list */}
              <div className="space-y-2.5">
                {peerTips.map((tip) => (
                  <div
                    key={tip.id}
                    className="p-3.5 bg-white rounded-2xl border border-slate-200/90 shadow-sm flex items-start justify-between gap-3 hover:border-amber-300 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">{tip.author}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">
                          {tip.authorBadge}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                        {tip.tip}
                      </p>
                    </div>

                    <button
                      onClick={() => handleLikeTip(tip.id)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        tip.isHelpful
                          ? 'bg-amber-500 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{tip.likes}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: STUDENT SOLUTIONS / SCRATCHPAD */}
          {activeTab === 'my_note' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    우리가 직접 손으로 적은 풀이 & 연습장
                  </h3>
                  <p className="text-xs text-slate-500">
                    친구들과 나누고 싶은 나만의 다른 풀이법이나 손글씨 수식을 공유해보세요!
                  </p>
                </div>
                {userRole === 'admin' && (
                  <button
                    onClick={() => setShowAddSolution(!showAddSolution)}
                    className="px-3 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 flex items-center gap-1 shadow-sm transition-colors"
                  >
                    <MessageSquarePlus className="w-3.5 h-3.5" />
                    풀이 노트 등록 (관리자)
                  </button>
                )}
              </div>

              {/* Add Solution Form with Drawing Canvas */}
              <AnimatePresence>
                {showAddSolution && (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={handleAddSolution}
                    className="p-4 bg-emerald-50/70 rounded-2xl border-2 border-emerald-200 space-y-3"
                  >
                    <textarea
                      placeholder="이 문제의 다른 풀이나 내가 푼 풀이 노하우를 적어주세요."
                      value={newSolutionDesc}
                      onChange={(e) => setNewSolutionDesc(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-emerald-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />

                    <div>
                      <span className="text-xs font-bold text-emerald-900 block mb-1">
                        🎨 수식이나 그래프 직접 그리기 (선택)
                      </span>
                      <DrawScratchpad onSaveDrawing={setSavedDrawing} height={140} />
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowAddSolution(false)}
                        className="px-3 py-1.5 rounded-lg text-xs text-slate-600 hover:bg-slate-200"
                      >
                        취소
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                      >
                        풀이 등록하기
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* Student solution list */}
              {studentSolutions.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-300">
                  <p className="text-slate-500 text-sm font-medium">
                    아직 등록된 친구 풀이가 없어요. 내가 첫 번째 풀이를 등록해보세요! ✨
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {studentSolutions.map((sol) => (
                    <div
                      key={sol.id}
                      className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800">{sol.author}</span>
                          <span className="text-[10px] text-slate-400 font-semibold">{sol.authorSchool} · {sol.date}</span>
                        </div>
                        <span className="text-xs text-emerald-600 font-bold">❤️ {sol.likes}</span>
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
                          className="rounded-xl overflow-hidden border border-slate-200 cursor-pointer hover:opacity-95"
                        >
                          <img src={sol.drawingImage} alt="학생 손글씨 풀이" className="w-full object-contain max-h-48 bg-white" />
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
