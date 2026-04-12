import { useState } from 'react';
import { dailySales, monthlySales, yearlySales } from '../data/mockData';
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';

const NEON_PINK = '#ff2d78';
const NEON_GOLD = '#ffe44d';

const VIEWS = [
  { key: 'daily', label: '日別' },
  { key: 'monthly', label: '月別' },
  { key: 'yearly', label: '年別' },
];

const fmtShort = (n) => n >= 10000 ? `${(n / 10000).toFixed(0)}万` : n.toLocaleString();

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

  const data = view === 'daily' ? dailySales : view === 'monthly' ? monthlySales : yearlySales;
  const dataKey = view === 'daily' ? 'date' : view === 'monthly' ? 'month' : 'year';

  const total = data.reduce((s, d) => s + d.amount, 0);
  const avg = Math.floor(total / data.length);
  const max = Math.max(...data.map((d) => d.amount));

  return (
    <div className="max-w-5xl mx-auto">
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
      <div className="flex gap-2 mb-6">
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

      {/* サマリー */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: '合計', value: `¥${total.toLocaleString()}`, color: NEON_GOLD },
          { label: '平均', value: `¥${avg.toLocaleString()}`, color: NEON_PINK },
          { label: '最高', value: `¥${max.toLocaleString()}`, color: '#cc88ff' },
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
        <ResponsiveContainer width="100%" height={260}>
          {view === 'daily' ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,45,120,0.05)" />
              <XAxis dataKey={dataKey} tick={{ fill: 'rgba(255,140,187,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} interval={4} />
              <YAxis tickFormatter={fmtShort} tick={{ fill: 'rgba(255,140,187,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="amount" stroke={NEON_PINK} strokeWidth={2} dot={false}
                style={{ filter: 'drop-shadow(0 0 4px rgba(255,45,120,0.8))' }} />
            </LineChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,45,120,0.05)" />
              <XAxis dataKey={dataKey} tick={{ fill: 'rgba(255,140,187,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={fmtShort} tick={{ fill: 'rgba(255,140,187,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="amount" radius={[4, 4, 0, 0]}
                fill="url(#barGrad)"
              />
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={NEON_PINK} stopOpacity={0.8} />
                  <stop offset="100%" stopColor={NEON_PINK} stopOpacity={0.3} />
                </linearGradient>
              </defs>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* テーブル */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,45,120,0.15)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'rgba(255,45,120,0.08)' }}>
              <th className="text-left px-6 py-3 font-semibold tracking-widest" style={{ color: 'rgba(255,140,187,0.6)', fontSize: '11px', letterSpacing: '0.15em' }}>期間</th>
              <th className="text-right px-6 py-3 font-semibold tracking-widest" style={{ color: 'rgba(255,140,187,0.6)', fontSize: '11px', letterSpacing: '0.15em' }}>売上</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} style={{ borderTop: '1px solid rgba(255,45,120,0.06)' }}>
                <td className="px-6 py-3" style={{ color: 'rgba(240,220,230,0.7)' }}>{row[dataKey]}</td>
                <td className="px-6 py-3 text-right font-bold" style={{ color: NEON_GOLD, fontFamily: "'Cinzel', serif" }}>
                  ¥{row.amount.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
