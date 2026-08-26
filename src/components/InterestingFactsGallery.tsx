import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  PlusCircle,
  Camera,
  Upload,
  Trash2,
  Heart,
  Tag,
  Maximize2,
  X,
  ShieldCheck,
  BookOpen,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';
import { InterestingFactItem, SubjectType, UserRole } from '../types';

interface InterestingFactsGalleryProps {
  subject: SubjectType;
  userRole: UserRole;
  currentUserId?: string;
  facts: InterestingFactItem[];
  onAddNewFact: (fact: InterestingFactItem) => void;
  onDeleteFact: (factId: string) => void;
  onToggleLikeFact: (factId: string) => void;
}

const GRADIENT_PRESETS = [
  { label: '우주 코스믹 퍼플', value: 'from-purple-900 via-indigo-900 to-slate-950' },
  { label: '딥 오션 블루', value: 'from-blue-900 via-indigo-900 to-cyan-950' },
  { label: '에메랄드 바이오', value: 'from-emerald-900 via-teal-900 to-slate-950' },
  { label: '선셋 골든 앰버', value: 'from-amber-800 via-orange-900 to-slate-950' },
  { label: '루비 크림슨', value: 'from-rose-900 via-pink-950 to-slate-950' },
];

export const InterestingFactsGallery: React.FC<InterestingFactsGalleryProps> = ({
  subject,
  userRole,
  currentUserId = 'user_account_default',
  facts,
  onAddNewFact,
  onDeleteFact,
  onToggleLikeFact,
}) => {
  const [selectedFactId, setSelectedFactId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  // Derive selected fact from current facts array so like state updates in real time
  const selectedFact = facts.find((f) => f.id === selectedFactId) || null;

  // New Fact Form State
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState(subject === 'math' ? '수학의 역사와 비화' : '일상 속 과학 원리');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [posterImage, setPosterImage] = useState<string | null>(null);
  const [bgGradient, setBgGradient] = useState(
    subject === 'math'
      ? 'from-blue-900 via-indigo-900 to-cyan-950'
      : 'from-emerald-900 via-teal-900 to-slate-950'
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleImageFileRead = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        setPosterImage(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const subjectFacts = facts.filter((f) => f.subject === subject);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const tags = tagsInput
      .split(/[\s,]+/)
      .map((t) => (t.startsWith('#') ? t : `#${t}`))
      .filter((t) => t.length > 1);

    const newFact: InterestingFactItem = {
      id: `fact-${Date.now()}`,
      subject,
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      category: category.trim() || (subject === 'math' ? '수학 이야기' : '과학 이야기'),
      content: content.trim(),
      posterImage: posterImage || undefined,
      authorName: '선생님 공식 포스터',
      createdAt: new Date().toISOString().split('T')[0],
      tags: tags.length > 0 ? tags : [subject === 'math' ? '#수학상식' : '#과학상식'],
      likes: 0,
      bgGradient,
    };

    onAddNewFact(newFact);
    setShowAddModal(false);
    // Reset Form
    setTitle('');
    setSubtitle('');
    setContent('');
    setTagsInput('');
    setPosterImage(null);
  };

  return (
    <div id="interesting-facts-gallery-section" className="space-y-4">
      {/* Top Banner */}
      <div className="p-4 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 rounded-3xl text-white shadow-md flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="px-2.5 py-0.5 bg-white/20 text-[10px] font-black rounded-full uppercase tracking-wider backdrop-blur-xs">
              {subject === 'math' ? 'MATH TRIVIA & STORIES' : 'SCIENCE WONDERS'}
            </span>
            <span className="text-[11px] font-black text-amber-100 flex items-center gap-0.5">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
              지식 확장 포스터
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-black tracking-tight">
            {subject === 'math' ? '교과서 너머의 흥미로운 수학 이야기' : '교과서 너머의 경이로운 과학 이야기'}
          </h3>
          <p className="text-xs text-amber-100 font-medium">
            교과서 공식 뒤에 숨겨진 천재들의 일화, 자연과 일상 속 신비로운 원리를 포스터로 만나보세요!
          </p>
        </div>

        {userRole === 'admin' ? (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-2 bg-white text-amber-900 font-black text-xs rounded-2xl shadow-lg hover:bg-amber-50 active:scale-95 transition-all flex items-center gap-1.5 shrink-0 ml-2"
          >
            <PlusCircle className="w-4 h-4 text-amber-600" />
            <span>포스터 등록</span>
          </button>
        ) : (
          <div className="w-11 h-11 rounded-2xl bg-white/20 border border-white/40 flex items-center justify-center text-2xl shadow-inner shrink-0 ml-2">
            💡
          </div>
        )}
      </div>

      {/* Poster Cards Grid */}
      {subjectFacts.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border-2 border-dashed border-amber-200 space-y-3">
          <span className="text-4xl block animate-bounce">🖼️</span>
          <p className="text-sm font-bold text-slate-800">
            등록된 흥미로운 이야기 포스터가 아직 없습니다.
          </p>
          {userRole === 'admin' ? (
            <div className="space-y-2 max-w-sm mx-auto">
              <p className="text-xs text-slate-500">
                선생님(관리자) 권한으로 학생들의 수학·과학 호기심을 자극할 멋진 이야기와 사진을 등록해보세요!
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black shadow-md transition-all active:scale-95"
              >
                + 새 흥미로운 사실 포스터 등록하기
              </button>
            </div>
          ) : (
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              선생님께서 새로운 수학·과학 포스터를 준비 중입니다. 곧 업데이트될 이야기를 기대해주세요!
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {subjectFacts.map((fact) => {
            const isLikedByMe = !!(currentUserId && fact.likedUserIds?.includes(currentUserId));

            return (
              <motion.div
                key={fact.id}
                whileHover={{ y: -3 }}
                className={`rounded-3xl p-5 text-white shadow-xl bg-gradient-to-br ${
                  fact.bgGradient || 'from-slate-900 via-indigo-950 to-slate-950'
                } border-2 border-white/15 relative overflow-hidden flex flex-col justify-between cursor-pointer group`}
                onClick={() => setSelectedFactId(fact.id)}
              >
                {/* Background ambient lighting */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl pointer-events-none" />

                <div>
                  {/* Header Tag & Category */}
                  <div className="flex items-center justify-between gap-2 mb-3 relative z-10">
                    <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-black text-amber-200 border border-white/20">
                      {fact.category}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {userRole === 'admin' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`'${fact.title}' 포스터를 삭제하시겠습니까? (선생님/관리자 전용)`)) {
                              onDeleteFact(fact.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-rose-500/30 text-rose-300 hover:bg-rose-600 hover:text-white transition-colors"
                          title="관리자 권한으로 포스터 삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <span className="text-[10px] text-white/60 font-bold">{fact.createdAt}</span>
                    </div>
                  </div>

                  {/* Poster Title */}
                  <h4 className="text-base sm:text-lg font-black leading-snug tracking-tight text-white group-hover:text-amber-300 transition-colors mb-1 break-keep">
                    {fact.title}
                  </h4>

                  {fact.subtitle && (
                    <p className="text-xs font-semibold text-amber-200/90 mb-2 break-keep">
                      {fact.subtitle}
                    </p>
                  )}

                  {/* Poster Attached Image Thumbnail if exists */}
                  {fact.posterImage && (
                    <div className="my-2.5 rounded-2xl overflow-hidden border border-white/20 bg-black/40 max-h-56 flex items-center justify-center">
                      <img
                        src={fact.posterImage}
                        alt={fact.title}
                        className="w-full h-auto max-h-56 object-cover object-center group-hover:scale-103 transition-transform duration-300"
                      />
                    </div>
                  )}

                  {/* Content snippet - full text without cut-off */}
                  <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-medium mt-2 whitespace-pre-line break-keep">
                    {fact.content}
                  </p>
                </div>

                {/* Bottom Row: Tags & Like Button */}
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs relative z-10 gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {fact.tags?.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-bold text-amber-200 bg-white/15 px-2 py-0.5 rounded-md backdrop-blur-xs"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleLikeFact(fact.id);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 ${
                        isLikedByMe
                          ? 'bg-rose-500 text-white shadow-md ring-2 ring-rose-300/60 font-black'
                          : 'bg-white/15 hover:bg-white/25 text-white'
                      }`}
                      title={isLikedByMe ? '좋아요 취소' : '1계정당 1회 좋아요'}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          isLikedByMe ? 'text-white fill-white' : 'text-rose-300 fill-rose-300/40'
                        }`}
                      />
                      <span>{fact.likes}</span>
                    </button>
                    <span className="text-amber-300 font-bold text-xs flex items-center gap-0.5">
                      포스터 보기 <Maximize2 className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Fact Detail Modal (Poster Lightbox) */}
      <AnimatePresence>
        {selectedFact && (
          <div
            className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
            onClick={() => setSelectedFactId(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-xl bg-gradient-to-br ${
                selectedFact.bgGradient || 'from-slate-900 via-indigo-950 to-slate-950'
              } text-white rounded-[32px] border-2 border-white/25 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]`}
            >
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-white/15 flex items-center justify-between bg-black/30">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black">
                    {selectedFact.category}
                  </span>
                  <span className="text-xs text-white/70 font-semibold">
                    {selectedFact.authorName}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedFactId(null)}
                  className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
                <div>
                  <h3 className="text-lg sm:text-2xl font-black leading-snug tracking-tight text-white mb-1 break-keep">
                    {selectedFact.title}
                  </h3>
                  {selectedFact.subtitle && (
                    <p className="text-sm font-bold text-amber-300 break-keep">
                      {selectedFact.subtitle}
                    </p>
                  )}
                </div>

                {selectedFact.posterImage && (
                  <div
                    onClick={() => setZoomImage(selectedFact.posterImage || null)}
                    className="relative rounded-2xl overflow-hidden border-2 border-white/20 bg-black/60 cursor-pointer group"
                  >
                    <img
                      src={selectedFact.posterImage}
                      alt={selectedFact.title}
                      className="w-full max-h-72 object-contain mx-auto"
                    />
                    <div className="absolute top-2.5 right-2.5 px-2 py-1 rounded-lg bg-black/70 text-white text-[11px] font-bold flex items-center gap-1 backdrop-blur-xs">
                      <Maximize2 className="w-3 h-3" /> 크게 보기
                    </div>
                  </div>
                )}

                <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-slate-100 text-sm sm:text-base leading-relaxed font-medium whitespace-pre-wrap break-keep">
                  {selectedFact.content}
                </div>

                {/* Tags */}
                <div className="flex items-center gap-2 flex-wrap">
                  {selectedFact.tags?.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-xl bg-white/15 text-white text-xs font-bold"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-white/15 bg-black/30 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {(() => {
                    const isSelectedFactLiked = !!(currentUserId && selectedFact.likedUserIds?.includes(currentUserId));
                    return (
                      <button
                        type="button"
                        onClick={() => onToggleLikeFact(selectedFact.id)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold shadow-md active:scale-95 transition-all ${
                          isSelectedFactLiked
                            ? 'bg-rose-500 hover:bg-rose-600 text-white ring-2 ring-rose-300 font-black'
                            : 'bg-white/20 hover:bg-white/30 text-white'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isSelectedFactLiked ? 'fill-white text-white' : 'text-rose-300 fill-rose-300/40'}`} />
                        <span>{isSelectedFactLiked ? '좋아요 취소' : '좋아요'} ({selectedFact.likes})</span>
                      </button>
                    );
                  })()}
                  <span className="text-[10px] text-white/60 font-semibold hidden sm:inline">
                    1계정당 1회
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {userRole === 'admin' && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`'${selectedFact.title}' 포스터를 삭제하시겠습니까? (선생님/관리자 전용)`)) {
                          onDeleteFact(selectedFact.id);
                          setSelectedFactId(null);
                        }
                      }}
                      className="px-3 py-2 rounded-xl bg-rose-600/40 hover:bg-rose-600 text-rose-200 hover:text-white border border-rose-400/40 text-xs font-bold transition-all flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>포스터 삭제</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setSelectedFactId(null)}
                    className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs transition-all"
                  >
                    닫기
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin New Fact Registration Modal */}
      <AnimatePresence>
        {showAddModal && userRole === 'admin' && (
          <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#FFFDF9] rounded-3xl shadow-2xl border-4 border-amber-300 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 text-white flex items-center justify-between shadow-md">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🌟</span>
                  <div>
                    <h3 className="text-base font-black">흥미로운 사실 포스터 등록 (선생님 전용)</h3>
                    <p className="text-[11px] text-amber-100 font-medium">
                      학생들이 재미있게 읽을 수 있는 {subject === 'math' ? '수학' : '과학'} 이야기를 포스터로 제작합니다.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-lg hover:bg-white/20"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    포스터 제목 *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={
                      subject === 'math'
                        ? '예: 피보나치 수열과 해바라기 씨앗의 황금비'
                        : '예: 원자 속 99.99%가 빈 공간이라면?'
                    }
                    className="w-full px-3 py-2 bg-white rounded-xl border border-amber-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      부제목 (선택)
                    </label>
                    <input
                      type="text"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      placeholder="예: 자연 속에 숨겨진 마법의 비율"
                      className="w-full px-3 py-2 bg-white rounded-xl border border-amber-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      카테고리 *
                    </label>
                    <input
                      type="text"
                      required
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="예: 일상 속 과학, 수학사 비화"
                      className="w-full px-3 py-2 bg-white rounded-xl border border-amber-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                </div>

                {/* Photo / Camera upload */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    포스터 사진 / 일러스트 첨부 (선택)
                  </label>
                  {posterImage ? (
                    <div className="relative rounded-2xl border-2 border-amber-300 bg-slate-900 p-2 overflow-hidden flex flex-col items-center">
                      <img
                        src={posterImage}
                        alt="포스터 이미지"
                        className="max-h-48 rounded-xl object-contain w-full"
                      />
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => setPosterImage(null)}
                          className="px-3 py-1 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> 삭제
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="flex-1 py-2 px-3 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl text-xs font-bold text-amber-900 flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Camera className="w-4 h-4 text-amber-600" />
                        <span>카메라로 촬영</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Upload className="w-4 h-4 text-slate-500" />
                        <span>사진 파일 선택</span>
                      </button>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageFileRead(file);
                    }}
                    className="hidden"
                  />
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageFileRead(file);
                    }}
                    className="hidden"
                  />
                </div>

                {/* Content description */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    흥미로운 이야기 내용 *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="학생들이 이해하기 쉽고 흥미를 느낄 수 있도록 자세한 사실과 배경 이야기를 적어주세요..."
                    className="w-full px-3 py-2 bg-white rounded-xl border border-amber-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    태그 (띄어쓰기 또는 쉼표로 구분)
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="예: #황금비 #피보나치 #자연의원리"
                    className="w-full px-3 py-2 bg-white rounded-xl border border-amber-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                {/* Background Preset Selection */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    포스터 카드 배경 테마 선택
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {GRADIENT_PRESETS.map((preset) => (
                      <button
                        type="button"
                        key={preset.value}
                        onClick={() => setBgGradient(preset.value)}
                        className={`p-2 rounded-xl text-[11px] font-bold text-white bg-gradient-to-r ${preset.value} border-2 transition-all ${
                          bgGradient === preset.value
                            ? 'border-amber-400 ring-2 ring-amber-300 scale-102'
                            : 'border-transparent opacity-80 hover:opacity-100'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs rounded-xl shadow-md active:scale-95 transition-all"
                  >
                    포스터 등록 완료
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Lightbox for Zoom Image */}
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
