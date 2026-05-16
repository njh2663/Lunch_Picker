import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { getMenuStats, MenuStats } from '../data/menus';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

type Period = 'daily' | 'weekly' | 'monthly';

export default function MenuStatsChart() {
  const [period, setPeriod] = useState<Period>('daily');
  const [stats, setStats] = useState<MenuStats[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchStats = useCallback(async (p: Period) => {
    setLoading(true);
    const data = await getMenuStats(p);
    setStats(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchStats(period);
  }, [period, fetchStats]);

  useEffect(() => {
    const channel = supabase
      .channel('pick_log_changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'pick_log' },
        () => {
          fetchStats(period);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [period, fetchStats]);

  const maxCount = stats.length > 0 ? Math.max(...stats.map(s => s.count)) : 0;

  const getDateRangeForPeriod = (p: Period) => {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();

    if (p === 'daily') {
      return `${month}월 ${day}일`;
    } else if (p === 'weekly') {
      const dayOfWeek = today.getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - daysToMonday);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const startMonth = weekStart.getMonth() + 1;
      const startDay = weekStart.getDate();
      const endMonth = weekEnd.getMonth() + 1;
      const endDay = weekEnd.getDate();

      if (startMonth === endMonth) {
        return `${startMonth}월 ${startDay}~${endDay}일`;
      } else {
        return `${startMonth}월 ${startDay}일~${endMonth}월 ${endDay}일`;
      }
    } else {
      return `${month}월`;
    }
  };

  return (
    <div className="w-full p-6 bg-white">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-3">메뉴 선택 통계</h3>

        <div className="flex gap-2 mb-6">
          {(['daily', 'weekly', 'monthly'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-lg font-medium text-sm transition-all ${
                period === p
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <div className="font-semibold">
                {p === 'daily' && '일간'}
                {p === 'weekly' && '주간'}
                {p === 'monthly' && '월간'}
              </div>
              <div className="text-xs opacity-90">{getDateRangeForPeriod(p)}</div>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-8">로드 중...</div>
      ) : stats.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          {period === 'daily' && '일간'} {period === 'weekly' && '주간'} {period === 'monthly' && '월간'} 데이터가 없습니다.
        </div>
      ) : (
        <div className="overflow-y-auto max-h-72 space-y-3 pr-1">
          {stats.map((stat) => {
            const percentage = maxCount > 0 ? (stat.count / maxCount) * 100 : 0;
            const isTopRank = stat.count === maxCount;
            return (
              <div key={stat.menu_name} className="flex items-center gap-3">
                <div className="w-24 text-sm font-medium text-gray-700 truncate">
                  {stat.menu_name}
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-8 overflow-hidden">
                  <div
                    className={`h-full flex items-center justify-end pr-3 transition-all duration-500 ${
                      isTopRank
                        ? 'bg-gradient-to-r from-orange-400 to-orange-600'
                        : 'bg-gradient-to-r from-blue-400 to-blue-600'
                    }`}
                    style={{ width: `${percentage}%` }}
                  >
                    {percentage > 15 && (
                      <span className="text-white font-bold text-sm">{stat.count}</span>
                    )}
                  </div>
                </div>
                {percentage <= 15 && (
                  <span className="w-8 text-right text-sm font-bold text-gray-700">
                    {stat.count}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
