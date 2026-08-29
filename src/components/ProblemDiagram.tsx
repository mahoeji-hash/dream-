import React from 'react';

interface ProblemDiagramProps {
  type?: 'graph_parabola' | 'triangle_geometry' | 'chemical_reaction' | 'physics_pulley' | 'biology_cell' | 'linear_function' | 'cube_volume';
  label?: string;
}

export const ProblemDiagram: React.FC<ProblemDiagramProps> = ({ type, label }) => {
  if (!type) return null;

  return (
    <div id="problem-diagram-box" className="w-full my-3 p-3 bg-amber-50/60 rounded-2xl border border-amber-200/80 flex flex-col items-center justify-center">
      <div className="w-full max-w-[320px] aspect-[16/9] flex items-center justify-center bg-white rounded-xl shadow-inner border border-amber-100 p-2 overflow-hidden">
        {type === 'graph_parabola' && (
          <svg viewBox="0 0 300 160" className="w-full h-full">
            {/* Coordinate axes */}
            <line x1="20" y1="130" x2="280" y2="130" stroke="#94A3B8" strokeWidth="2" markerEnd="url(#arrow)" />
            <line x1="150" y1="150" x2="150" y2="15" stroke="#94A3B8" strokeWidth="2" />
            <text x="275" y="145" fill="#64748B" fontSize="12" fontWeight="bold">x</text>
            <text x="135" y="25" fill="#64748B" fontSize="12" fontWeight="bold">y</text>
            <text x="138" y="142" fill="#64748B" fontSize="10">O</text>

            {/* Parabola curve intersecting x-axis at two points */}
            <path
              d="M 50 145 Q 150 20 250 145"
              fill="none"
              stroke="#2563EB"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Intersections */}
            <circle cx="75" cy="130" r="4.5" fill="#EF4444" />
            <circle cx="225" cy="130" r="4.5" fill="#EF4444" />
            <text x="70" y="120" fill="#EF4444" fontSize="11" fontWeight="bold">α</text>
            <text x="220" y="120" fill="#EF4444" fontSize="11" fontWeight="bold">β</text>

            {/* Peak / Vertex */}
            <circle cx="150" cy="51" r="4" fill="#F59E0B" />
            <line x1="150" y1="51" x2="150" y2="130" stroke="#F59E0B" strokeDasharray="3 3" strokeWidth="1.5" />
            <text x="155" y="48" fill="#D97706" fontSize="10" fontWeight="bold">꼭짓점 (대칭축)</text>
            <rect x="180" y="15" width="100" height="22" rx="6" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="1" />
            <text x="186" y="30" fill="#1D4ED8" fontSize="10" fontWeight="bold">D &gt; 0 (두 실근)</text>
          </svg>
        )}

        {type === 'linear_function' && (
          <svg viewBox="0 0 300 160" className="w-full h-full">
            <line x1="20" y1="130" x2="280" y2="130" stroke="#94A3B8" strokeWidth="2" />
            <line x1="150" y1="150" x2="150" y2="15" stroke="#94A3B8" strokeWidth="2" />
            <text x="275" y="145" fill="#64748B" fontSize="12" fontWeight="bold">x</text>
            <text x="135" y="25" fill="#64748B" fontSize="12" fontWeight="bold">y</text>

            {/* Line 1 */}
            <line x1="70" y1="150" x2="210" y2="20" stroke="#2563EB" strokeWidth="3" />
            {/* Line 2 (Perpendicular) */}
            <line x1="60" y1="40" x2="240" y2="130" stroke="#10B981" strokeWidth="3" />

            {/* Right angle marker */}
            <path d="M 130 92 L 140 85 L 148 95" fill="none" stroke="#EF4444" strokeWidth="2" />
            <text x="145" y="70" fill="#EF4444" fontSize="11" fontWeight="bold">90° (m₁·m₂ = -1)</text>
          </svg>
        )}

        {type === 'physics_pulley' && (
          <svg viewBox="0 0 300 160" className="w-full h-full">
            {/* Cliff / Platform */}
            <rect x="20" y="30" width="70" height="120" fill="#CBD5E1" stroke="#64748B" strokeWidth="2" />
            {/* Ground */}
            <line x1="20" y1="150" x2="280" y2="150" stroke="#475569" strokeWidth="3" />

            {/* Ball A: Free fall */}
            <circle cx="55" cy="40" r="10" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="2" />
            <text x="50" y="44" fill="#FFFFFF" fontSize="10" fontWeight="bold">A</text>
            <path d="M 55 55 L 55 140" stroke="#3B82F6" strokeWidth="2" strokeDasharray="3 3" />
            <text x="65" y="90" fill="#1D4ED8" fontSize="10">자유낙하 v_y = gt</text>

            {/* Ball B: Horizontal projection */}
            <circle cx="95" cy="40" r="12" fill="#F59E0B" stroke="#D97706" strokeWidth="2" />
            <text x="91" y="44" fill="#FFFFFF" fontSize="10" fontWeight="bold">B</text>
            <line x1="110" y1="40" x2="140" y2="40" stroke="#EF4444" strokeWidth="2.5" markerEnd="url(#arrow)" />
            <text x="110" y="32" fill="#EF4444" fontSize="9" fontWeight="bold">v₀ = 10m/s</text>
            <path d="M 95 40 Q 180 50 240 148" fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeDasharray="4 3" />

            {/* Landing Comparison */}
            <rect x="160" y="110" width="120" height="30" rx="6" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1" />
            <text x="166" y="128" fill="#B45309" fontSize="10" fontWeight="bold">동시 바닥 도달! (t_A = t_B)</text>
          </svg>
        )}

        {type === 'chemical_reaction' && (
          <svg viewBox="0 0 300 160" className="w-full h-full">
            {/* Beaker */}
            <path d="M 90 30 L 90 140 Q 90 150 100 150 L 200 150 Q 210 150 210 140 L 210 30" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2.5" />
            {/* Liquid level */}
            <rect x="92" y="60" width="116" height="88" fill="#38BDF8" opacity="0.3" rx="4" />

            {/* Ions floating */}
            <circle cx="120" cy="85" r="12" fill="#93C5FD" />
            <text x="112" y="89" fill="#1E40AF" fontSize="10" fontWeight="bold">Na⁺</text>

            <circle cx="170" cy="85" r="12" fill="#93C5FD" />
            <text x="162" y="89" fill="#1E40AF" fontSize="10" fontWeight="bold">Na⁺</text>

            <circle cx="145" cy="115" r="12" fill="#86EFAC" />
            <text x="138" y="119" fill="#166534" fontSize="10" fontWeight="bold">Cl⁻</text>

            <circle cx="180" cy="120" r="12" fill="#FCA5A5" />
            <text x="172" y="124" fill="#991B1B" fontSize="10" fontWeight="bold">OH⁻</text>

            {/* Water molecule formed */}
            <text x="105" y="138" fill="#0369A1" fontSize="9" fontWeight="bold">H₂O 생성</text>

            {/* Color indicator badge */}
            <rect x="220" y="40" width="70" height="40" rx="8" fill="#1D4ED8" />
            <text x="226" y="58" fill="#FFFFFF" fontSize="10" fontWeight="bold">BTB: 파랑</text>
            <text x="228" y="72" fill="#93C5FD" fontSize="8">(염기성 상태)</text>
          </svg>
        )}

        {type === 'biology_cell' && (
          <svg viewBox="0 0 300 160" className="w-full h-full">
            {/* Plant Cell (Hexagonal with Cell Wall) */}
            <polygon points="40,40 110,25 150,65 130,135 60,145 20,105" fill="#DCFCE7" stroke="#16A34A" strokeWidth="4" />
            <polygon points="45,45 105,32 142,68 124,130 62,138 28,102" fill="#F0FDF4" stroke="#4ADE80" strokeWidth="1.5" />

            {/* Chloroplasts */}
            <ellipse cx="60" cy="65" rx="10" ry="6" fill="#22C55E" />
            <ellipse cx="110" cy="55" rx="10" ry="6" fill="#22C55E" />
            <text x="50" y="68" fill="#FFFFFF" fontSize="7" fontWeight="bold">엽록체</text>

            {/* Nucleus */}
            <circle cx="85" cy="100" r="14" fill="#93C5FD" stroke="#3B82F6" strokeWidth="1.5" />
            <text x="80" y="103" fill="#1E40AF" fontSize="8" fontWeight="bold">핵</text>

            {/* Vacuole */}
            <ellipse cx="115" cy="105" rx="16" ry="12" fill="#E0F2FE" stroke="#0284C7" strokeDasharray="2 2" />
            <text x="108" y="108" fill="#0369A1" fontSize="8">액포</text>

            {/* Legend */}
            <rect x="175" y="30" width="115" height="100" rx="8" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1" />
            <text x="185" y="50" fill="#0F172A" fontSize="10" fontWeight="bold">🌱 식물 세포 특징</text>
            <text x="185" y="70" fill="#15803D" fontSize="9">• 세포벽: 형태 지탱</text>
            <text x="185" y="88" fill="#15803D" fontSize="9">• 엽록체: 광합성</text>
            <text x="185" y="106" fill="#0369A1" fontSize="9">• 발달된 액포</text>
          </svg>
        )}
      </div>

      {label && (
        <p className="text-xs text-amber-900/80 font-medium mt-2 text-center">
          📊 {label}
        </p>
      )}
    </div>
  );
};
export default ProblemDiagram;