import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { TrendingUp } from 'lucide-react';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

type Period = 'daily' | 'weekly' | 'monthly';

interface DataPoint {
  label: string;
  count: number;
}

function toKSTDateParts(utcDate: Date): { year: number; month: number; day: number; dow: number } {
  const kstOffset = 9 * 60 * 60 * 1000;
  const kst = new Date(utcDate.getTime() + kstOffset);
  return { year: kst.getUTCFullYear(), month: kst.getUTCMonth(), day: kst.getUTCDate(), dow: kst.getUTCDay() };
}

function kstMidnightUTC(year: number, month: number, day: number): Date {
  const kstOffset = 9 * 60 * 60 * 1000;
  return new Date(Date.UTC(year, month, day, 0, 0, 0, 0) - kstOffset);
}

function getPeriodRange(period: Period): { start: Date; labels: string[]; groupFn: (d: Date) => string } {
  const now = new Date();
  const { year, month, day, dow } = toKSTDateParts(now);

  if (period === 'daily') {
    const labels: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.UTC(year, month, day - i));
      const p = toKSTDateParts(d);
      labels.push(`${p.month + 1}/${p.day}`);
    }
    const start = kstMidnightUTC(year, month, day - 6);
    const groupFn = (d: Date) => {
      const p = toKSTDateParts(d);
      return `${p.month + 1}/${p.day}`;
    };
    return { start, labels, groupFn };
  }

  if (period === 'weekly') {
    const daysToMonday = dow === 0 ? 6 : dow - 1;
    const labels: string[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(Date.UTC(year, month, day - daysToMonday - i * 7));
      const p = toKSTDateParts(d);
      labels.push(`${p.month + 1}/${p.day}`);
    }
    const startBase = new Date(Date.UTC(year, month, day - daysToMonday - 11 * 7));
    const startP = toKSTDateParts(startBase);
    const start = kstMidnightUTC(startP.year, startP.month, startP.day);

    const groupFn = (d: Date) => {
      const p = toKSTDateParts(d);
      const diff = p.dow === 0 ? 6 : p.dow - 1;
      const monday = new Date(Date.UTC(p.year, p.month, p.day - diff));
      const mp = toKSTDateParts(monday);
      return `${mp.month + 1}/${mp.day}`;
    };
    return { start, labels, groupFn };
  }

  const labels: string[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(Date.UTC(year, month - i, 1));
    const p = toKSTDateParts(d);
    labels.push(`${p.month + 1}월`);
  }
  const startBase = new Date(Date.UTC(year, month - 11, 1));
  const startP = toKSTDateParts(startBase);
  const start = kstMidnightUTC(startP.year, startP.month, startP.day);

  const groupFn = (d: Date) => {
    const p = toKSTDateParts(d);
    return `${p.month + 1}월`;
  };
  return { start, labels, groupFn };
}

async function fetchVisitData(period: Period): Promise<DataPoint[]> {
  const { start, labels, groupFn } = getPeriodRange(period);

  const { data, error } = await supabase
    .from('visit_log')
    .select('visited_at')
    .gte('visited_at', start.toISOString());

  if (error || !data) return labels.map((label) => ({ label, count: 0 }));

  const counts: Record<string, number> = {};
  labels.forEach((l) => { counts[l] = 0; });

  data.forEach((row) => {
    const key = groupFn(new Date(row.visited_at));
    if (key in counts) counts[key]++;
  });

  return labels.map((label) => ({ label, count: counts[label] ?? 0 }));
}

export default function VisitChart() {
  const [period, setPeriod] = useState<Period>('daily');
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchVisitData(period).then((d) => {
      setData(d);
      setLoading(false);
    });
  }, [period]);

  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const totalVisits = data.reduce((s, d) => s + d.count, 0);

  const chartHeight = 160;
  const chartWidth = data.length > 0 ? data.length : 1;
  const padding = { left: 36, right: 16, top: 12, bottom: 32 };

  const points = data.map((d, i) => {
    const x = padding.left + (i / (chartWidth - 1 || 1)) * (600 - padding.left - padding.right);
    const y = padding.top + chartHeight - (d.count / maxCount) * chartHeight;
    return { x, y, ...d };
  });

  const polyline = points.map((p) => `${p.x},${p.y}`).join(' ');
  const areaPath =
    points.length > 0
      ? `M${points[0].x},${padding.top + chartHeight} ` +
        points.map((p) => `L${p.x},${p.y}`).join(' ') +
        ` L${points[points.length - 1].x},${padding.top + chartHeight} Z`
      : '';

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
    y: padding.top + chartHeight - t * chartHeight,
    value: Math.round(t * maxCount),
  }));

  const periodLabels: Record<Period, string> = { daily: '최근 7일', weekly: '최근 12주', monthly: '최근 12개월' };

  return (
    <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-orange-400" />
          <h2 className="text-lg font-bold text-white">방문자 추이</h2>
        </div>
        <div className="flex gap-1.5">
          {(['daily', 'weekly', 'monthly'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                period === p
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              {p === 'daily' ? '일간' : p === 'weekly' ? '주간' : '월간'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="bg-gray-700 rounded-xl px-4 py-2">
          <p className="text-xs text-gray-400">{periodLabels[period]} 총 방문</p>
          <p className="text-2xl font-bold text-white">{totalVisits.toLocaleString()}</p>
        </div>
      </div>

      {loading ? (
        <div className="h-48 flex items-center justify-center text-gray-500 text-sm">로드 중...</div>
      ) : (
        <div className="overflow-x-auto">
          <svg
            viewBox={`0 0 600 ${chartHeight + padding.top + padding.bottom}`}
            className="w-full"
            style={{ minWidth: '280px' }}
          >
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
              </linearGradient>
            </defs>

            {yTicks.map((t) => (
              <g key={t.value}>
                <line
                  x1={padding.left}
                  y1={t.y}
                  x2={600 - padding.right}
                  y2={t.y}
                  stroke="#374151"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 6}
                  y={t.y + 4}
                  textAnchor="end"
                  fontSize="10"
                  fill="#6b7280"
                >
                  {t.value}
                </text>
              </g>
            ))}

            {areaPath && (
              <path d={areaPath} fill="url(#areaGrad)" />
            )}

            {points.length > 1 && (
              <polyline
                points={polyline}
                fill="none"
                stroke="#f97316"
                strokeWidth="2.5"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            )}

            {points.map((p, i) => (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r="4" fill="#f97316" stroke="#1f2937" strokeWidth="2" />
                {(i % Math.ceil(data.length / 7) === 0 || i === data.length - 1) && (
                  <text
                    x={p.x}
                    y={padding.top + chartHeight + 20}
                    textAnchor="middle"
                    fontSize="9"
                    fill="#6b7280"
                  >
                    {p.label}
                  </text>
                )}
                {p.count > 0 && (
                  <text
                    x={p.x}
                    y={p.y - 8}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#fb923c"
                    fontWeight="bold"
                  >
                    {p.count}
                  </text>
                )}
              </g>
            ))}
          </svg>
        </div>
      )}
    </div>
  );
}
