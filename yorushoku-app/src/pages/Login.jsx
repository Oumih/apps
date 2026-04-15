import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const err = await login(email, password);
    if (err) {
      setError(err.message || 'ログインに失敗しました');
    } else {
      navigate('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">

      {/* 背景画像（ぼかし） */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(/kabukicho.jpg)',
          filter: 'blur(3px) brightness(0.35) saturate(1.2)',
          transform: 'scale(1.05)',
        }}
      />

      {/* 背景グラデーションオーバーレイ */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(160deg, rgba(120,0,60,0.55) 0%, rgba(5,5,20,0.7) 40%, rgba(0,30,80,0.55) 100%)',
        }}
      />

      {/* ネオンライン装飾（上下） */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #ff2d78, #ffe44d, #ff2d78, transparent)' }} />
      <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #00b4ff, #ff2d78, #00b4ff, transparent)' }} />

      {/* コンテンツ */}
      <div className="relative z-10 w-full max-w-sm px-6">

        {/* ロゴ */}
        <div className="text-center mb-10">
          <div className="mb-3" style={{ fontSize: '52px', filter: 'drop-shadow(0 0 20px #ff2d78) drop-shadow(0 0 40px #ff88bb)' }}>
            🌙
          </div>
          <h1
            className="text-5xl font-black mb-1 tracking-widest"
            style={{
              fontFamily: "'Cinzel', serif",
              background: 'linear-gradient(135deg, #ffe44d, #ffbb00, #ff8c00)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: 'none',
              filter: 'drop-shadow(0 0 12px rgba(255,228,77,0.8))',
            }}
          >
            Princess Time
          </h1>
          <p
            className="text-xs tracking-[0.35em] font-medium"
            style={{
              fontFamily: "'Cinzel', serif",
              color: '#ff8cbb',
              textShadow: '0 0 10px rgba(255,100,150,0.8)',
            }}
          >
            HOST CLUB MANAGEMENT
          </p>
        </div>

        {/* フォームカード */}
        <div
          className="rounded-2xl px-8 py-8"
          style={{
            background: 'rgba(5,5,18,0.82)',
            border: '1px solid rgba(255,45,120,0.4)',
            boxShadow: '0 0 40px rgba(255,45,120,0.15), 0 0 80px rgba(0,100,255,0.08), inset 0 1px 0 rgba(255,228,77,0.1)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* カード上部のネオンライン */}
          <div className="absolute left-8 right-8 top-0 h-px rounded-full" style={{ background: 'linear-gradient(90deg, transparent, #ffe44d, transparent)' }} />

          <h2
            className="text-center text-sm font-semibold mb-7 tracking-widest"
            style={{
              color: '#ffd0e8',
              letterSpacing: '0.25em',
            }}
          >
            STORE LOGIN
          </h2>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label
                className="block text-xs mb-2 tracking-widest"
                style={{ color: '#ff8cbb', letterSpacing: '0.2em' }}
              >
                EMAIL
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@example.com"
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,45,120,0.35)',
                  color: '#fff',
                  fontFamily: "'Noto Sans JP', sans-serif",
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#ff2d78';
                  e.target.style.boxShadow = '0 0 12px rgba(255,45,120,0.4), inset 0 1px 0 rgba(255,255,255,0.05)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255,45,120,0.35)';
                  e.target.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.05)';
                }}
              />
            </div>

            <div>
              <label
                className="block text-xs mb-2 tracking-widest"
                style={{ color: '#ff8cbb', letterSpacing: '0.2em' }}
              >
                PASSWORD
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,45,120,0.35)',
                  color: '#fff',
                  fontFamily: "'Noto Sans JP', sans-serif",
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#ff2d78';
                  e.target.style.boxShadow = '0 0 12px rgba(255,45,120,0.4), inset 0 1px 0 rgba(255,255,255,0.05)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255,45,120,0.35)';
                  e.target.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.05)';
                }}
              />
            </div>

            {error && (
              <p
                className="text-xs text-center py-2 rounded-lg"
                style={{ color: '#ff6080', background: 'rgba(255,60,80,0.1)', border: '1px solid rgba(255,60,80,0.25)' }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-sm tracking-widest transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #ff2d78, #cc0055)',
                color: '#fff',
                letterSpacing: '0.2em',
                fontFamily: "'Cinzel', serif",
                boxShadow: '0 0 20px rgba(255,45,120,0.5), 0 4px 15px rgba(0,0,0,0.3)',
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.boxShadow = '0 0 30px rgba(255,45,120,0.7), 0 4px 20px rgba(0,0,0,0.4)';
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.boxShadow = '0 0 20px rgba(255,45,120,0.5), 0 4px 15px rgba(0,0,0,0.3)';
              }}
            >
              {loading ? 'ログイン中...' : 'LOGIN'}
            </button>
          </form>

          <p
            className="text-xs text-center mt-6 py-2 px-4 rounded-lg"
            style={{
              color: 'rgba(255,200,220,0.5)',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            Supabaseで認証します
          </p>
        </div>
      </div>
    </div>
  );
}
