import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { fetchMenus, MenuItem } from '../data/menus';

export default function MenuList() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetchMenus().then((data) => {
      setMenus([...data].sort((a, b) => a.name.localeCompare(b.name, 'ko')));
      setLoading(false);
    });
  }, []);

  const visible = expanded ? menus : menus.slice(0, 12);

  return (
    <div className="w-full p-6">
      <h3 className="text-2xl font-bold text-gray-800 mb-5">전체 메뉴</h3>

      {loading ? (
        <div className="text-center text-gray-400 py-8">로드 중...</div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {visible.map((menu) => (
              <div
                key={menu.id}
                className="flex items-center gap-2 bg-gray-50 hover:bg-orange-50 border border-gray-100 rounded-xl px-3 py-2 transition-colors"
              >
                <span className="text-xl">{menu.emoji}</span>
                <p className="text-sm font-semibold text-gray-800 truncate">{menu.name}</p>
              </div>
            ))}
          </div>

          {menus.length > 12 && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="mt-4 w-full flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              {expanded ? (
                <><ChevronUp className="w-4 h-4" /> 접기</>
              ) : (
                <><ChevronDown className="w-4 h-4" /> {menus.length - 12}개 더 보기</>
              )}
            </button>
          )}
        </>
      )}
    </div>
  );
}
