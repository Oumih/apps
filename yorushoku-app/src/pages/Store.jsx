import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const NEON_GOLD = '#ffe44d';

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start gap-4 py-4" style={{ borderBottom: '1px solid rgba(255,45,120,0.07)' }}>
      <span className="text-xs w-28 flex-shrink-0 tracking-widest" style={{ color: 'rgba(255,140,187,0.45)', letterSpacing: '0.15em', paddingTop: '2px' }}>
        {label}
      </span>
      <span className="text-sm font-medium" style={{ color: value ? '#f0e6c8' : 'rgba(255,140,187,0.25)' }}>
        {value || '未設定'}
      </span>
    </div>
  );
}

export default function Store() {
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchStore = async () => {
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('store_id')
        .eq('id', user.id)
        .single();

      if (!profile) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('stores')
        .select('*')
        .eq('id', profile.store_id)
        .single();

      setStore(data);
      setLoading(false);
    };

    fetchStore();
  }, [user]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black mb-1" style={{ fontFamily: "'Playfair Display', serif", color: '#fff' }}>
            Store
          </h1>
        </div>
        <p style={{ color: 'rgba(255,140,187,0.3)' }}>読み込み中...</p>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-black mb-1" style={{ fontFamily: "'Playfair Display', serif", color: '#fff' }}>
          Store
        </h1>
        <p style={{ color: 'rgba(255,140,187,0.3)' }}>店舗情報が見つかりません</p>
      </div>
    );
  }

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
          店舗の基本情報
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
          <InfoRow label="営業時間" value={store.open_time && store.close_time ? `${store.open_time} 〜 ${store.close_time}` : null} />
        </div>
      </div>

      {/* 注記 */}
      <p className="text-xs text-center" style={{ color: 'rgba(255,140,187,0.3)', letterSpacing: '0.1em' }}>
        店舗情報の変更が必要な場合は、アプリ管理者にご連絡ください
      </p>
    </div>
  );
}
