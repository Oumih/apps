import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';

const NEON_PINK = '#ff2d78';
const NEON_GOLD = '#ffe44d';

const VIEWS = [
  { key: 'daily', label: '日別' },
  { key: 'weekly', label: '週別' },
  { key: 'monthly', label: '月別' },
  { key: 'yearly', label: '年別' },
];

const fmtShort = (n) => n >= 10000 ? `${(n / 10000).toFixed(0)}万` : n.toLocaleString();
const fmtFull = (n) => `¥${n.toLocaleString()}`;

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="px-4 py-2 rounded-xl text-sm"
        style={{
          background: 'rgba(10,4,22,0.95)',
          border: '1px solid rgba(255,45,120,0.4)',
          boxShadow: '0 0 20px rgba(255,45,120,0.2)',
          color: '#f0e6c8',
        }}
      >
        <p className="font-semibold mb-0.5" style={{ color: '#ff8cbb' }}>{label}</p>
        <p style={{ color: NEON_GOLD, fontFamily: "'Cinzel', serif" }}>¥{payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

function SectionTitle({ children }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-1 h-4 rounded-full" style={{ background: `linear-gradient(180deg, ${NEON_PINK}, ${NEON_GOLD})` }} />
      <h2 className="text-sm font-bold tracking-widest" style={{ color: '#ffd0e8', letterSpacing: '0.15em' }}>
        {children}
      </h2>
    </div>
  );
}

export default function Sales() {
  const [view, setView] = useState('monthly');
  const [chartData, setChartData] = useState([]);
  const [castRanking, setCastRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const COLORS = ['#ff2d78', '#ffe44d', '#00b4ff', '#cc88ff', '#ff8c00', '#00ff88'];

  useEffect(() => {
    fetchSalesData();
  }, [user, view]);

  const fetchSalesData = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('store_id')
        .eq('id', user.id)
        .single();

      if (!profile) { setLoading(false); return; }

      const { data: sales } = await supabase
        .from('sales')
        .select('amount, date, cast_id')
        .eq('store_id', profile.store_id)
        .order('date', { ascending: false });

      const { data: casts } = await supabase
        .from('casts')
        .select('id, name');

      if (!sales) { setLoading(false); return; }

      const dataMap = {};
      const castMap = {};

      // 日別の場合、過去7日間を初期化
      if (view === 'daily') {
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          const [y, m, d] = dateStr.split('-');
          dataMap[dateStr] = { key: dateStr, label: `${m}/${d}`, amount: 0, date: dateStr };
        }
      }

      sales.forEach((sale) => {
        const cast = casts?.find((c) => c.id === sale.cast_id);
        const castName = cast?.name || '不明';

        if (view === 'daily') {
          const key = sale.date;
          if (!dataMap[key]) dataMap[key] = { key, label: sale.date, amount: 0, date: sale.date };
          dataMap[key].amount += sale.amount;
        } else if (view === 'weekly') {
          const date = new Date(sale.date);
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          const key = `${weekStart.toISOString().split('T')[0]}`;
          const label = `${weekStart.getMonth() + 1}/${weekStart.getDate()} - ${weekEnd.getMonth() + 1}/${weekEnd.getDate()}`;
          if (!dataMap[key]) dataMap[key] = { key, label, amount: 0, date: key };
          dataMap[key].amount += sale.amount;
        } else if (view === 'monthly') {
          const [year, month] = sale.date.split('-');
          const key = `${year}-${month}`;
          const label = `${month}月`;
          if (!dataMap[key]) dataMap[key] = { key, label, amount: 0, date: sale.date };
          dataMap[key].amount += sale.amount;
        } else {
          const year = sale.date.split('-')[0];
          if (!dataMap[year]) dataMap[year] = { key: year, label: year, amount: 0, date: sale.date };
          dataMap[year].amount += sale.amount;
        }

        if (!castMap[sale.cast_id]) {
          castMap[sale.cast_id] = { castId: sale.cast_id, castName, amount: 0 };
        }
        castMap[sale.cast_id].amount += sale.amount;
      });

      const sorted = Object.values(dataMap)
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      const castSorted = Object.values(castMap)
        .sort((a, b) => b.amount - a.amount);

      setChartData(sorted);
      setCastRanking(castSorted);
    } catch (err) {
      console.error('Error fetching sales:', err);
    } finally {
      setLoading(false);
    }
  };

  const total = chartData.reduce((s, d) => s + d.amount, 0);
  const avg = chartData.length > 0 ? Math.floor(total / chartData.length) : 0;
  const max = chartData.length > 0 ? Math.max(...chartData.map((d) => d.amount)) : 0;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1
          className="text-3xl font-black mb-1"
          style={{
            fontFamily: "'Playfair Display', serif",
            background: 'linear-gradient(135deg, #fff5e0, #ffd0e8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Sales
        </h1>
        <p className="text-xs tracking-widest" style={{ color: 'rgba(255,140,187,0.5)', letterSpacing: '0.2em' }}>
          期間ごとの売上を確認できます
        </p>
      </div>

      {/* 切り替えタブ */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {VIEWS.map((v) => (
          <button
            key={v.key}
            onClick={() => setView(v.key)}
            className="px-5 py-2.5 rounded-xl text-sm font-bold tracking-widest transition-all"
            style={{
              background: view === v.key
                ? 'linear-gradient(135deg, rgba(255,45,120,0.25), rgba(255,45,120,0.1))'
                : 'rgba(255,255,255,0.03)',
              border: `1px solid ${view === v.key ? 'rgba(255,45,120,0.6)' : 'rgba(255,45,120,0.1)'}`,
              color: view === v.key ? '#ff8cbb' : 'rgba(240,200,220,0.35)',
              boxShadow: view === v.key ? '0 0 15px rgba(255,45,120,0.2)' : 'none',
              fontFamily: "'Noto Sans JP', sans-serif",
            }}
          >
            {v.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: 'rgba(255,140,187,0.3)' }}>読み込み中...</p>
      ) : (
        <>
          {/* サマリー */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: '合計', value: fmtFull(total), color: NEON_GOLD },
              { label: '平均', value: fmtFull(avg), color: NEON_PINK },
              { label: '最高', value: fmtFull(max), color: '#cc88ff' },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl p-5"
                style={{
                  background: 'linear-gradient(135deg, rgba(15,5,25,0.9), rgba(8,4,18,0.9))',
                  border: `1px solid ${s.color}25`,
                  boxShadow: `0 0 15px ${s.color}08`,
                }}
              >
                <p className="text-xs mb-2 tracking-widest" style={{ color: 'rgba(255,140,187,0.5)', letterSpacing: '0.15em' }}>{s.label}</p>
                <p className="text-lg font-black" style={{ color: s.color, fontFamily: "'Cinzel', serif", textShadow: `0 0 10px ${s.color}60` }}>
                  {s.value}
                </p>
              </div>
            ))}
          </div>

          {/* グラフ */}
          <div
            className="rounded-2xl p-6 mb-6"
            style={{
              background: 'linear-gradient(135deg, rgba(15,5,25,0.9), rgba(8,4,18,0.9))',
              border: '1px solid rgba(255,45,120,0.2)',
              boxShadow: '0 0 30px rgba(255,45,120,0.06)',
            }}
          >
            <SectionTitle>{VIEWS.find((v) => v.key === view)?.label}売上</SectionTitle>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,45,120,0.05)" />
                  <XAxis dataKey="label" tick={{ fill: 'rgba(255,140,187,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={fmtShort} tick={{ fill: 'rgba(255,140,187,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="amount" radius={[4, 4, 0, 0]} fill="url(#barGrad)" />
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={NEON_PINK} stopOpacity={0.8} />
                      <stop offset="100%" stopColor={NEON_PINK} stopOpacity={0.3} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ color: 'rgba(255,140,187,0.3)', textAlign: 'center', py: 8 }}>データがありません</p>
            )}
          </div>

          {/* キャスト別売上（円グラフ + 縦棒グラフ） */}
          {castRanking.length > 0 && (
            <div
              className="rounded-2xl p-6"
              style={{
                background: 'linear-gradient(135deg, rgba(15,5,25,0.9), rgba(8,4,18,0.9))',
                border: '1px solid rgba(255,228,77,0.15)',
              }}
            >
              <SectionTitle>キャスト別売上</SectionTitle>

              {/* グラフ2列レイアウト */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                {/* 円グラフ */}
                <div
                  className="rounded-lg p-4"
                  style={{
                    background: 'rgba(255,45,120,0.05)',
                    border: '1px solid rgba(255,228,77,0.2)',
                  }}
                >
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={castRanking}
                        dataKey="amount"
                        nameKey="castName"
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                        label={({ percent }) => {
                          const text = `${(percent * 100).toFixed(0)}%`;
                          return (
                            <text
                              x={0}
                              y={0}
                              fill="#f0e6c8"
                              textAnchor="middle"
                              dominantBaseline="middle"
                              fontSize={13}
                              fontWeight="bold"
                              style={{ textShadow: '0 0 3px rgba(0,0,0,0.8)' }}
                            >
                              {percent > 5 ? text : ''}
                            </text>
                          );
                        }}
                      >
                        {castRanking.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => fmtFull(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* 縦棒グラフ */}
                <div
                  className="rounded-lg p-4"
                  style={{
                    background: 'rgba(255,45,120,0.05)',
                    border: '1px solid rgba(255,228,77,0.2)',
                  }}
                >
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={castRanking} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,45,120,0.05)" />
                      <XAxis
                        dataKey="castName"
                        tick={{ fill: 'rgba(255,140,187,0.4)', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis
                        tickFormatter={fmtShort}
                        tick={{ fill: 'rgba(255,140,187,0.4)', fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar
                        dataKey="amount"
                        radius={[4, 4, 0, 0]}
                        fill="url(#castBarGrad)"
                      />
                      <defs>
                        <linearGradient id="castBarGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={NEON_GOLD} stopOpacity={0.8} />
                          <stop offset="100%" stopColor={NEON_GOLD} stopOpacity={0.3} />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* キャスト別売上リスト */}
              <div className="space-y-3">
                {castRanking.map((cast, i) => (
                  <div key={cast.castId} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ background: COLORS[i % COLORS.length] }}
                      />
                      <span style={{ color: '#f0e6c8', fontFamily: "'Noto Sans JP', sans-serif" }}>{cast.castName}</span>
                    </div>
                    <span style={{ color: NEON_GOLD, fontFamily: "'Cinzel', serif" }}>¥{cast.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
