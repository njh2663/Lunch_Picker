import { useState, useEffect, useRef, useCallback } from 'react';
import { Play } from 'lucide-react';
import { MenuItem, fetchMenus, getRandomMenu, logMenuPick } from '../data/menus';
import MenuModal from './MenuModal';

const ITEM_HEIGHT = 140;
const VISIBLE_COUNT = 1;
const SPIN_DURATION_BASE = 2000;

interface ReelProps {
  items: MenuItem[];
  isSpinning: boolean;
  finalItem: MenuItem | null;
  finalItemRef: React.RefObject<MenuItem | null>;
  delay: number;
  onSettled: () => void;
}

function Reel({ items, isSpinning, finalItem, finalItemRef, delay, onSettled }: ReelProps) {
  const [offset, setOffset] = useState(0);
  const [settled, setSettled] = useState(false);
  const [settledItem, setSettledItem] = useState<MenuItem | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const settledRef = useRef(false);

  const totalDuration = SPIN_DURATION_BASE + delay;

  useEffect(() => {
    if (!isSpinning) return;
    settledRef.current = false;
    setSettled(false);
    setSettledItem(null);
    setOffset(0);

    const totalDistance = items.length * ITEM_HEIGHT * 6;

    const animate = (now: number) => {
      if (!startTimeRef.current) startTimeRef.current = now;
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(elapsed / totalDuration, 1);

      const eased = progress < 0.7
        ? progress / 0.7
        : 1 - ((progress - 0.7) / 0.3) * ((progress - 0.7) / 0.3) * 0.15;

      const currentOffset = eased * totalDistance;
      setOffset(currentOffset % (items.length * ITEM_HEIGHT));

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        if (!settledRef.current) {
          settledRef.current = true;
          setSettledItem(finalItemRef.current);
          setSettled(true);
          onSettled();
        }
      }
    };

    startTimeRef.current = null;
    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isSpinning]);

  const startIdx = Math.floor(offset / ITEM_HEIGHT) % items.length;
  const renderItems = [];
  for (let i = 0; i < VISIBLE_COUNT + 2; i++) {
    const idx = (startIdx + i) % items.length;
    renderItems.push(items[idx]);
  }
  const pixelOffset = offset % ITEM_HEIGHT;

  const displayItem = settledItem ?? finalItem;
  const showFinal = settled && displayItem;

  return (
    <div
      className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 border-2 border-yellow-400/40 shadow-inner"
      style={{ height: ITEM_HEIGHT * VISIBLE_COUNT, width: 140 }}
    >
      {!showFinal && isSpinning && (
        <div
          style={{ transform: `translateY(${-pixelOffset}px)` }}
          className="absolute inset-x-0 top-0"
        >
          {renderItems.map((item, i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-center"
              style={{ height: ITEM_HEIGHT }}
            >
              <div className="text-5xl leading-none mb-1">{item.emoji}</div>
              <div className="text-white text-sm font-bold text-center px-2 leading-tight line-clamp-2">
                {item.name}
              </div>
            </div>
          ))}
        </div>
      )}

      {showFinal && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-5xl leading-none mb-2">{displayItem!.emoji}</div>
          <div className="text-white text-sm font-bold text-center px-3 leading-tight">
            {displayItem!.name}
          </div>
        </div>
      )}

      {!isSpinning && !finalItem && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-4xl text-gray-600">?</div>
        </div>
      )}
    </div>
  );
}

export default function SlotMachine() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<MenuItem | null>(null);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [settledCount, setSettledCount] = useState(0);
  const finalResultRef = useRef<MenuItem | null>(null);

  useEffect(() => {
    fetchMenus().then(setMenus);
  }, []);

  const handleSettled = useCallback(() => {
    setSettledCount(prev => {
      const next = prev + 1;
      if (next === 3 && finalResultRef.current) {
        setResult(finalResultRef.current);
        setIsSpinning(false);
        setShowModal(true);
      }
      return next;
    });
  }, []);

  const startSpin = async () => {
    if (isSpinning || menus.length === 0) return;

    setResult(null);
    setSettledCount(0);
    finalResultRef.current = null;
    setIsSpinning(true);

    const finalResult = await getRandomMenu();
    finalResultRef.current = finalResult;
  };

  const reelDelays = [0, 400, 800];

  if (menus.length === 0) {
    return (
      <div className="w-full p-6 text-center text-gray-500">메뉴를 불러오는 중...</div>
    );
  }

  return (
    <div className="w-full p-6">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">오늘의 메뉴</h2>
        <p className="text-gray-600">빨리 고르고 밥 먹으러 갑시다!</p>
      </div>

      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 shadow-2xl mb-6 border border-gray-700">
        <div className="flex items-center justify-center gap-3 mb-6">
          {reelDelays.map((delay, i) => (
            <Reel
              key={i}
              items={menus}
              isSpinning={isSpinning}
              finalItem={result}
              finalItemRef={finalResultRef}
              delay={delay}
              onSettled={handleSettled}
            />
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={startSpin}
            disabled={isSpinning}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-10 py-4 rounded-full text-xl font-bold hover:from-yellow-500 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95"
          >
            <Play className={`w-6 h-6 ${isSpinning ? 'animate-spin' : ''}`} />
            {isSpinning ? '뽑는 중...' : '메뉴 뽑기'}
          </button>
        </div>
      </div>

      {showModal && result && (
        <MenuModal
          menu={result}
          onClose={() => setShowModal(false)}
          onPick={() => logMenuPick(result)}
        />
      )}
    </div>
  );
}
