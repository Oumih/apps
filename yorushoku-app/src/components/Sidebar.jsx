import { NavLink, useNavigate } from 'react-router-dom';
import { store } from '../data/mockData';

const navItems = [
  { to: '/dashboard', icon: '🏠', label: 'ダッシュボード' },
  { to: '/sales', icon: '💴', label: '売上管理' },
  { to: '/casts', icon: '✨', label: 'キャスト管理' },
  { to: '/customers', icon: '👑', label: '顧客管理' },
  { to: '/store', icon: '🏯', label: '店舗管理' },
];

export default function Sidebar() {
  const navigate = useNavigate();

  return (
    <aside
      className="fixed left-0 top-0 h-full w-56 flex flex-col py-6"
      style={{
        background: 'linear-gradient(180deg, rgba(8,4,20,0.98) 0%, rgba(12,4,25,0.98) 100%)',
        borderRight: '1px solid rgba(255,45,120,0.2)',
        boxShadow: '4px 0 30px rgba(255,45,120,0.08)',
        backdropFilter: 'blur(20px)',
        zIndex: 50,
      }}
    >
      {/* 右端のネオンライン */}
      <div className="absolute top-0 right-0 bottom-0 w-px" style={{ background: 'linear-gradient(180deg, transparent, rgba(255,45,120,0.6), rgba(255,228,77,0.4), rgba(0,180,255,0.4), transparent)' }} />

      {/* ロゴ */}
      <div className="px-6 mb-8">
        <div className="flex items-center gap-3">
          <span className="text-2xl" style={{ filter: 'drop-shadow(0 0 8px #ff2d78)' }}>🌙</span>
          <div>
            <p
              className="text-lg font-black tracking-widest"
              style={{
                fontFamily: "'Cinzel', serif",
                background: 'linear-gradient(135deg, #ffe44d, #ff8c00)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 6px rgba(255,228,77,0.6))',
              }}
            >
              Princess Time
            </p>
            <p className="text-xs" style={{ color: 'rgba(255,140,187,0.6)', letterSpacing: '0.1em' }}>{store.name}</p>
          </div>
        </div>
        {/* 区切りライン */}
        <div className="mt-4 h-px" style={{ background: 'linear-gradient(90deg, rgba(255,45,120,0.5), transparent)' }} />
      </div>

      {/* ナビゲーション */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all relative group"
            style={({ isActive }) => ({
              background: isActive
                ? 'linear-gradient(135deg, rgba(255,45,120,0.2), rgba(255,45,120,0.05))'
                : 'transparent',
              color: isActive ? '#ff8cbb' : 'rgba(240,200,220,0.45)',
              borderLeft: isActive ? '2px solid #ff2d78' : '2px solid transparent',
              boxShadow: isActive ? 'inset 0 0 20px rgba(255,45,120,0.08)' : 'none',
              textShadow: isActive ? '0 0 10px rgba(255,45,120,0.5)' : 'none',
            })}
          >
            <span className="text-base">{item.icon}</span>
            <span style={{ fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 500 }}>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* ログアウト */}
      <div className="px-3 mt-4">
        <div className="h-px mb-4" style={{ background: 'linear-gradient(90deg, rgba(255,45,120,0.3), transparent)' }} />
        <button
          onClick={() => navigate('/')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all hover:opacity-80"
          style={{ color: 'rgba(255,140,187,0.3)', fontFamily: "'Noto Sans JP', sans-serif" }}
        >
          <span>🚪</span>
          <span>ログアウト</span>
        </button>
      </div>
    </aside>
  );
}
