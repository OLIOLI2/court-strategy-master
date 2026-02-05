import React, { useState, useRef, useEffect } from 'react';
import { 
  Users, 
  Map as MapIcon, 
  Pencil, 
  Trash2, 
  RotateCcw, 
  Lightbulb, 
  Trophy,
  ChevronRight,
  Move,
  UserPlus,
  UserMinus,
  CheckCircle,
  XCircle,
  Play
} from 'lucide-react';

// 코트 종류 정의 (한글 이름만 유지)
const COURT_TYPES = {
  basketball: {
    name: '농구',
    color: '#f97316',
    ratio: 1.6,
    lines: (w, h) => (
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <rect x="5%" y="5%" width="90%" height="90%" fill="none" stroke="white" strokeWidth="2" />
        <line x1="50%" y1="5%" x2="50%" y2="95%" stroke="white" strokeWidth="2" />
        <circle cx="50%" cy="50%" r="10%" fill="none" stroke="white" strokeWidth="2" />
        <path d={`M ${w*0.05},${h*0.2} L ${w*0.12},${h*0.2} Q ${w*0.35},${h*0.2} ${w*0.35},${h*0.5} T ${w*0.12},${h*0.8} L ${w*0.05},${h*0.8}`} fill="none" stroke="white" strokeWidth="2" />
        <path d={`M ${w*0.95},${h*0.2} L ${w*0.88},${h*0.2} Q ${w*0.65},${h*0.2} ${w*0.65},${h*0.5} T ${w*0.88},${h*0.8} L ${w*0.95},${h*0.8}`} fill="none" stroke="white" strokeWidth="2" />
        <line x1="7%" y1="42%" x2="7%" y2="58%" stroke="white" strokeWidth="4" />
        <circle cx="9%" cy="50%" r="2%" fill="none" stroke="#ef4444" strokeWidth="3" />
        <line x1="93%" y1="42%" x2="93%" y2="58%" stroke="white" strokeWidth="4" />
        <circle cx="91%" cy="50%" r="2%" fill="none" stroke="#ef4444" strokeWidth="3" />
      </svg>
    )
  },
  futsal: {
    name: '풋살',
    color: '#22c55e',
    ratio: 1.5,
    lines: (w, h) => (
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <rect x="5%" y="5%" width="90%" height="90%" fill="none" stroke="white" strokeWidth="2" />
        <line x1="50%" y1="5%" x2="50%" y2="95%" stroke="white" strokeWidth="2" />
        <circle cx="50%" cy="50%" r="8%" fill="none" stroke="white" strokeWidth="2" />
        <path d={`M ${w*0.05},${h*0.25} A ${w*0.15} ${h*0.25} 0 0 1 ${w*0.05} ${h*0.75}`} fill="none" stroke="white" strokeWidth="2" />
        <path d={`M ${w*0.95},${h*0.25} A ${w*0.15} ${h*0.25} 0 0 0 ${w*0.95} ${h*0.75}`} fill="none" stroke="white" strokeWidth="2" />
        <rect x="2.5%" y="40%" width="2.5%" height="20%" fill="none" stroke="white" strokeWidth="3" />
        <rect x="95%" y="40%" width="2.5%" height="20%" fill="none" stroke="white" strokeWidth="3" />
      </svg>
    )
  },
  volleyball: {
    name: '배구',
    color: '#3b82f6',
    ratio: 1.8,
    lines: (w, h) => (
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <rect x="10%" y="10%" width="80%" height="80%" fill="none" stroke="white" strokeWidth="2" />
        <line x1="36.6%" y1="10%" x2="36.6%" y2="90%" stroke="white" strokeWidth="2" strokeDasharray="5,5" />
        <line x1="63.3%" y1="10%" x2="63.3%" y2="90%" stroke="white" strokeWidth="2" strokeDasharray="5,5" />
        <rect x="49.5%" y="5%" width="1%" height="90%" fill="rgba(255,255,255,0.3)" />
        <line x1="50%" y1="5%" x2="50%" y2="95%" stroke="#cbd5e1" strokeWidth="6" />
        {[...Array(10)].map((_, i) => (
          <line key={i} x1="49.5%" y1={`${10 + i * 8}%`} x2="50.5%" y2={`${10 + i * 8}%`} stroke="white" strokeWidth="1" />
        ))}
      </svg>
    )
  }
};

const STRATEGY_CHALLENGES = [
  {
    id: 1,
    title: "농구: 공간 창출",
    courtType: 'basketball',
    description: "공격수 1명을 코너 구석(흰 점선 구역)으로 이동시켜 수비수를 끌어내고, 골밑의 동료에게 패스 길을 열어주세요.",
    tip: "수비수(파랑)는 사람을 따라가는 경향이 있습니다. 공간을 넓게 쓰세요!",
    initialPlayers: [
      { id: 1, x: 25, y: 50, team: 'A', role: '공격1' },
      { id: 2, x: 25, y: 35, team: 'A', role: '공격2' },
      { id: 3, x: 18, y: 45, team: 'B', role: '수비1' },
      { id: 'ball', x: 25, y: 50, team: 'none', isBall: true }
    ],
    targetZone: { x: 5, y: 85, w: 15, h: 10, type: 'rect' },
    checkSuccess: (players) => {
      return players.some(p => p.team === 'A' && p.x < 20 && p.y > 75);
    }
  },
  {
    id: 2,
    title: "풋살: 다이아몬드 대형",
    courtType: 'futsal',
    description: "선수 4명을 배치하여 공수 균형을 맞춘 다이아몬드(Diamond) 대형을 만드세요.",
    tip: "앞(피보), 양옆(알라), 뒤(픽소)에 균형있게 배치해야 합니다.",
    initialPlayers: [
      { id: 1, x: 48, y: 48, team: 'A', role: 'P' },
      { id: 2, x: 50, y: 50, team: 'A', role: 'P' },
      { id: 3, x: 52, y: 52, team: 'A', role: 'P' },
      { id: 4, x: 54, y: 54, team: 'A', role: 'P' },
      { id: 'ball', x: 20, y: 50, team: 'none', isBall: true }
    ],
    targetZone: { x: 50, y: 50, r: 25, type: 'circle' },
    checkSuccess: (players) => {
      const teamA = players.filter(p => p.team === 'A');
      if (teamA.length < 4) return false;
      const hasBack = teamA.some(p => p.x < 40);
      const hasFront = teamA.some(p => p.x > 60);
      const hasLeft = teamA.some(p => p.y < 35);
      const hasRight = teamA.some(p => p.y > 65);
      return hasBack && hasFront && hasLeft && hasRight;
    }
  },
  {
    id: 3,
    title: "배구: 기본 수비 대형",
    courtType: 'volleyball',
    description: "강력한 스파이크를 막기 위해 후방 3명의 수비수를 부채꼴 모양으로 넓게 배치하세요.",
    tip: "코트 끝쪽 라인 근처를 빈틈없이 커버하는 것이 핵심입니다.",
    initialPlayers: [
      { id: 1, x: 70, y: 50, team: 'A', role: '수비' },
      { id: 2, x: 75, y: 45, team: 'A', role: '수비' },
      { id: 3, x: 75, y: 55, team: 'A', role: '수비' },
      { id: 'ball', x: 20, y: 50, team: 'none', isBall: true }
    ],
    targetZone: { x: 85, y: 50, w: 10, h: 80, type: 'rect' },
    checkSuccess: (players) => {
      const teamA = players.filter(p => p.team === 'A' && p.x > 75);
      const spread = Math.max(...teamA.map(p => p.y)) - Math.min(...teamA.map(p => p.y));
      return teamA.length >= 3 && spread > 40;
    }
  },
  {
    id: 4,
    title: "농구: 픽앤롤",
    courtType: 'basketball',
    description: "스크린을 건 센터(공격2)가 골밑으로 빠르게 움직이는 '롤(Roll)' 동작을 수행해보세요.",
    tip: "스크린 이후 수비수의 뒤쪽 빈 공간(골대 근처)으로 파고들어야 합니다.",
    initialPlayers: [
      { id: 1, x: 35, y: 40, team: 'A', role: '가드' },
      { id: 2, x: 30, y: 45, team: 'A', role: '센터' },
      { id: 3, x: 28, y: 40, team: 'B', role: '수비' },
      { id: 'ball', x: 35, y: 40, team: 'none', isBall: true }
    ],
    targetZone: { x: 10, y: 50, r: 10, type: 'circle' },
    checkSuccess: (players) => {
      const center = players.find(p => p.role === '센터');
      return center && center.x < 15 && center.y > 40 && center.y < 60;
    }
  },
  {
    id: 5,
    title: "풋살: 전방 압박",
    courtType: 'futsal',
    description: "상대방이 빌드업을 못하도록 모든 선수가 하프라인을 넘어 전진 압박 대형을 갖추세요.",
    tip: "상대 코트(오른쪽)로 모든 선수가 전진해야 압박의 강도가 높아집니다.",
    initialPlayers: [
      { id: 1, x: 40, y: 30, team: 'A', role: '압박' },
      { id: 2, x: 40, y: 50, team: 'A', role: '압박' },
      { id: 3, x: 40, y: 70, team: 'A', role: '압박' },
      { id: 'ball', x: 80, y: 50, team: 'none', isBall: true }
    ],
    targetZone: { x: 75, y: 50, w: 40, h: 90, type: 'rect' },
    checkSuccess: (players) => {
      const teamA = players.filter(p => p.team === 'A');
      return teamA.every(p => p.x > 55);
    }
  },
  {
    id: 6,
    title: "배구: 세터의 이동",
    courtType: 'volleyball',
    description: "공격이 시작되자마자 후방에 있던 세터가 네트 앞 공격 위치(흰 원)로 이동하게 하세요.",
    tip: "세터는 리시브 직후 가장 먼저 네트 중앙으로 이동하여 토스를 준비해야 합니다.",
    initialPlayers: [
      { id: 1, x: 80, y: 80, team: 'A', role: '세터' },
      { id: 2, x: 70, y: 50, team: 'A', role: '공격' },
      { id: 3, x: 70, y: 20, team: 'A', role: '공격' },
      { id: 'ball', x: 20, y: 50, team: 'none', isBall: true }
    ],
    targetZone: { x: 55, y: 50, r: 8, type: 'circle' },
    checkSuccess: (players) => {
      const setter = players.find(p => p.role === '세터');
      return setter && setter.x < 65 && setter.x > 50 && setter.y > 40 && setter.y < 60;
    }
  }
];

const BallIcon = ({ type }) => {
  const commonProps = { viewBox: "0 0 100 100", className: "w-full h-full" };
  if (type === 'basketball') {
    return (
      <svg {...commonProps}>
        <circle cx="50" cy="50" r="45" fill="#f97316" stroke="#431407" strokeWidth="2" />
        <path d="M 10,50 Q 50,50 90,50" fill="none" stroke="#431407" strokeWidth="3" />
        <path d="M 50,10 Q 50,50 50,90" fill="none" stroke="#431407" strokeWidth="3" />
        <path d="M 20,20 Q 50,50 80,80" fill="none" stroke="#431407" strokeWidth="2" />
        <path d="M 80,20 Q 50,50 20,80" fill="none" stroke="#431407" strokeWidth="2" />
      </svg>
    );
  }
  if (type === 'futsal') {
    return (
      <svg {...commonProps}>
        <circle cx="50" cy="50" r="45" fill="white" stroke="#1e293b" strokeWidth="2" />
        <path d="M 50,20 L 30,35 L 35,60 L 65,60 L 70,35 Z" fill="#1e293b" />
        <path d="M 50,20 L 50,5" fill="none" stroke="#1e293b" strokeWidth="2" />
        <path d="M 30,35 L 15,30" fill="none" stroke="#1e293b" strokeWidth="2" />
        <path d="M 35,60 L 25,75" fill="none" stroke="#1e293b" strokeWidth="2" />
        <path d="M 65,60 L 75,75" fill="none" stroke="#1e293b" strokeWidth="2" />
        <path d="M 70,35 L 85,30" fill="none" stroke="#1e293b" strokeWidth="2" />
      </svg>
    );
  }
  if (type === 'volleyball') {
    return (
      <svg {...commonProps}>
        <circle cx="50" cy="50" r="45" fill="#fde047" stroke="#1d4ed8" strokeWidth="2" />
        <path d="M 20,30 Q 50,50 80,30" fill="none" stroke="#1d4ed8" strokeWidth="4" />
        <path d="M 20,70 Q 50,50 80,70" fill="none" stroke="#1d4ed8" strokeWidth="4" />
        <path d="M 50,10 Q 50,50 50,90" fill="none" stroke="#1d4ed8" strokeWidth="4" />
        <circle cx="50" cy="50" r="45" fill="none" stroke="white" strokeWidth="2" strokeDasharray="1,5" />
      </svg>
    );
  }
  return <div className="w-full h-full rounded-full bg-slate-300" />;
};

const App = () => {
  const [courtType, setCourtType] = useState('basketball');
  const [players, setPlayers] = useState([
    { id: 1, x: 20, y: 30, team: 'A', role: '공격' },
    { id: 2, x: 20, y: 70, team: 'A', role: '공격' },
    { id: 3, x: 80, y: 50, team: 'B', role: '수비' },
    { id: 'ball', x: 50, y: 50, team: 'none', isBall: true }
  ]);
  const [drawing, setDrawing] = useState([]);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [activeTab, setActiveTab] = useState('board');
  const [currentChallengeIdx, setCurrentChallengeIdx] = useState(0);
  const [challengeResult, setChallengeResult] = useState(null);
  const [showHint, setShowHint] = useState(false);

  const containerRef = useRef(null);
  const isDrawingActive = useRef(false);

  const getCoords = (e) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    return { x, y };
  };

  const startChallenge = (idx) => {
    const challenge = STRATEGY_CHALLENGES[idx];
    setCourtType(challenge.courtType);
    setPlayers(JSON.parse(JSON.stringify(challenge.initialPlayers)));
    setDrawing([]);
    setChallengeResult(null);
    setShowHint(false);
    setCurrentChallengeIdx(idx);
    setActiveTab('challenge_play');
  };

  const checkChallenge = () => {
    const challenge = STRATEGY_CHALLENGES[currentChallengeIdx];
    const isSuccess = challenge.checkSuccess(players);
    setChallengeResult(isSuccess ? 'success' : 'fail');
  };

  const addPlayer = (team) => {
    const newId = Date.now();
    const newPlayer = {
      id: newId,
      x: 50,
      y: team === 'A' ? 20 : 80,
      team: team,
      role: team === 'A' ? '공격' : '수비'
    };
    setPlayers(prev => [...prev, newPlayer]);
  };

  const removePlayer = (id) => {
    if (id === 'ball') return;
    setPlayers(prev => prev.filter(p => p.id !== id));
  };

  const handleStartDrawing = (e) => {
    if (!isDrawingMode) return;
    e.target.setPointerCapture(e.pointerId);
    isDrawingActive.current = true;
    const point = getCoords(e);
    setDrawing(prev => [...prev, [point]]);
  };

  const handleMoveDrawing = (e) => {
    if (!isDrawingActive.current) return;
    const point = getCoords(e);
    setDrawing(prev => {
      if (prev.length === 0) return [[point]];
      const lastLine = prev[prev.length - 1];
      const newLine = [...lastLine, point];
      return [...prev.slice(0, -1), newLine];
    });
  };

  const handleEndDrawing = (e) => {
    if (isDrawingActive.current) {
      e.target.releasePointerCapture(e.pointerId);
      isDrawingActive.current = false;
    }
  };

  const handlePlayerDragStart = (e, id) => {
    if (isDrawingMode) return;
    if (isDeleteMode) {
      removePlayer(id);
      return;
    }
    e.stopPropagation();
    const onPointerMove = (moveEvent) => {
      const coords = getCoords(moveEvent);
      if (coords.x >= 0 && coords.x <= 100 && coords.y >= 0 && coords.y <= 100) {
        setPlayers(prev => prev.map(p => p.id === id ? { ...p, x: coords.x, y: coords.y } : p));
      }
    };
    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const resetBoard = () => {
    setDrawing([]);
    setPlayers([
      { id: 1, x: 20, y: 30, team: 'A', role: '공격' },
      { id: 2, x: 20, y: 70, team: 'A', role: '공격' },
      { id: 3, x: 80, y: 50, team: 'B', role: '수비' },
      { id: 'ball', x: 50, y: 50, team: 'none', isBall: true }
    ]);
    setChallengeResult(null);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden select-none">
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm z-50">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg text-white">
            <Trophy size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight">코트전략마스터</h1>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => { setActiveTab('board'); setChallengeResult(null); }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'board' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}
          >
            자유 전술판
          </button>
          <button 
            onClick={() => { setActiveTab('challenge'); setChallengeResult(null); }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'challenge' || activeTab === 'challenge_play' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}
          >
            전략 챌린지
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        <aside className="w-80 bg-white border-r p-6 flex flex-col gap-6 overflow-y-auto z-40 shadow-md">
          {activeTab === 'board' ? (
            <>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">종목 선택</label>
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries(COURT_TYPES).map(([key, value]) => (
                    <button
                      key={key}
                      onClick={() => { setCourtType(key); resetBoard(); }}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${courtType === key ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:border-slate-200'}`}
                    >
                      <MapIcon size={18} className={courtType === key ? 'text-indigo-600' : 'text-slate-400'} />
                      <span className={`text-sm font-semibold ${courtType === key ? 'text-indigo-700' : 'text-slate-600'}`}>{value.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">선수 관리</label>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <button onClick={() => addPlayer('A')} className="flex flex-col items-center gap-1 p-3 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition-all">
                    <UserPlus size={20} /> <span className="text-[10px] font-bold">공격수 추가</span>
                  </button>
                  <button onClick={() => addPlayer('B')} className="flex flex-col items-center gap-1 p-3 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200 transition-all">
                    <UserPlus size={20} /> <span className="text-[10px] font-bold">수비수 추가</span>
                  </button>
                </div>
                <button 
                  onClick={() => { setIsDeleteMode(!isDeleteMode); setIsDrawingMode(false); }}
                  className={`flex items-center justify-between w-full p-3 rounded-xl border-2 transition-all ${isDeleteMode ? 'bg-red-50 border-red-500 text-red-700' : 'bg-white border-slate-100 text-slate-600'}`}
                >
                  <div className="flex items-center gap-2">
                    <UserMinus size={18} /> <span className="text-sm font-semibold">선수 삭제 모드</span>
                  </div>
                  <div className={`w-10 h-5 rounded-full relative transition-colors ${isDeleteMode ? 'bg-red-500' : 'bg-slate-200'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isDeleteMode ? 'right-1' : 'left-1'}`} />
                  </div>
                </button>
              </div>

              <div className="pt-4 border-t">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block">도구</label>
                <div className="flex flex-col gap-2">
                  <button onClick={() => { setIsDrawingMode(!isDrawingMode); setIsDeleteMode(false); }} className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${isDrawingMode ? 'bg-amber-50 border-amber-500 text-amber-700' : 'bg-white border-slate-100 text-slate-600'}`}>
                    <div className="flex items-center gap-2"> <Pencil size={18} /> <span className="text-sm font-semibold">그리기 모드</span> </div>
                    <div className={`w-10 h-5 rounded-full relative transition-colors ${isDrawingMode ? 'bg-amber-500' : 'bg-slate-200'}`}>
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isDrawingMode ? 'right-1' : 'left-1'}`} />
                    </div>
                  </button>
                  <button onClick={() => setDrawing([])} className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-all border border-slate-200">
                    <Trash2 size={18} /> <span className="text-sm font-semibold">선 지우기</span>
                  </button>
                  <button onClick={resetBoard} className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-all border border-slate-200">
                    <RotateCcw size={18} /> <span className="text-sm font-semibold">초기화</span>
                  </button>
                </div>
              </div>
            </>
          ) : activeTab === 'challenge' ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="text-amber-500" />
                <h2 className="text-lg font-bold">전략 챌린지 선택</h2>
              </div>
              <p className="text-sm text-slate-500 mb-2">총 6가지 전술 상황이 준비되어 있습니다.</p>
              <div className="space-y-2">
                {STRATEGY_CHALLENGES.map((challenge, idx) => (
                  <button
                    key={challenge.id}
                    onClick={() => startChallenge(idx)}
                    className="flex items-center justify-between w-full p-4 rounded-2xl bg-slate-50 border-2 border-slate-100 hover:border-indigo-400 hover:bg-white transition-all text-left"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{challenge.courtType}</span>
                      <span className="font-bold text-slate-800 text-sm">{challenge.title}</span>
                    </div>
                    <Play size={16} className="text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <button onClick={() => setActiveTab('challenge')} className="mb-4 text-xs text-indigo-600 flex items-center gap-1 font-bold uppercase tracking-wider">
                <ChevronRight size={14} className="rotate-180" /> 챌린지 목록으로
              </button>
              <h2 className="text-xl font-bold text-slate-800 mb-2 leading-tight">{STRATEGY_CHALLENGES[currentChallengeIdx].title}</h2>
              <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 mb-6">
                <p className="text-sm text-indigo-900 leading-relaxed font-medium">
                  {STRATEGY_CHALLENGES[currentChallengeIdx].description}
                </p>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={() => setShowHint(!showHint)}
                  className="w-full py-3 px-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-700 text-xs font-bold flex items-center justify-center gap-2"
                >
                  <Lightbulb size={16} /> {showHint ? '힌트 닫기' : '힌트 보기'}
                </button>
                {showHint && (
                  <p className="text-xs text-amber-800 bg-amber-100/50 p-3 rounded-lg italic leading-normal">
                    {STRATEGY_CHALLENGES[currentChallengeIdx].tip}
                  </p>
                )}
              </div>

              <div className="mt-auto space-y-3">
                {challengeResult === 'success' && (
                  <div className="p-4 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-200 flex items-center gap-3 animate-bounce">
                    <CheckCircle size={24} />
                    <div className="flex flex-col">
                      <span className="font-bold text-sm">성공입니다!</span>
                      <span className="text-[10px]">전술적 목표를 달성했습니다.</span>
                    </div>
                  </div>
                )}
                {challengeResult === 'fail' && (
                  <div className="p-4 bg-rose-50 text-rose-700 rounded-2xl border border-rose-200 flex items-center gap-3">
                    <XCircle size={24} />
                    <div className="flex flex-col">
                      <span className="font-bold text-sm">다시 확인해보세요</span>
                      <span className="text-[10px]">선수들의 위치를 조금 더 조정해보세요.</span>
                    </div>
                  </div>
                )}
                <button 
                  onClick={checkChallenge}
                  className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all"
                >
                  배치 완료
                </button>
              </div>
            </div>
          )}
        </aside>

        <section className="flex-1 bg-slate-100 p-8 flex items-center justify-center relative overflow-hidden">
          <div 
            ref={containerRef}
            className={`relative shadow-2xl rounded-sm border-4 border-slate-800 bg-white overflow-hidden touch-none transition-shadow ${isDeleteMode ? 'ring-4 ring-red-400 ring-opacity-50' : ''}`}
            style={{ width: 'min(90%, 800px)', aspectRatio: COURT_TYPES[courtType].ratio, backgroundColor: COURT_TYPES[courtType].color }}
          >
            {COURT_TYPES[courtType].lines(800, 800 / COURT_TYPES[courtType].ratio)}

            {/* Strategy Target Zone Visual Aid */}
            {activeTab === 'challenge_play' && (
              <div className="absolute inset-0 pointer-events-none z-0">
                {(() => {
                  const zone = STRATEGY_CHALLENGES[currentChallengeIdx].targetZone;
                  if (zone.type === 'circle') {
                    return (
                      <div 
                        className="absolute border-4 border-white border-dashed rounded-full bg-white/5 animate-pulse-slow"
                        style={{ 
                          left: `${zone.x - zone.r}%`, 
                          top: `${zone.y - zone.r}%`, 
                          width: `${zone.r * 2}%`, 
                          height: `${zone.r * 2 / COURT_TYPES[courtType].ratio * 1.6}%` 
                        }} 
                      />
                    );
                  } else {
                    return (
                      <div 
                        className="absolute border-4 border-white border-dashed bg-white/5 animate-pulse-slow"
                        style={{ 
                          left: `${zone.x - zone.w/2}%`, 
                          top: `${zone.y - zone.h/2}%`, 
                          width: `${zone.w}%`, 
                          height: `${zone.h}%` 
                        }} 
                      />
                    );
                  }
                })()}
              </div>
            )}

            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
              {drawing.map((path, idx) => (
                <path key={idx} d={`M ${path.map(p => `${p.x} ${p.y}`).join(' L ')}`} fill="none" stroke="white" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
              ))}
            </svg>

            {players.map((player) => (
              <div
                key={player.id}
                onPointerDown={(e) => handlePlayerDragStart(e, player.id)}
                className={`absolute w-12 h-12 -ml-6 -mt-6 rounded-full flex items-center justify-center shadow-xl transform transition-all active:scale-110 select-none ${
                  player.isBall ? 'z-30 p-1' : player.team === 'A' ? 'bg-rose-500 border-2 border-white text-white z-20' : 'bg-indigo-500 border-2 border-white text-white z-20'
                } ${isDrawingMode ? 'opacity-50 cursor-default' : 'cursor-move'} ${isDeleteMode && !player.isBall ? 'hover:bg-red-700 hover:scale-90 ring-4 ring-red-500 ring-opacity-0 hover:ring-opacity-100' : ''}`}
                style={{ left: `${player.x}%`, top: `${player.y}%`, pointerEvents: isDrawingMode ? 'none' : 'auto' }}
              >
                {player.isBall ? (
                  <div className="w-full h-full drop-shadow-md animate-bounce-subtle"> <BallIcon type={courtType} /> </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Users size={16} /> <span className="text-[10px] font-bold leading-none mt-0.5 tracking-tighter">{player.role}</span>
                  </div>
                )}
                {isDeleteMode && !player.isBall && (
                  <div className="absolute inset-0 bg-red-600/80 rounded-full flex items-center justify-center text-white"> <Trash2 size={20} /> </div>
                )}
              </div>
            ))}

            {isDrawingMode && (
              <div className="absolute inset-0 z-40 cursor-crosshair touch-none" style={{ touchAction: 'none' }} onPointerDown={handleStartDrawing} onPointerMove={handleMoveDrawing} onPointerUp={handleEndDrawing} onPointerCancel={handleEndDrawing} />
            )}
          </div>

          <div className="absolute bottom-6 right-6 flex flex-col gap-2">
            <div className="bg-white/90 backdrop-blur-md px-4 py-3 rounded-2xl border border-slate-200 shadow-xl">
               <div className="flex flex-col gap-2 text-[10px] font-bold text-slate-600">
                 <div className="flex items-center gap-2"> <div className="w-2 h-2 rounded-full bg-rose-500" /> <span>공격 팀 ({players.filter(p => p.team === 'A').length})</span> </div>
                 <div className="flex items-center gap-2"> <div className="w-2 h-2 rounded-full bg-indigo-500" /> <span>수비 팀 ({players.filter(p => p.team === 'B').length})</span> </div>
               </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t px-6 py-3 text-center z-50">
        <p className="text-[10px] text-slate-400 font-medium italic leading-relaxed">
          &copy; 2026 코트전략마스터 교육 도구. 전략은 공간을 지배하는 팀이 승리합니다.<br/>
          개발자: 김진우 선생님
        </p>
      </footer>

      <style>{`
        @keyframes bounce-subtle { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
        .animate-bounce-subtle { animation: bounce-subtle 2s ease-in-out infinite; }
        .cursor-crosshair { cursor: crosshair; }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .animate-bounce { animation: bounce 0.5s ease-in-out 3; }
        @keyframes pulse-slow { 0%, 100% { opacity: 0.1; transform: scale(1); } 50% { opacity: 0.3; transform: scale(1.02); } }
        .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default App;
