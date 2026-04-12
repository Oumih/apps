import { useState } from 'react';
import { customers } from '../data/mockData';

const NEON_PINK = '#ff2d78';
const NEON_GOLD = '#ffe44d';
const NEON_PURPLE = '#cc88ff';

const fmt = (n) => `¥${(n / 10000).toFixed(0)}万`;

function CustomerRow({ customer, onClick, selected }) {
  const since = new Date(customer.since);
  const months = Math.floor((new Date() - since) / (1000 * 60 * 60 * 24 * 30));

  return (
    <tr
      onClick={() => onClick(customer)}
      className="cursor-pointer transition-all"
      style={{
        borderTop: '1px solid rgba(255,45,120,0.06)',
        background: selected ? 'rgba(255,45,120,0.07)' : 'transparent',
      }}
      onMouseEnter={(e) => { if (!selected) e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
      onMouseLeave={(e) => { if (!selected) e.currentTarget.style.background = 'transparent'; }}
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{ background: 'rgba(204,136,255,0.12)', border: '1px solid rgba(204,136,255,0.25)', color: NEON_PURPLE }}
          >
            {customer.name[0]}
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: '#f0e6c8' }}>{customer.name}</p>
            <p className="text-xs" style={{ color: 'rgba(204,136,255,0.4)' }}>{customer.kana}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <p className="text-sm" style={{ color: 'rgba(240,220,230,0.5)' }}>{customer.since}</p>
        <p className="text-xs" style={{ color: 'rgba(204,136,255,0.35)' }}>{months}ヶ月</p>
      </td>
      <td className="px-6 py-4 text-sm" style={{ color: 'rgba(255,140,187,0.7)' }}>{customer.favoriteCast}</td>
      <td className="px-6 py-4 text-right">
        <p className="text-sm font-black" style={{ color: NEON_GOLD, fontFamily: "'Cinzel', serif" }}>{fmt(customer.totalSpent)}</p>
        <p className="text-xs" style={{ color: 'rgba(255,228,77,0.4)' }}>{customer.visitCount}回</p>
      </td>
    </tr>
  );
}

function CustomerDetail({ customer }) {
  if (!customer) return null;

  const since = new Date(customer.since);
  const months = Math.floor((new Date() - since) / (1000 * 60 * 60 * 24 * 30));

  return (
    <div
      className="mt-5 rounded-2xl p-6"
      style={{
        background: 'linear-gradient(135deg, rgba(15,5,25,0.95), rgba(8,4,18,0.95))',
        border: '1px solid rgba(204,136,255,0.25)',
        boxShadow: '0 0 30px rgba(204,136,255,0.06)',
      }}
    >
      <div className="flex items-start gap-6">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black flex-shrink-0"
          style={{
            background: 'rgba(204,136,255,0.12)',
            border: '2px solid rgba(204,136,255,0.4)',
            color: NEON_PURPLE,
            fontFamily: "'Cinzel', serif",
            boxShadow: '0 0 20px rgba(204,136,255,0.25)',
            textShadow: `0 0 10px ${NEON_PURPLE}`,
          }}
        >
          {customer.name[0]}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-black mb-1" style={{ color: '#f0e6c8', fontFamily: "'Noto Sans JP', sans-serif" }}>{customer.name}</h2>
          <p className="text-xs mb-4 tracking-wider" style={{ color: 'rgba(204,136,255,0.5)' }}>{customer.kana}</p>

          <div className="grid grid-cols-4 gap-3 mb-4">
            {[
              { label: '来店開始', value: customer.since },
              { label: '在籍期間', value: `${months}ヶ月` },
              { label: '担当キャスト', value: customer.favoriteCast },
              { label: '来店回数', value: `${customer.visitCount}回` },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl p-3"
                style={{ background: 'rgba(204,136,255,0.06)', border: '1px solid rgba(204,136,255,0.12)' }}
              >
                <p className="text-xs mb-1 tracking-wider" style={{ color: 'rgba(204,136,255,0.4)', letterSpacing: '0.1em' }}>{item.label}</p>
                <p className="text-sm font-semibold" style={{ color: 'rgba(240,200,230,0.8)' }}>{item.value}</p>
              </div>
            ))}
          </div>

          <div
            className="flex items-center justify-between rounded-xl p-4 mb-4"
            style={{
              background: 'rgba(255,228,77,0.06)',
              border: '1px solid rgba(255,228,77,0.2)',
              boxShadow: '0 0 15px rgba(255,228,77,0.04)',
            }}
          >
            <span className="text-xs tracking-widest" style={{ color: 'rgba(255,228,77,0.5)', letterSpacing: '0.2em' }}>TOTAL SPEND</span>
            <span
              className="text-xl font-black"
              style={{ color: NEON_GOLD, fontFamily: "'Cinzel', serif", textShadow: `0 0 10px ${NEON_GOLD}80` }}
            >
              ¥{customer.totalSpent.toLocaleString()}
            </span>
          </div>

          {customer.memo && (
            <div
              className="rounded-xl p-4"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,45,120,0.1)' }}
            >
              <p className="text-xs mb-1 tracking-widest" style={{ color: 'rgba(255,140,187,0.4)', letterSpacing: '0.2em' }}>MEMO</p>
              <p className="text-sm" style={{ color: 'rgba(240,200,220,0.65)' }}>{customer.memo}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Customers() {
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');

  const filtered = customers.filter((c) =>
    c.name.includes(search) || c.kana.includes(search) || c.favoriteCast.includes(search)
  );

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            className="text-3xl font-black mb-1"
            style={{
              fontFamily: "'Playfair Display', serif",
              background: 'linear-gradient(135deg, #fff5e0, #ffd0e8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Customer
          </h1>
          <p className="text-xs tracking-widest" style={{ color: 'rgba(255,140,187,0.5)', letterSpacing: '0.2em' }}>
            登録顧客: {customers.length}名
          </p>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="名前・担当で検索..."
          className="px-4 py-2.5 rounded-xl text-sm outline-none"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,45,120,0.25)',
            color: '#f0e6c8',
            width: '220px',
            fontFamily: "'Noto Sans JP', sans-serif",
          }}
          onFocus={(e) => { e.target.style.borderColor = NEON_PINK; e.target.style.boxShadow = '0 0 12px rgba(255,45,120,0.2)'; }}
          onBlur={(e) => { e.target.style.borderColor = 'rgba(255,45,120,0.25)'; e.target.style.boxShadow = 'none'; }}
        />
      </div>

      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: '1px solid rgba(255,45,120,0.15)', background: 'linear-gradient(135deg, rgba(15,5,25,0.9), rgba(8,4,18,0.9))' }}
      >
        <table className="w-full">
          <thead>
            <tr style={{ background: 'rgba(255,45,120,0.06)' }}>
              {['顧客名', '来店開始', '担当キャスト', '累計'].map((h, i) => (
                <th
                  key={h}
                  className={`${i === 3 ? 'text-right' : 'text-left'} px-6 py-3 text-xs font-semibold tracking-widest`}
                  style={{ color: 'rgba(255,140,187,0.5)', letterSpacing: '0.15em' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <CustomerRow
                key={c.id}
                customer={c}
                onClick={(c) => setSelected(selected?.id === c.id ? null : c)}
                selected={selected?.id === c.id}
              />
            ))}
          </tbody>
        </table>
      </div>

      <CustomerDetail customer={selected} />
    </div>
  );
}
