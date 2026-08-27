import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Eraser,
  RotateCcw,
  PenTool,
  TrendingUp,
  Minus,
  ArrowRight,
  Circle,
  Square,
  Triangle,
  Undo2,
  Redo2,
  Grid,
  Check,
  Sparkles,
  Sliders,
  Type,
  Plus,
  HelpCircle,
} from 'lucide-react';

interface DrawScratchpadProps {
  onSaveDrawing?: (dataUrl: string) => void;
  height?: number;
  initialBackground?: 'grid' | 'axes' | 'plain';
  showFunctionPlotterDefault?: boolean;
}

type ToolMode = 'pen' | 'line' | 'arrow' | 'circle' | 'rect' | 'triangle' | 'point' | 'eraser';

interface FunctionPreset {
  name: string;
  category: '1차함수' | '2차함수' | '삼각/기타' | '원/도형';
  expr: string;
  color: string;
  description: string;
}

const FUNCTION_PRESETS: FunctionPreset[] = [
  { name: 'y = x', category: '1차함수', expr: 'x', color: '#2563EB', description: '기본 항등 직선' },
  { name: 'y = 2x - 1', category: '1차함수', expr: '2x - 1', color: '#2563EB', description: '기울기 2, y절편 -1' },
  { name: 'y = -x + 3', category: '1차함수', expr: '-x + 3', color: '#D97706', description: '우하향 일차함수' },
  { name: 'y = x²', category: '2차함수', expr: 'x^2', color: '#7C3AED', description: '원점 꼭짓점 포물선' },
  { name: 'y = -x² + 4', category: '2차함수', expr: '-x^2 + 4', color: '#DC2626', description: '위로 볼록, y절편 4' },
  { name: 'y = (x-2)² - 1', category: '2차함수', expr: '(x-2)^2 - 1', color: '#059669', description: '꼭짓점 (2, -1)' },
  { name: 'y = sin(x)', category: '삼각/기타', expr: 'sin(x)', color: '#0284C7', description: '사인 주기함수' },
  { name: 'y = cos(x)', category: '삼각/기타', expr: 'cos(x)', color: '#4F46E5', description: '코사인 주기함수' },
  { name: 'y = 1/x', category: '삼각/기타', expr: '1/x', color: '#EA580C', description: '유리함수 쌍곡선' },
  { name: 'y = √x', category: '삼각/기타', expr: 'sqrt(x)', color: '#0D9488', description: '무리함수 곡선' },
];

export const DrawScratchpad: React.FC<DrawScratchpadProps> = ({
  onSaveDrawing,
  height = 240,
  initialBackground = 'axes',
  showFunctionPlotterDefault = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeTool, setActiveTool] = useState<ToolMode>('pen');
  const [strokeColor, setStrokeColor] = useState('#2563EB');
  const [lineWidth, setLineWidth] = useState(3);
  const [bgType, setBgType] = useState<'grid' | 'axes' | 'plain'>(initialBackground);
  const [showPlotter, setShowPlotter] = useState(showFunctionPlotterDefault);
  const [customExpr, setCustomExpr] = useState('x^2 - 2');
  const [customExprColor, setCustomExprColor] = useState('#DC2626');
  const [plotError, setPlotError] = useState<string | null>(null);

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [snapshot, setSnapshot] = useState<ImageData | null>(null);

  // Undo / Redo history stacks
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Coordinate system configuration
  // Virtual math range: X from -rangeX to +rangeX, Y from -rangeY to +rangeY
  const [rangeX] = useState(6);
  const [rangeY] = useState(6);

  // Convert virtual math coords (x, y) to canvas pixel coords (px, py)
  const mathToPixel = useCallback(
    (mx: number, my: number, canvasWidth: number, canvasHeight: number) => {
      const centerX = canvasWidth / 2;
      const centerY = canvasHeight / 2;
      const scaleX = canvasWidth / (rangeX * 2);
      const scaleY = canvasHeight / (rangeY * 2);
      return {
        px: centerX + mx * scaleX,
        py: centerY - my * scaleY, // Invert Y for canvas
      };
    },
    [rangeX, rangeY]
  );

  // Render Background Grid and Coordinate Axes
  const renderBackground = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number, type: 'grid' | 'axes' | 'plain') => {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      if (type === 'plain') return;

      const centerX = width / 2;
      const centerY = height / 2;
      const stepX = width / (rangeX * 2);
      const stepY = height / (rangeY * 2);

      // 1. Draw grid lines
      ctx.strokeStyle = '#F1F5F9';
      ctx.lineWidth = 1;
      for (let x = centerX % stepX; x < width; x += stepX) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = centerY % stepY; y < height; y += stepY) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. If 'axes' mode, draw bold X and Y axes with Origin & Tick Labels
      if (type === 'axes') {
        ctx.strokeStyle = '#94A3B8';
        ctx.lineWidth = 2;

        // X-Axis
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        ctx.lineTo(width, centerY);
        ctx.stroke();

        // X-Axis Arrow
        ctx.beginPath();
        ctx.moveTo(width - 8, centerY - 4);
        ctx.lineTo(width, centerY);
        ctx.lineTo(width - 8, centerY + 4);
        ctx.fillStyle = '#94A3B8';
        ctx.fill();

        // Y-Axis
        ctx.beginPath();
        ctx.moveTo(centerX, height);
        ctx.lineTo(centerX, 0);
        ctx.stroke();

        // Y-Axis Arrow
        ctx.beginPath();
        ctx.moveTo(centerX - 4, 8);
        ctx.lineTo(centerX, 0);
        ctx.lineTo(centerX + 4, 8);
        ctx.fillStyle = '#94A3B8';
        ctx.fill();

        // Origin 'O' label & Axis Labels 'x', 'y'
        ctx.font = 'bold 12px Pretendard, sans-serif';
        ctx.fillStyle = '#64748B';
        ctx.fillText('O', centerX - 12, centerY + 14);
        ctx.fillText('x', width - 12, centerY + 16);
        ctx.fillText('y', centerX + 8, 14);

        // Tick marks and numeric labels
        ctx.font = '10px Pretendard, sans-serif';
        ctx.fillStyle = '#94A3B8';
        ctx.textAlign = 'center';

        // X ticks
        for (let i = -rangeX + 1; i < rangeX; i++) {
          if (i === 0) continue;
          const pos = mathToPixel(i, 0, width, height);
          ctx.beginPath();
          ctx.moveTo(pos.px, centerY - 3);
          ctx.lineTo(pos.px, centerY + 3);
          ctx.stroke();
          ctx.fillText(i.toString(), pos.px, centerY + 14);
        }

        // Y ticks
        ctx.textAlign = 'right';
        for (let j = -rangeY + 1; j < rangeY; j++) {
          if (j === 0) continue;
          const pos = mathToPixel(0, j, width, height);
          ctx.beginPath();
          ctx.moveTo(centerX - 3, pos.py);
          ctx.lineTo(centerX + 3, pos.py);
          ctx.stroke();
          ctx.fillText(j.toString(), centerX - 6, pos.py + 3);
        }
      }
    },
    [mathToPixel, rangeX, rangeY]
  );

  // Initialize Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    renderBackground(ctx, canvas.width, canvas.height, bgType);
    const initialImg = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory([initialImg]);
    setHistoryIndex(0);
  }, [bgType, renderBackground]);

  // Save current canvas state to history
  const pushHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => {
      const updated = prev.slice(0, historyIndex + 1);
      return [...updated, currentData];
    });
    setHistoryIndex((prev) => prev + 1);

    if (onSaveDrawing) {
      onSaveDrawing(canvas.toDataURL('image/png'));
    }
  }, [historyIndex, onSaveDrawing]);

  // Safe Math Expression Evaluator
  const evaluateMathExpr = (expr: string, x: number): number | null => {
    try {
      let parsed = expr.toLowerCase().replace(/\s+/g, '');
      if (parsed.startsWith('y=')) parsed = parsed.substring(2);
      if (parsed.startsWith('f(x)=')) parsed = parsed.substring(5);

      // Handle power exponents like (x-2)^2 or x^2 using Math.pow
      parsed = parsed.replace(/([a-zA-Z0-9_\.\(\)]+)\^([a-zA-Z0-9_\.\(\)]+)/g, 'Math.pow($1,$2)');

      // Handle trigonometric and common functions
      parsed = parsed
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/sqrt\(/g, 'Math.sqrt(')
        .replace(/abs\(/g, 'Math.abs(')
        .replace(/log\(/g, 'Math.log(')
        .replace(/pi/g, 'Math.PI');

      // Insert multiplication for e.g. 2x -> 2*x
      parsed = parsed.replace(/(\d)x/g, '$1*x');
      parsed = parsed.replace(/x(\d)/g, 'x*$1');
      parsed = parsed.replace(/\)x/g, ')*x');
      parsed = parsed.replace(/x\(/g, 'x*(');

      // eslint-disable-next-line @typescript-eslint/no-implied-eval
      const fn = new Function('x', 'Math', `with(Math){ return (${parsed}); }`);
      const val = fn(x, Math);
      if (typeof val === 'number' && !isNaN(val) && isFinite(val)) {
        return val;
      }
      return null;
    } catch {
      return null;
    }
  };

  // Plot Mathematical Function on Coordinate System
  const plotFunction = (expr: string, color: string = '#2563EB') => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setPlotError(null);

    // Test a sample point to check expression syntax validity
    const testVal = evaluateMathExpr(expr, 1);
    if (testVal === null && evaluateMathExpr(expr, 0) === null) {
      setPlotError('수식을 확인해주세요. (예: 2x - 1, x^2 - 3, sin(x), sqrt(x))');
      return;
    }

    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const step = 0.05; // High resolution sampling
    let hasStarted = false;

    ctx.beginPath();

    for (let x = -rangeX; x <= rangeX; x += step) {
      const y = evaluateMathExpr(expr, x);

      if (y === null || Math.abs(y) > rangeY * 2.5) {
        hasStarted = false;
        continue;
      }

      const pixel = mathToPixel(x, y, canvas.width, canvas.height);

      if (!hasStarted) {
        ctx.moveTo(pixel.px, pixel.py);
        hasStarted = true;
      } else {
        ctx.lineTo(pixel.px, pixel.py);
      }
    }

    ctx.stroke();

    // Draw equation label near top-right of graph
    ctx.font = 'bold 13px Pretendard, sans-serif';
    ctx.fillStyle = color;
    ctx.textAlign = 'left';
    ctx.fillText(`y = ${expr}`, 16, 26);

    ctx.restore();
    pushHistory();
  };

  // Plot Circle (x-a)^2 + (y-b)^2 = r^2
  const plotCircleEquation = (a: number, b: number, r: number, color: string = '#059669') => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const center = mathToPixel(a, b, canvas.width, canvas.height);
    const scaleX = canvas.width / (rangeX * 2);
    const pixelRadius = r * scaleX;

    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(center.px, center.py, pixelRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Center point
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(center.px, center.py, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = 'bold 12px Pretendard, sans-serif';
    ctx.fillText(`(${a}, ${b})`, center.px + 6, center.py - 6);
    ctx.fillText(`r=${r}`, center.px + pixelRadius / 1.5, center.py - 8);

    ctx.restore();
    pushHistory();
  };

  // Mouse / Touch Handlers
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCanvasCoords(e);
    setIsDrawing(true);
    setStartPos(coords);

    // Save snapshot for shape preview
    setSnapshot(ctx.getImageData(0, 0, canvas.width, canvas.height));

    if (activeTool === 'pen' || activeTool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
    } else if (activeTool === 'point') {
      // Draw point immediately
      ctx.save();
      ctx.fillStyle = strokeColor;
      ctx.beginPath();
      ctx.arc(coords.x, coords.y, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Calculate approximate math coord
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const scaleX = canvas.width / (rangeX * 2);
      const scaleY = canvas.height / (rangeY * 2);
      const mx = Math.round(((coords.x - centerX) / scaleX) * 10) / 10;
      const my = Math.round(((centerY - coords.y) / scaleY) * 10) / 10;

      ctx.font = 'bold 11px Pretendard, sans-serif';
      ctx.fillStyle = strokeColor;
      ctx.fillText(`(${mx}, ${my})`, coords.x + 6, coords.y - 6);
      ctx.restore();
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPos) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCanvasCoords(e);

    if (activeTool === 'pen') {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    } else if (activeTool === 'eraser') {
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 18;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    } else if (snapshot) {
      // Shape tools: restore previous snapshot and draw live preview
      ctx.putImageData(snapshot, 0, 0);
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (activeTool === 'line') {
        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
      } else if (activeTool === 'arrow') {
        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();

        // Arrow head
        const angle = Math.atan2(coords.y - startPos.y, coords.x - startPos.x);
        const headlen = 10;
        ctx.beginPath();
        ctx.moveTo(coords.x, coords.y);
        ctx.lineTo(coords.x - headlen * Math.cos(angle - Math.PI / 6), coords.y - headlen * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(coords.x - headlen * Math.cos(angle + Math.PI / 6), coords.y - headlen * Math.sin(angle + Math.PI / 6));
        ctx.fillStyle = strokeColor;
        ctx.fill();
      } else if (activeTool === 'circle') {
        const radius = Math.hypot(coords.x - startPos.x, coords.y - startPos.y);
        ctx.beginPath();
        ctx.arc(startPos.x, startPos.y, radius, 0, Math.PI * 2);
        ctx.stroke();
      } else if (activeTool === 'rect') {
        ctx.beginPath();
        ctx.strokeRect(startPos.x, startPos.y, coords.x - startPos.x, coords.y - startPos.y);
      } else if (activeTool === 'triangle') {
        ctx.beginPath();
        ctx.moveTo(startPos.x + (coords.x - startPos.x) / 2, startPos.y);
        ctx.lineTo(coords.x, coords.y);
        ctx.lineTo(startPos.x, coords.y);
        ctx.closePath();
        ctx.stroke();
      }
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    setStartPos(null);
    setSnapshot(null);
    pushHistory();
  };

  // Undo / Redo
  const handleUndo = () => {
    if (historyIndex <= 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const targetIdx = historyIndex - 1;
    ctx.putImageData(history[targetIdx], 0, 0);
    setHistoryIndex(targetIdx);

    if (onSaveDrawing) onSaveDrawing(canvas.toDataURL('image/png'));
  };

  const handleRedo = () => {
    if (historyIndex >= history.length - 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const targetIdx = historyIndex + 1;
    ctx.putImageData(history[targetIdx], 0, 0);
    setHistoryIndex(targetIdx);

    if (onSaveDrawing) onSaveDrawing(canvas.toDataURL('image/png'));
  };

  // Reset / Clear Canvas
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    renderBackground(ctx, canvas.width, canvas.height, bgType);
    pushHistory();
  };

  return (
    <div className="w-full bg-white rounded-3xl border-2 border-slate-200/90 shadow-md p-3.5 flex flex-col gap-3">
      {/* 1. Main Toolbar Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
        {/* Tool Mode Selectors */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveTool('pen')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 transition-all ${
              activeTool === 'pen' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
            title="자유형 펜 (수식 & 풀이 필기)"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>펜</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTool('line')}
            className={`px-2 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 transition-all ${
              activeTool === 'line' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
            title="직선 그리기"
          >
            <Minus className="w-3.5 h-3.5" />
            <span>직선</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTool('arrow')}
            className={`px-2 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 transition-all ${
              activeTool === 'arrow' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
            title="화살표 (벡터 / 방향선)"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTool('circle')}
            className={`px-2 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 transition-all ${
              activeTool === 'circle' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
            title="원 그리기"
          >
            <Circle className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTool('triangle')}
            className={`px-2 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 transition-all ${
              activeTool === 'triangle' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
            title="삼각형 그리기"
          >
            <Triangle className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTool('point')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 transition-all ${
              activeTool === 'point' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
            title="좌표 점 찍기 (클릭 시 좌표 (x,y) 자동 마킹)"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            <span>좌표점</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTool('eraser')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 transition-all ${
              activeTool === 'eraser' ? 'bg-rose-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
            title="지우개"
          >
            <Eraser className="w-3.5 h-3.5" />
            <span>지우개</span>
          </button>
        </div>

        {/* Function Plotter Toggle Button */}
        <button
          type="button"
          onClick={() => setShowPlotter(!showPlotter)}
          className={`px-3 py-1.5 rounded-2xl text-xs font-black flex items-center gap-1.5 border transition-all active:scale-95 ${
            showPlotter
              ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
              : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>함수 그래프 도구 {showPlotter ? '▲' : '▼'}</span>
        </button>

        {/* Action controls (Undo, Redo, Clear, Grid Style) */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="p-1.5 rounded-xl text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
            title="되돌리기 (Undo)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="p-1.5 rounded-xl text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
            title="다시 실행 (Redo)"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-200 mx-1" />

          {/* Background Toggle (Axes vs Grid vs Plain) */}
          <button
            type="button"
            onClick={() => {
              const next = bgType === 'axes' ? 'grid' : bgType === 'grid' ? 'plain' : 'axes';
              setBgType(next);
            }}
            className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-[11px] font-bold text-slate-700 flex items-center gap-1"
            title="배경 스타일 변경 (좌표평면 / 모눈종이 / 무지)"
          >
            <Grid className="w-3.5 h-3.5 text-slate-500" />
            <span>
              {bgType === 'axes' ? '좌표평면 (O, x, y)' : bgType === 'grid' ? '모눈종이' : '무지'}
            </span>
          </button>

          <button
            type="button"
            onClick={clearCanvas}
            className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-rose-600 text-[11px] font-bold flex items-center gap-1"
            title="캔버스 초기화"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>초기화</span>
          </button>
        </div>
      </div>

      {/* 2. Color & Stroke Palette */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-500 mr-1">색상</span>
          {['#1E293B', '#2563EB', '#DC2626', '#059669', '#7C3AED', '#EA580C'].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => {
                setStrokeColor(c);
                if (activeTool === 'eraser') setActiveTool('pen');
              }}
              className={`w-5 h-5 rounded-full border-2 transition-all ${
                strokeColor === c && activeTool !== 'eraser'
                  ? 'scale-125 border-slate-900 shadow-md ring-2 ring-blue-300'
                  : 'border-white hover:scale-110 shadow-2xs'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
          <span>굵기</span>
          {[2, 3, 5].map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => setLineWidth(w)}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-black transition-all ${
                lineWidth === w
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {w === 2 ? '얇게' : w === 3 ? '보통' : '굵게'}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Mathematical Function Plotter Panel (Collapsible) */}
      {showPlotter && (
        <div className="p-3 bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-sky-50/90 rounded-2xl border-2 border-blue-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-blue-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              함수 그래프 바로 플롯하기 (클릭 시 좌표평면에 즉시 렌더링)
            </span>
            <span className="text-[10px] text-blue-700 font-bold">
              Tip: 그래프 위에 펜으로 교점이나 해설을 자유롭게 필기하세요!
            </span>
          </div>

          {/* Quick Presets Carousel */}
          <div className="flex flex-wrap gap-1.5">
            {FUNCTION_PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => {
                  plotFunction(preset.expr, preset.color);
                  setCustomExpr(preset.expr);
                }}
                className="px-2.5 py-1 rounded-xl bg-white hover:bg-blue-600 hover:text-white border border-blue-200 text-slate-800 text-xs font-black shadow-2xs transition-all active:scale-95 flex items-center gap-1 group"
                title={`${preset.description} - 클릭 시 플롯`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: preset.color }} />
                <span>{preset.name}</span>
              </button>
            ))}

            {/* Circle preset */}
            <button
              type="button"
              onClick={() => plotCircleEquation(0, 0, 3, '#059669')}
              className="px-2.5 py-1 rounded-xl bg-white hover:bg-emerald-600 hover:text-white border border-emerald-200 text-slate-800 text-xs font-black shadow-2xs transition-all active:scale-95 flex items-center gap-1"
              title="원 x² + y² = 9 (반지름 3)"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span>x² + y² = 9</span>
            </button>
          </div>

          {/* Custom Equation Input Form */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-blue-200/60">
            <span className="text-xs font-black text-blue-900">y =</span>
            <input
              type="text"
              value={customExpr}
              onChange={(e) => setCustomExpr(e.target.value)}
              placeholder="예: 2x - 3, x^2 - 4, sin(x), -x^2 + 2x"
              className="flex-1 min-w-[160px] px-3 py-1.5 bg-white rounded-xl border border-blue-300 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs font-mono"
            />

            {/* Color picker for custom graph */}
            <div className="flex items-center gap-1">
              {['#DC2626', '#2563EB', '#059669', '#7C3AED'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCustomExprColor(c)}
                  className={`w-4 h-4 rounded-full border ${
                    customExprColor === c ? 'scale-125 border-slate-900' : 'border-white'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => plotFunction(customExpr, customExprColor)}
              className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-sm transition-all active:scale-95 flex items-center gap-1"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>그래프 그리기</span>
            </button>
          </div>

          {plotError && (
            <p className="text-[11px] font-bold text-rose-600">{plotError}</p>
          )}
        </div>
      )}

      {/* 4. Canvas Element */}
      <div className="relative w-full rounded-2xl overflow-hidden border-2 border-slate-200 touch-none shadow-inner bg-white">
        <canvas
          ref={canvasRef}
          width={700}
          height={height * 2}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full bg-white cursor-crosshair block select-none"
          style={{ height: `${height}px` }}
        />

        {/* Small floating helper tag */}
        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-slate-900/60 backdrop-blur-xs text-[10px] text-white font-bold pointer-events-none">
          {activeTool === 'pen'
            ? '✏️ 자유형 필기 모드'
            : activeTool === 'point'
            ? '📍 좌표점 마킹 모드'
            : activeTool === 'eraser'
            ? '🧽 지우개'
            : '📐 도형 도구'}
        </div>
      </div>
    </div>
  );
};
