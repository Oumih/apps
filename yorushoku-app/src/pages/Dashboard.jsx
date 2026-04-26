import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const NEON_PINK = '#ff2d78';
const NEON_GOLD = '#ffe44d';

const fmt = (n) => `¥${n.toLocaleString()}`;

function addDays(dateStr, delta) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + delta);
  return d.toISOString().slice(0, 10);
}

function formatDisplay(dateStr) {
  const [y, m, day] = dateStr.split('-');
  return `${y}/${m}/${day}`;
}

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

const CustomTooltip = ({ active, payload }) => {
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
        <p style={{ color: NEON_GOLD, fontFamily: "'Cinzel', serif" }}>¥{payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [castSales, setCastSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchDailySales();
  }, [user, date]);

  const fetchDailySales = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // プロフィール取得
      const { data: profile } = await supabase
        .from('profiles')
        .select('store_id')
        .eq('id', user.id)
        .single();

      if (!profile) {
        setCastSales([]);
        setLoading(false);
        return;
      }

      // 指定日付の売上データを取得
      const { data: sales } = await supabase
        .from('sales')
        .select('cast_id, amount')
        .eq('store_id', profile.store_id)
        .eq('date', date);

      // 全キャスト情報を取得
      const { data: casts } = await supabase
        .from('casts')
        .select('id, name')
        .eq('store_id', profile.store_id)
        .eq('is_active', true)
        .order('created_at');

      // キャスト売上マップを作成
      const salesMap = {};
      if (sales) {
        sales.forEach((sale) => {
          if (!salesMap[sale.cast_id]) salesMap[sale.cast_id] = 0;
          salesMap[sale.cast_id] += sale.amount;
        });
      }

      // 全キャストの売上情報を作成（0円のキャストも含む）
      const allCastSales = (casts || []).map((cast) => ({
        castId: cast.id,
        castName: cast.name,
        amount: salesMap[cast.id] || 0,
      }));

      // 売上でソート
      const sorted = allCastSales.sort((a, b) => b.amount - a.amount);
      setCastSales(sorted);
    } catch (err) {
      console.error('Error fetching sales:', err);
      setCastSales([]);
    } finally {
      setLoading(false);
    }
  };

  const total = castSales.reduce((s, row) => s + row.amount, 0);
  const isEmpty = total === 0;

  return (
    <div className="max-w-5xl mx-auto">
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
          日次売上・キャストランキング
        </p>
      </div>

      {/* 日付ナビゲーター */}
      <div
        className="flex items-center justify-between rounded-2xl px-6 py-4 mb-6"
        style={{
          background: 'linear-gradient(135deg, rgba(15,5,25,0.9), rgba(8,4,18,0.9))',
          border: '1px solid rgba(255,45,120,0.2)',
        }}
      >
        <button
          onClick={() => setDate(addDays(date, -1))}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all hover:opacity-70"
          style={{ background: 'rgba(255,45,120,0.1)', border: '1px solid rgba(255,45,120,0.3)', color: NEON_PINK }}
        >
          ‹
        </button>

        <div className="text-center">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="text-xl font-black text-center bg-transparent border-none outline-none cursor-pointer"
            style={{
              fontFamily: "'Cinzel', serif",
              color: '#f0e6c8',
              letterSpacing: '0.1em',
            }}
          />
        </div>

        <button
          onClick={() => setDate(addDays(date, 1))}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all hover:opacity-70"
          style={{ background: 'rgba(255,45,120,0.1)', border: '1px solid rgba(255,45,120,0.3)', color: NEON_PINK }}
        >
          ›
        </button>
      </div>

      {/* 日次売上合計 */}
      <div
        className="rounded-2xl p-6 mb-6 text-center"
        style={{
          background: 'linear-gradient(135deg, rgba(15,5,25,0.9), rgba(8,4,18,0.9))',
          border: `1px solid ${NEON_GOLD}30`,
          boxShadow: `0 0 30px ${NEON_GOLD}08`,
        }}
      >
        <p className="text-xs tracking-widest mb-2" style={{ color: 'rgba(255,140,187,0.5)', letterSpacing: '0.2em' }}>
          {formatDisplay(date)} の売上
        </p>
        <p
          className="text-4xl font-black"
          style={{
            fontFamily: "'Cinzel', serif",
            background: `linear-gradient(135deg, ${NEON_GOLD}, #ff8c00)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: `drop-shadow(0 0 10px ${NEON_GOLD}60)`,
          }}
        >
          {isEmpty ? '—' : fmt(total)}
        </p>
      </div>

      {/* キャストランキング（横棒グラフ） */}
      <div
        className="rounded-2xl p-6"
        style={{
          background: 'linear-gradient(135deg, rgba(15,5,25,0.9), rgba(8,4,18,0.9))',
          border: '1px solid rgba(255,45,120,0.15)',
        }}
      >
        <SectionTitle>キャストランキング</SectionTitle>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm tracking-widest" style={{ color: 'rgba(255,140,187,0.25)', letterSpacing: '0.15em' }}>
              読み込み中...
            </p>
          </div>
        ) : isEmpty ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm tracking-widest" style={{ color: 'rgba(255,140,187,0.25)', letterSpacing: '0.15em' }}>
              この日の売上データはありません
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {castSales.map((cast, i) => {
              const maxAmount = castSales[0].amount || 1;
              const barWidth = (cast.amount / maxAmount) * 100;

              return (
                <div key={cast.castId} className="flex items-center gap-4">
                  {/* 順位 */}
                  <div className="w-8 flex-shrink-0">
                    <p
                      className="text-lg font-black text-center"
                      style={{
                        fontFamily: "'Cinzel', serif",
                        color: i === 0 ? NEON_GOLD : 'rgba(255,140,187,0.6)',
                        textShadow: i === 0 ? `0 0 10px ${NEON_GOLD}` : 'none',
                      }}
                    >
                      {i + 1}
                    </p>
                  </div>

                  {/* 棒グラフ + キャスト名 */}
                  <div className="flex-1 min-w-0">
                    <div
                      className="rounded-xl py-3 px-4 relative overflow-hidden"
                      style={{
                        background: 'rgba(255,45,120,0.05)',
                        border: '1px solid rgba(255,45,120,0.15)',
                      }}
                    >
                      {/* 棒グラフの背景 */}
                      <div
                        className="absolute inset-y-0 left-0 rounded-xl opacity-50"
                        style={{
                          background: `linear-gradient(90deg, ${NEON_PINK}, rgba(255,45,120,0.3))`,
                          width: `${barWidth}%`,
                          zIndex: 0,
                        }}
                      />
                      {/* テキスト */}
                      <p className="text-sm font-semibold relative z-10" style={{ color: '#f0e6c8', fontFamily: "'Noto Sans JP', sans-serif" }}>
                        {cast.castName}
                      </p>
                    </div>
                  </div>

                  {/* 売上数値 */}
                  <div className="w-32 flex-shrink-0 text-right">
                    <p
                      className="text-sm font-black"
                      style={{
                        color: NEON_GOLD,
                        fontFamily: "'Cinzel', serif",
                        textShadow: i === 0 ? `0 0 8px ${NEON_GOLD}80` : 'none',
                      }}
                    >
                      {fmt(cast.amount)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
