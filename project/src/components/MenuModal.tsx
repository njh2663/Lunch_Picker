import { useState } from 'react';
import { X, MapPin, Loader2, AlertCircle, Share2, Check, Copy } from 'lucide-react';
import { MenuItem } from '../data/menus';
import { useGeolocation } from '../hooks/useGeolocation';

interface MenuModalProps {
  menu: MenuItem;
  onClose: () => void;
  onPick?: () => void;
}

export default function MenuModal({ menu, onClose, onPick }: MenuModalProps) {
  const { loading, getLocation } = useGeolocation();
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [shareState, setShareState] = useState<'idle' | 'copied' | 'error'>('idle');
  const [picked, setPicked] = useState(false);

  const triggerPick = () => {
    if (!picked) {
      setPicked(true);
      onPick?.();
    }
  };

  const copyToClipboard = (text: string) => {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    } catch {
      return false;
    }
  };

  const handleShare = async () => {
    triggerPick();
    const url = window.location.href;
    const text = `점심 메뉴 후보 나왔습니다.\n👉 ${menu.emoji} ${menu.name}\n확정 vs 재추첨 의견 주세요!`;
    const fullText = `${text}\n${url}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: '점메추', text, url });
        return;
      } catch {
      }
    }

    let copied = false;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(fullText);
        copied = true;
      } catch {
        copied = copyToClipboard(fullText);
      }
    } else {
      copied = copyToClipboard(fullText);
    }

    if (copied) {
      setShareState('copied');
      setTimeout(() => setShareState('idle'), 2500);
    } else {
      setShareState('error');
      setTimeout(() => setShareState('idle'), 2500);
    }
  };

  const openNaverMap = (searchQuery: string, lat?: number, lng?: number) => {
    if (lat !== undefined && lng !== undefined) {
      const url = `https://map.naver.com/v5/search/${searchQuery}?c=${lng},${lat},13,0,0,0,dh`;
      window.open(url, '_blank');
    } else {
      const url = `https://map.naver.com/v5/search/${searchQuery}`;
      window.open(url, '_blank');
    }
  };

  const handleFindRestaurant = async () => {
    setLocationError(null);
    setPermissionDenied(false);

    triggerPick();

    const searchQuery = encodeURIComponent(menu.name);

    try {
      const { lat, lng } = await getLocation();
      openNaverMap(searchQuery, lat, lng);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '위치를 가져오는 데 실패했습니다.';
      if (msg.includes('권한') || msg.includes('거부')) {
        setPermissionDenied(true);
      } else {
        setLocationError(msg);
        openNaverMap(searchQuery);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden animate-[scaleIn_0.3s_ease-out]">
        <div className="bg-gradient-to-r from-orange-500 to-pink-500 relative h-40 flex items-center justify-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition-all"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="text-7xl">{menu.emoji}</div>
        </div>

        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{menu.name}</h2>
          {menu.description && (
            <p className="text-gray-600 text-sm mb-4">{menu.description}</p>
          )}
          {!menu.description && <div className="mb-4" />}

          {locationError && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl px-4 py-3 mb-4 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{locationError} 위치 없이 검색을 열었습니다.</span>
            </div>
          )}

          {permissionDenied ? (
            <div className="w-full bg-amber-50 border border-amber-200 rounded-xl py-3 px-4 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-sm text-amber-700 leading-snug">
                위치 접근 권한이 필요합니다.<br />
                브라우저 설정에서 위치 접근을 허용한 후 다시 시도해 주세요.
              </p>
            </div>
          ) : (
            <button
              onClick={handleFindRestaurant}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-400 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl disabled:cursor-not-allowed disabled:shadow-none"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  위치 확인 중...
                </>
              ) : (
                <>
                  <MapPin className="w-5 h-5" />
                  주변 식당 찾기
                </>
              )}
            </button>
          )}

          <button
            onClick={handleShare}
            className={`w-full mt-3 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl bg-gradient-to-r ${
              shareState === 'copied'
                ? 'from-green-500 to-emerald-600'
                : shareState === 'error'
                ? 'from-red-500 to-red-600'
                : 'from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600'
            }`}
          >
            {shareState === 'copied' ? (
              <>
                <Check className="w-5 h-5" />
                클립보드에 복사됐어요!
              </>
            ) : shareState === 'error' ? (
              <>
                <Copy className="w-5 h-5" />
                복사 실패 — 직접 복사해 주세요
              </>
            ) : (
              <>
                <Share2 className="w-5 h-5" />
                결과 공유하기
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
