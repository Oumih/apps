import { casts, customers, monthlySales, store } from '../data/mockData';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const fmt = (n) => `¥${(n / 10000).toFixed(0)}万`;

const NEON_PINK = '#ff2d78';
const NEON_GOLD = '#ffe44d';
const NEON_BLUE = '#00b4ff';

function StatCard({ icon, label, value, sub, color = NEON_PINK }) {
  return (
    <div
      className="rounded-2xl p-5 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(15,5,25,0.9), rgba(8,4,18,0.9))',
        border: `1px solid ${color}35`,
        boxShadow: `0 0 20px ${color}10, inset 0 1px 0 rgba(255,255,255,0.05)`,
      }}
    >
      {/* コーナーアクセント */}
      <div className="absolute top-0 left-0 w-8 h-8" style={{ background: `linear-gradient(135deg, ${color}30, transparent)`, borderRadius: '0 0 100% 0' }} />

      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl" style={{ filter: `drop-shadow(0 0 8px ${color})` }}>{icon}</span>
      </div>
      <p
        className="text-2xl font-black mb-1"
        style={{
          fontFamily: "'Cinzel', serif",
          background: `linear-gradient(135deg, ${color}, ${color}99)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: `drop-shadow(0 0 6px ${color}80)`,
        }}
      >
        {value}
      </p>
      <p className="text-xs font-medium" style={{ color: 'rgba(240,200,220,0.5)', letterSpacing: '0.1em' }}>{label}</p>
      {sub && <p className="text-xs mt-1" style={{ color: `${color}80` }}>{sub}</p>}
    </div>
  );
}

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
      <h2 className="text-sm font-bold tracking-widest" style={{ color: '#ffd0e8', fontFamily: "'Noto Sans JP', sans-serif", letterSpacing: '0.15em' }}>
        {children}
      </h2>
    </div>
  );
}

export default function Dashboard() {
  const thisMonthSales = monthlySales[monthlySales.length - 1].amount;
  const lastMonthSales = monthlySales[monthlySales.length - 2].amount;
  const growth = (((thisMonthSales - lastMonthSales) / lastMonthSales) * 100).toFixed(1);

  return (
    <div className="max-w-6xl mx-auto">
      {/* ヘッダー */}
      <div className="mb-8">
        <h1
          className="text-3xl font-black mb-1 tracking-wide"
          style={{
            fontFamily: "'Playfair Display', serif",
            background: 'linear-gradient(135deg, #fff5e0, #ffd0e8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Dashboard
        </h1>
        <p className="text-xs tracking-widest" style={{ color: 'rgba(255,140,187,0.5)', letterSpacing: '0.2em' }}>
          {store.name} — 2024年6月
        </p>
      </div>

      {/* サマリーカード */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard icon="💴" label="今月売上" value={fmt(thisMonthSales)} sub={`前月比 +${growth}%`} color={NEON_GOLD} />
        <StatCard icon="✨" label="在籍キャスト" value={`${casts.length}名`} sub="アクティブ" color={NEON_PINK} />
        <StatCard icon="👑" label="登録顧客数" value={`${customers.length}名`} sub="累計" color="#cc88ff" />
        <StatCard icon="🥂" label="今月来店数" value="186回" sub="前月比 +12%" color={NEON_BLUE} />
      </div>

      {/* 売上グラフ */}
      <div
        className="rounded-2xl p-6 mb-6"
        style={{
          background: 'linear-gradient(135deg, rgba(15,5,25,0.9), rgba(8,4,18,0.9))',
          border: '1px solid rgba(255,45,120,0.2)',
          boxShadow: '0 0 30px rgba(255,45,120,0.06)',
        }}
      >
        <SectionTitle>月別売上推移</SectionTitle>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={monthlySales}>
            <defs>
              <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={NEON_PINK} stopOpacity={0.4} />
                <stop offset="95%" stopColor={NEON_PINK} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" tick={{ fill: 'rgba(255,140,187,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={(v) => `${(v / 10000).toFixed(0)}万`} tick={{ fill: 'rgba(255,140,187,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="amount" stroke={NEON_PINK} strokeWidth={2} fill="url(#salesGrad)"
              style={{ filter: 'drop-shadow(0 0 6px rgba(255,45,120,0.6))' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* キャストランキング + VIP顧客 */}
      <div className="grid grid-cols-2 gap-5">
        {/* キャストランキング */}
        <div
          className="rounded-2xl p-6"
          style={{
            background: 'linear-gradient(135deg, rgba(15,5,25,0.9), rgba(8,4,18,0.9))',
            border: '1px solid rgba(255,228,77,0.15)',
            boxShadow: '0 0 20px rgba(255,228,77,0.04)',
          }}
        >
          <SectionTitle>キャストランキング</SectionTitle>
          <div className="space-y-4">
            {casts.map((cast, i) => {
              const rankColors = ['#ffe44d', '#c0c0d0', '#cd9a40', 'rgba(255,140,187,0.5)'];
              return (
                <div key={cast.id} className="flex items-center gap-4">
                  <span
                    className="text-lg font-black w-6 text-center"
                    style={{
                      fontFamily: "'Cinzel', serif",
                      color: rankColors[i],
                      textShadow: i === 0 ? `0 0 10px ${NEON_GOLD}` : 'none',
                    }}
                  >
                    {i + 1}
                  </span>
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{
                      background: i === 0 ? 'rgba(255,228,77,0.15)' : 'rgba(255,45,120,0.1)',
                      border: `1px solid ${rankColors[i]}40`,
                      color: rankColors[i],
                    }}
                  >
                    {cast.name[0]}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold" style={{ color: '#f0e6c8' }}>{cast.name}</p>
                    <p className="text-xs" style={{ color: 'rgba(255,140,187,0.4)' }}>姫 {cast.himes.length}名</p>
                  </div>
                  <span
                    className="text-sm font-bold"
                    style={{
                      fontFamily: "'Cinzel', serif",
                      color: rankColors[i],
                      textShadow: i === 0 ? `0 0 8px ${NEON_GOLD}80` : 'none',
                    }}
                  >
                    {fmt(cast.sales.total)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* VIP顧客 */}
        <div
          className="rounded-2xl p-6"
          style={{
            background: 'linear-gradient(135deg, rgba(15,5,25,0.9), rgba(8,4,18,0.9))',
            border: '1px solid rgba(204,136,255,0.2)',
            boxShadow: '0 0 20px rgba(204,136,255,0.04)',
          }}
        >
          <SectionTitle>VIP顧客</SectionTitle>
          <div className="space-y-4">
            {customers.slice(0, 4).map((c) => (
              <div key={c.id} className="flex items-center gap-4">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm"
                  style={{ background: 'rgba(204,136,255,0.15)', border: '1px solid rgba(204,136,255,0.3)', color: '#cc88ff' }}
                >
                  {c.name[0]}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold" style={{ color: '#f0e6c8' }}>{c.name}</p>
                  <p className="text-xs" style={{ color: 'rgba(204,136,255,0.5)' }}>担当: {c.favoriteCast}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold" style={{ color: '#cc88ff', fontFamily: "'Cinzel', serif" }}>{fmt(c.totalSpent)}</p>
                  <p className="text-xs" style={{ color: 'rgba(204,136,255,0.4)' }}>{c.visitCount}回来店</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
