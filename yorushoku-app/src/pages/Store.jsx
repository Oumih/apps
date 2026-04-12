import { store } from '../data/mockData';

const NEON_PINK = '#ff2d78';
const NEON_GOLD = '#ffe44d';

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start gap-4 py-4" style={{ borderBottom: '1px solid rgba(255,45,120,0.07)' }}>
      <span className="text-xs w-28 flex-shrink-0 tracking-widest" style={{ color: 'rgba(255,140,187,0.45)', letterSpacing: '0.15em', paddingTop: '2px' }}>
        {label}
      </span>
      <span className="text-sm font-medium" style={{ color: '#f0e6c8' }}>{value}</span>
    </div>
  );
}

export default function Store() {
  return (
    <div className="max-w-3xl mx-auto">
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
          Store
        </h1>
        <p className="text-xs tracking-widest" style={{ color: 'rgba(255,140,187,0.5)', letterSpacing: '0.2em' }}>
          店舗の基本情報を管理します
        </p>
      </div>

      {/* 店舗メインカード */}
      <div
        className="rounded-2xl p-8 mb-5"
        style={{
          background: 'linear-gradient(135deg, rgba(15,5,25,0.95), rgba(8,4,18,0.95))',
          border: '1px solid rgba(255,45,120,0.2)',
          boxShadow: '0 0 40px rgba(255,45,120,0.06)',
        }}
      >
        <div className="flex items-center gap-5 mb-8 pb-6" style={{ borderBottom: '1px solid rgba(255,45,120,0.1)' }}>
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
            style={{
              background: 'rgba(255,45,120,0.1)',
              border: '1px solid rgba(255,45,120,0.3)',
              boxShadow: '0 0 20px rgba(255,45,120,0.2)',
            }}
          >
            🏯
          </div>
          <div>
            <h2
              className="text-2xl font-black mb-1"
              style={{
                fontFamily: "'Cinzel', serif",
                background: `linear-gradient(135deg, ${NEON_GOLD}, #ff8c00)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: `drop-shadow(0 0 8px rgba(255,228,77,0.6))`,
              }}
            >
              {store.name}
            </h2>
            <p className="text-xs tracking-widest" style={{ color: 'rgba(255,140,187,0.4)', letterSpacing: '0.2em' }}>
              STORE ID: {store.id}
            </p>
          </div>
        </div>

        <div>
          <InfoRow label="住所" value={store.address} />
          <InfoRow label="電話番号" value={store.phone} />
          <InfoRow label="営業時間" value={`${store.openTime} 〜 ${store.closeTime}`} />
          <InfoRow label="緯度" value={String(store.lat)} />
          <InfoRow label="経度" value={String(store.lng)} />
        </div>
      </div>

      {/* 地図エリア（モック） */}
      <div
        className="rounded-2xl overflow-hidden mb-6"
        style={{ border: '1px solid rgba(0,180,255,0.15)' }}
      >
        <div
          className="flex items-center justify-center"
          style={{
            height: '260px',
            background: 'linear-gradient(135deg, rgba(0,30,60,0.6), rgba(5,5,18,0.8))',
          }}
        >
          <div className="text-center">
            <div className="text-5xl mb-4" style={{ filter: 'drop-shadow(0 0 15px rgba(0,180,255,0.6))' }}>🗺️</div>
            <p className="text-sm font-semibold mb-1" style={{ color: 'rgba(0,180,255,0.6)' }}>マップ表示エリア</p>
            <p className="text-xs mb-3" style={{ color: 'rgba(0,180,255,0.35)' }}>
              {store.lat} / {store.lng}
            </p>
            <span
              className="text-xs px-4 py-1.5 rounded-full"
              style={{
                background: 'rgba(0,180,255,0.08)',
                border: '1px solid rgba(0,180,255,0.2)',
                color: 'rgba(0,180,255,0.5)',
                letterSpacing: '0.1em',
              }}
            >
              DB連携後にGoogle Maps表示
            </span>
          </div>
        </div>
      </div>

      {/* 保存ボタン */}
      <div className="flex justify-end gap-3">
        <button
          className="px-6 py-2.5 rounded-xl text-sm font-semibold tracking-widest transition-all hover:opacity-80"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,45,120,0.2)',
            color: 'rgba(255,140,187,0.5)',
            fontFamily: "'Noto Sans JP', sans-serif",
          }}
        >
          キャンセル
        </button>
        <button
          className="px-6 py-2.5 rounded-xl text-sm font-bold tracking-widest transition-all hover:scale-105 hover:opacity-90"
          style={{
            background: 'linear-gradient(135deg, #ff2d78, #cc0055)',
            color: '#fff',
            fontFamily: "'Cinzel', serif",
            letterSpacing: '0.15em',
            boxShadow: '0 0 20px rgba(255,45,120,0.4)',
          }}
        >
          SAVE
        </button>
      </div>
    </div>
  );
}
