import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Check, X, Lightbulb, RefreshCw, ChevronDown } from 'lucide-react';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface MenuItem {
  id: string;
  name: string;
  emoji: string;
  description: string;
  is_visible: boolean;
  is_proposed: boolean;
  created_at: string;
}

interface ApproveForm {
  emoji: string;
  name: string;
  description: string;
}

export default function SuggestedMenus() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [approveOpen, setApproveOpen] = useState<string | null>(null);
  const [forms, setForms] = useState<Record<string, ApproveForm>>({});
  const [emojiList, setEmojiList] = useState<string[]>([]);
  const [emojiDropdownOpen, setEmojiDropdownOpen] = useState<string | null>(null);
  const emojiDropdownRef = useRef<HTMLDivElement>(null);

  const fetchSuggested = useCallback(async () => {
    setLoading(true);
    const [suggestedRes, emojiRes] = await Promise.all([
      supabase
        .from('menu')
        .select('id, name, emoji, description, is_visible, is_proposed, created_at')
        .eq('is_proposed', true)
        .eq('is_visible', false)
        .order('created_at', { ascending: false }),
      supabase
        .from('menu')
        .select('emoji')
        .eq('is_visible', true)
        .not('emoji', 'is', null),
    ]);

    if (!suggestedRes.error && suggestedRes.data) {
      setMenus(suggestedRes.data);
      const initial: Record<string, ApproveForm> = {};
      suggestedRes.data.forEach((m: MenuItem) => {
        initial[m.id] = {
          emoji: m.emoji ?? '',
          name: m.name ?? '',
          description: m.description ?? '',
        };
      });
      setForms(initial);
    }

    if (!emojiRes.error && emojiRes.data) {
      const unique = [...new Set(
        emojiRes.data.map((r: { emoji: string }) => r.emoji).filter(Boolean)
      )].sort() as string[];
      setEmojiList(unique);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSuggested();
  }, [fetchSuggested]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (emojiDropdownRef.current && !emojiDropdownRef.current.contains(e.target as Node)) {
        setEmojiDropdownOpen(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const openApprove = (menu: MenuItem) => {
    setApproveOpen((prev) => (prev === menu.id ? null : menu.id));
  };

  const updateForm = (id: string, field: keyof ApproveForm, value: string) => {
    setForms((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const callAdminAction = async (payload: object) => {
    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-menu-action`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(payload),
      }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Unknown error');
    return data;
  };

  const confirmApprove = async (menu: MenuItem) => {
    setProcessing(menu.id);
    const form = forms[menu.id];

    try {
      await callAdminAction({
        action: 'approve',
        id: menu.id,
        emoji: form.emoji,
        name: form.name,
        description: form.description,
      });
      setMenus((prev) => prev.filter((m) => m.id !== menu.id));
      setApproveOpen(null);
    } catch {
    }
    setProcessing(null);
  };

  const reject = async (id: string) => {
    setProcessing(id);
    try {
      await callAdminAction({ action: 'reject', id });
      setMenus((prev) => prev.filter((m) => m.id !== id));
      if (approveOpen === id) setApproveOpen(null);
    } catch {
    }
    setProcessing(null);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
    return `${kst.getUTCMonth() + 1}/${kst.getUTCDate()} ${String(kst.getUTCHours()).padStart(2, '0')}:${String(kst.getUTCMinutes()).padStart(2, '0')}`;
  };

  return (
    <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-400" />
          <h2 className="text-lg font-bold text-white">제안된 메뉴 검토</h2>
          {menus.length > 0 && (
            <span className="bg-yellow-500 text-gray-900 text-xs font-bold px-2 py-0.5 rounded-full">
              {menus.length}
            </span>
          )}
        </div>
        <button
          onClick={fetchSuggested}
          className="text-gray-400 hover:text-white transition p-1.5 rounded-lg hover:bg-gray-700"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-8 text-sm">로드 중...</div>
      ) : menus.length === 0 ? (
        <div className="text-center text-gray-500 py-8 text-sm">
          <p>검토할 제안 메뉴가 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {menus.map((menu) => {
            const isOpen = approveOpen === menu.id;
            const isProcessing = processing === menu.id;
            const form = forms[menu.id] ?? { emoji: '', name: '', description: '' };

            return (
              <div
                key={menu.id}
                className="border border-gray-600 rounded-xl overflow-hidden"
                style={{ backgroundColor: '#1f2937' }}
              >
                <div className="flex items-start gap-3 p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{menu.emoji || '?'}</span>
                      <span className="font-semibold text-white text-sm">{menu.name}</span>
                    </div>
                    {menu.description && (
                      <p className="text-xs text-gray-400 truncate">{menu.description}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">{formatDate(menu.created_at)}</p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => openApprove(menu)}
                      disabled={isProcessing}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition disabled:opacity-50 ${
                        isOpen
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-700 hover:bg-green-700 text-gray-300 hover:text-white'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      승인
                      <ChevronDown
                        className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                    <button
                      onClick={() => reject(menu.id)}
                      disabled={isProcessing}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-700 hover:bg-red-700 text-gray-300 hover:text-white text-xs font-semibold transition disabled:opacity-50"
                    >
                      <X className="w-3.5 h-3.5" />
                      거절
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="border-t border-gray-600 bg-gray-900 px-4 py-4">
                    <p className="text-xs text-gray-400 mb-3">승인 전 내용을 수정할 수 있습니다.</p>
                    <div className="space-y-2.5">
                      <div className="flex gap-2">
                        <div className="flex flex-col gap-1" ref={emojiDropdownRef}>
                          <label className="text-xs text-gray-400">이모지</label>
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() =>
                                setEmojiDropdownOpen((prev) =>
                                  prev === menu.id ? null : menu.id
                                )
                              }
                              className="w-14 h-[34px] bg-gray-700 border border-gray-600 rounded-lg text-lg text-white flex items-center justify-center hover:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                            >
                              {form.emoji || <span className="text-gray-500 text-xs">?</span>}
                            </button>
                            {emojiDropdownOpen === menu.id && (
                              <div className="absolute top-full left-0 mt-1 z-50 bg-gray-800 border border-gray-600 rounded-xl shadow-xl p-2 w-48">
                                <div className="grid grid-cols-5 gap-1">
                                  {emojiList.map((e) => (
                                    <button
                                      key={e}
                                      type="button"
                                      onClick={() => {
                                        updateForm(menu.id, 'emoji', e);
                                        setEmojiDropdownOpen(null);
                                      }}
                                      className={`text-xl rounded-lg p-1.5 hover:bg-gray-600 transition ${
                                        form.emoji === e ? 'bg-green-700' : ''
                                      }`}
                                    >
                                      {e}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex-1 flex flex-col gap-1">
                          <label className="text-xs text-gray-400">메뉴 이름</label>
                          <input
                            type="text"
                            value={form.name}
                            onChange={(e) => updateForm(menu.id, 'name', e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                            maxLength={30}
                          />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-400">설명</label>
                        <input
                          type="text"
                          value={form.description}
                          onChange={(e) => updateForm(menu.id, 'description', e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                          maxLength={100}
                          placeholder="메뉴 설명 (선택)"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <button
                        onClick={() => setApproveOpen(null)}
                        className="px-4 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm font-medium transition"
                      >
                        취소
                      </button>
                      <button
                        onClick={() => confirmApprove(menu)}
                        disabled={isProcessing || !form.name.trim()}
                        className="px-4 py-1.5 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm font-semibold transition disabled:opacity-50"
                      >
                        {isProcessing ? '처리 중...' : '입력'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
