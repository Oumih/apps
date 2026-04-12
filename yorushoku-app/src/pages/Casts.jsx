import { useState } from 'react';
import { casts } from '../data/mockData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const NEON_PINK = '#ff2d78';
const NEON_GOLD = '#ffe44d';

const fmt = (n) => `¥${(n / 10000).toFixed(0)}万`;

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="px-3 py-2 rounded-xl text-xs"
        style={{ background: 'rgba(10,4,22,0.95)', border: '1px solid rgba(255,45,120,0.4)', color: '#f0e6c8' }}>
        <p>{label}: ¥{payload[0].value.toLocaleString()}</p>
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

function CastCard({ cast, onClick, selected }) {
  return (
    <div
      onClick={() => onClick(cast)}
      className="rounded-2xl p-5 cursor-pointer transition-all hover:scale-[1.01]"
      style={{
        background: selected
          ? 'linear-gradient(135deg, rgba(255,45,120,0.15), rgba(255,45,120,0.05))'
          : 'linear-gradient(135deg, rgba(15,5,25,0.9), rgba(8,4,18,0.9))',
        border: `1px solid ${selected ? 'rgba(255,45,120,0.6)' : 'rgba(255,45,120,0.12)'}`,
        boxShadow: selected ? '0 0 20px rgba(255,45,120,0.15)' : 'none',
      }}
    >
      <div className="flex items-center gap-4">
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center text-base font-black flex-shrink-0"
          style={{
            background: 'rgba(255,45,120,0.12)',
            border: '1px solid rgba(255,45,120,0.3)',
            color: NEON_PINK,
            fontFamily: "'Cinzel', serif",
            textShadow: `0 0 10px ${NEON_PINK}`,
          }}
        >
          {cast.name[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="font-semibold text-sm" style={{ color: '#f0e6c8', fontFamily: "'Noto Sans JP', sans-serif" }}>{cast.name}</p>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-bold"
              style={{
                background: 'rgba(255,228,77,0.12)',
                border: '1px solid rgba(255,228,77,0.3)',
                color: NEON_GOLD,
                fontFamily: "'Cinzel', serif",
                textShadow: `0 0 6px ${NEON_GOLD}80`,
              }}
            >
              {cast.rank}
            </span>
          </div>
          <p className="text-xs" style={{ color: 'rgba(255,140,187,0.4)' }}>{cast.kana}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="font-black text-sm" style={{ color: NEON_GOLD, fontFamily: "'Cinzel', serif" }}>{fmt(cast.sales.total)}</p>
          <p className="text-xs" style={{ color: 'rgba(255,140,187,0.35)' }}>累計売上</p>
        </div>
      </div>
    </div>
  );
}

function CastDetail({ cast }) {
  if (!cast) return (
    <div
      className="rounded-2xl p-8 flex items-center justify-center h-64"
      style={{
        background: 'linear-gradient(135deg, rgba(15,5,25,0.6), rgba(8,4,18,0.6))',
        border: '1px solid rgba(255,45,120,0.08)',
      }}
    >
      <p className="text-sm tracking-widest" style={{ color: 'rgba(255,140,187,0.25)', letterSpacing: '0.15em' }}>
        キャストを選択してください
      </p>
    </div>
  );

  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: 'linear-gradient(135deg, rgba(15,5,25,0.95), rgba(8,4,18,0.95))',
        border: '1px solid rgba(255,45,120,0.25)',
        boxShadow: '0 0 30px rgba(255,45,120,0.08)',
      }}
    >
      {/* プロフィールヘッダー */}
      <div className="flex items-center gap-4 mb-6 pb-5" style={{ borderBottom: '1px solid rgba(255,45,120,0.1)' }}>
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black"
          style={{
            background: 'rgba(255,45,120,0.12)',
            border: '2px solid rgba(255,45,120,0.4)',
            color: NEON_PINK,
            fontFamily: "'Cinzel', serif",
            boxShadow: `0 0 20px rgba(255,45,120,0.3)`,
            textShadow: `0 0 10px ${NEON_PINK}`,
          }}
        >
          {cast.name[0]}
        </div>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-xl font-black" style={{ color: '#f0e6c8', fontFamily: "'Noto Sans JP', sans-serif" }}>{cast.name}</h2>
            <span
              className="text-xs px-2.5 py-1 rounded-full font-bold"
              style={{
                background: 'rgba(255,228,77,0.12)',
                border: '1px solid rgba(255,228,77,0.4)',
                color: NEON_GOLD,
                fontFamily: "'Cinzel', serif",
                textShadow: `0 0 8px ${NEON_GOLD}`,
              }}
            >
              {cast.rank}
            </span>
          </div>
          <p className="text-xs tracking-wider" style={{ color: 'rgba(255,140,187,0.5)' }}>{cast.kana} | 入店: {cast.joinedAt}</p>
        </div>
      </div>

      {/* プロフィール文 */}
      <div className="mb-5">
        <p className="text-xs mb-2 font-semibold tracking-widest" style={{ color: 'rgba(255,140,187,0.5)', letterSpacing: '0.2em' }}>PROFILE</p>
        <p className="text-sm leading-relaxed" style={{ color: 'rgba(240,220,230,0.7)' }}>{cast.profile}</p>
      </div>

      {/* 売上グラフ */}
      <div className="mb-5">
        <p className="text-xs mb-3 font-semibold tracking-widest" style={{ color: 'rgba(255,140,187,0.5)', letterSpacing: '0.2em' }}>MONTHLY SALES</p>
        <ResponsiveContainer width="100%" height={130}>
          <BarChart data={cast.sales.monthly}>
            <XAxis dataKey="month" tick={{ fill: 'rgba(255,140,187,0.4)', fontSize: 10 }} axisLine={false} tickLine={false}
              tickFormatter={(v) => v.replace('2024-', '')} />
            <YAxis tick={{ fill: 'rgba(255,140,187,0.4)', fontSize: 10 }} axisLine={false} tickLine={false}
              tickFormatter={(v) => `${(v / 10000).toFixed(0)}万`} />
            <Tooltip content={<CustomTooltip />} />
            <defs>
              <linearGradient id="castBarGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={NEON_PINK} stopOpacity={0.8} />
                <stop offset="100%" stopColor={NEON_PINK} stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <Bar dataKey="amount" fill="url(#castBarGrad)" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 姫リスト */}
      <div>
        <p className="text-xs mb-3 font-semibold tracking-widest" style={{ color: 'rgba(255,140,187,0.5)', letterSpacing: '0.2em' }}>HIME LIST</p>
        <div className="space-y-2">
          {cast.himes.map((hime) => (
            <div
              key={hime.id}
              className="flex items-center justify-between px-4 py-2.5 rounded-xl"
              style={{
                background: 'rgba(204,136,255,0.06)',
                border: '1px solid rgba(204,136,255,0.15)',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: 'rgba(204,136,255,0.15)', border: '1px solid rgba(204,136,255,0.3)', color: '#cc88ff' }}
                >
                  {hime.name[0]}
                </div>
                <span className="text-sm" style={{ color: '#f0e6c8' }}>{hime.name}</span>
              </div>
              <span className="text-xs" style={{ color: 'rgba(204,136,255,0.5)' }}>{hime.visitCount}回来店</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Casts() {
  const [selected, setSelected] = useState(null);

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
          Cast
        </h1>
        <p className="text-xs tracking-widest" style={{ color: 'rgba(255,140,187,0.5)', letterSpacing: '0.2em' }}>
          在籍キャストの情報を管理します
        </p>
      </div>

      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-2 space-y-3">
          {casts.map((cast) => (
            <CastCard key={cast.id} cast={cast} onClick={setSelected} selected={selected?.id === cast.id} />
          ))}
        </div>
        <div className="col-span-3">
          <CastDetail cast={selected} />
        </div>
      </div>
    </div>
  );
}
