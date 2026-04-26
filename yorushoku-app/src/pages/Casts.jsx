import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const NEON_PINK = '#ff2d78';
const NEON_GOLD = '#ffe44d';

const fmt = (n) => `¥${n.toLocaleString()}`;

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

// ── モーダル ──────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="rounded-2xl p-7 w-full max-w-md mx-4"
        style={{
          background: 'linear-gradient(135deg, rgba(18,6,30,0.98), rgba(10,4,22,0.98))',
          border: '1px solid rgba(255,45,120,0.3)',
          boxShadow: '0 0 60px rgba(255,45,120,0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-black tracking-widest" style={{ color: '#f0e6c8', fontFamily: "'Cinzel', serif" }}>
            {title}
          </h3>
          <button onClick={onClose} className="text-xl hover:opacity-60" style={{ color: 'rgba(255,140,187,0.5)' }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function InputField({ label, type = 'text', value, onChange, placeholder, required }) {
  return (
    <div className="mb-4">
      <label className="block text-xs mb-1.5 tracking-widest" style={{ color: 'rgba(255,140,187,0.5)', letterSpacing: '0.15em' }}>
        {label}{required && <span style={{ color: NEON_PINK }}> *</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
        style={{
          background: 'rgba(255,45,120,0.05)',
          border: '1px solid rgba(255,45,120,0.2)',
          color: '#f0e6c8',
          fontFamily: "'Noto Sans JP', sans-serif",
        }}
      />
    </div>
  );
}

function TextAreaField({ label, value, onChange, placeholder }) {
  return (
    <div className="mb-4">
      <label className="block text-xs mb-1.5 tracking-widest" style={{ color: 'rgba(255,140,187,0.5)', letterSpacing: '0.15em' }}>
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all resize-none"
        style={{
          background: 'rgba(255,45,120,0.05)',
          border: '1px solid rgba(255,45,120,0.2)',
          color: '#f0e6c8',
          fontFamily: "'Noto Sans JP', sans-serif",
        }}
      />
    </div>
  );
}

function PrimaryButton({ onClick, children, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-6 py-2.5 rounded-xl text-sm font-bold tracking-widest transition-all hover:scale-105 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
      style={{
        background: 'linear-gradient(135deg, #ff2d78, #cc0055)',
        color: '#fff',
        fontFamily: "'Cinzel', serif",
        letterSpacing: '0.15em',
        boxShadow: '0 0 20px rgba(255,45,120,0.4)',
      }}
    >
      {children}
    </button>
  );
}

function GhostButton({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-70"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,45,120,0.2)',
        color: 'rgba(255,140,187,0.5)',
        fontFamily: "'Noto Sans JP', sans-serif",
      }}
    >
      {children}
    </button>
  );
}

// ── キャストタブ ──────────────────────────────────────────────────────
function CastTab() {
  const [casts, setCasts] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: '', kana: '', profile: '', joinedAt: '' });
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchCasts();
  }, [user]);

  const fetchCasts = async () => {
    if (!user) return;
    const { data: profile } = await supabase
      .from('profiles')
      .select('store_id')
      .eq('id', user.id)
      .single();

    if (!profile) return;

    const { data: castsData } = await supabase
      .from('casts')
      .select('*')
      .eq('store_id', profile.store_id)
      .eq('is_active', true)
      .order('created_at');

    // 各キャストの累計売上を計算
    const { data: salesData } = await supabase
      .from('sales')
      .select('cast_id, amount')
      .eq('store_id', profile.store_id);

    const salesMap = {};
    if (salesData) {
      salesData.forEach((sale) => {
        if (!salesMap[sale.cast_id]) salesMap[sale.cast_id] = 0;
        salesMap[sale.cast_id] += sale.amount;
      });
    }

    const castsWithSales = (castsData || []).map((cast) => ({
      ...cast,
      totalSales: salesMap[cast.id] || 0,
    }));

    setCasts(castsWithSales);
  };

  const openAdd = () => {
    setForm({ name: '', kana: '', profile: '', joinedAt: '' });
    setError('');
    setModal({ mode: 'add' });
  };

  const openEdit = (cast) => {
    setForm({ name: cast.name, kana: cast.kana ?? '', profile: cast.profile ?? '', joinedAt: cast.joined_at ?? '' });
    setError('');
    setModal({ mode: 'edit', cast });
  };

  const closeModal = () => setModal(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError('名前を入力してください'); return; }
    if (!user) return;

    setLoading(true);
    const { data: profile } = await supabase
      .from('profiles')
      .select('store_id')
      .eq('id', user.id)
      .single();

    if (!profile) { setError('プロフィール情報が見つかりません'); setLoading(false); return; }

    try {
      if (modal.mode === 'add') {
        const { error: err } = await supabase
          .from('casts')
          .insert({
            store_id: profile.store_id,
            name: form.name,
            kana: form.kana,
            profile: form.profile,
            joined_at: form.joinedAt,
            is_active: true,
          });
        if (err) throw err;
        showToast('キャストを追加しました');
      } else {
        const { error: err } = await supabase
          .from('casts')
          .update({
            name: form.name,
            kana: form.kana,
            profile: form.profile,
            joined_at: form.joinedAt,
          })
          .eq('id', modal.cast.id);
        if (err) throw err;
        showToast('変更を保存しました');
      }
      closeModal();
      fetchCasts();
    } catch (err) {
      setError(err.message || 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleRetire = async (castId) => {
    if (!confirm('このキャストを退店させてもよろしいですか？')) return;

    try {
      const { error } = await supabase
        .from('casts')
        .update({ is_active: false })
        .eq('id', castId);
      if (error) throw error;
      showToast('退店処理を行いました');
      fetchCasts();
    } catch (err) {
      showToast('エラーが発生しました');
    }
  };

  return (
    <>
      <div className="flex justify-end mb-5">
        <PrimaryButton onClick={openAdd}>+ キャストを追加</PrimaryButton>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,45,120,0.15)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'rgba(255,45,120,0.08)' }}>
              {['名前', '読み仮名', '入店日', '累計売上', ''].map((h) => (
                <th key={h} className="text-left px-5 py-3 font-semibold" style={{ color: 'rgba(255,140,187,0.6)', fontSize: '11px', letterSpacing: '0.15em' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {casts.map((cast) => (
              <tr key={cast.id} style={{ borderTop: '1px solid rgba(255,45,120,0.06)' }}>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: 'rgba(255,45,120,0.12)', border: '1px solid rgba(255,45,120,0.3)', color: NEON_PINK }}
                    >
                      {cast.name[0]}
                    </div>
                    <span style={{ color: '#f0e6c8', fontFamily: "'Noto Sans JP', sans-serif" }}>{cast.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4" style={{ color: 'rgba(255,140,187,0.5)' }}>{cast.kana || '—'}</td>
                <td className="px-5 py-4" style={{ color: 'rgba(240,220,230,0.6)' }}>{cast.joined_at || '—'}</td>
                <td className="px-5 py-4 font-bold" style={{ color: NEON_GOLD, fontFamily: "'Cinzel', serif" }}>
                  {fmt(cast.totalSales)}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={() => openEdit(cast)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
                      style={{ background: 'rgba(255,45,120,0.1)', border: '1px solid rgba(255,45,120,0.25)', color: '#ff8cbb' }}
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleRetire(cast.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
                      style={{ background: 'rgba(100,100,120,0.1)', border: '1px solid rgba(150,150,180,0.2)', color: 'rgba(200,180,220,0.4)' }}
                    >
                      退店
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {casts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-sm" style={{ color: 'rgba(255,140,187,0.25)' }}>
                  在籍キャストはいません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title={modal.mode === 'add' ? 'キャストを追加' : 'キャストを編集'} onClose={closeModal}>
          <InputField label="名前（源氏名）" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="蒼月 雪人" required />
          <InputField label="読み仮名" value={form.kana} onChange={(v) => setForm({ ...form, kana: v })} placeholder="そうつき せつと" />
          <TextAreaField label="プロフィール" value={form.profile} onChange={(v) => setForm({ ...form, profile: v })} placeholder="自己紹介など" />
          <InputField label="入店日" type="date" value={form.joinedAt} onChange={(v) => setForm({ ...form, joinedAt: v })} />
          {error && <p className="text-xs mb-4" style={{ color: NEON_PINK }}>{error}</p>}
          <div className="flex justify-end gap-3 mt-2">
            <GhostButton onClick={closeModal}>キャンセル</GhostButton>
            <PrimaryButton onClick={handleSave} disabled={loading}>保存</PrimaryButton>
          </div>
        </Modal>
      )}

      {toast && (
        <div
          className="fixed bottom-6 right-6 px-5 py-3 rounded-xl text-sm font-semibold z-50"
          style={{
            background: 'rgba(15,5,30,0.95)',
            border: '1px solid rgba(255,45,120,0.4)',
            color: '#ff8cbb',
            boxShadow: '0 0 20px rgba(255,45,120,0.2)',
          }}
        >
          {toast}
        </div>
      )}
    </>
  );
}

// ── Adminタブ ─────────────────────────────────────────────────────────
function AdminTab() {
  const [admins, setAdmins] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchAdmins();
  }, [user]);

  const fetchAdmins = async () => {
    if (!user) return;
    const { data: profile } = await supabase
      .from('profiles')
      .select('store_id')
      .eq('id', user.id)
      .single();

    if (!profile) return;

    const { data } = await supabase
      .from('profiles')
      .select('id, name, email:id')
      .eq('store_id', profile.store_id)
      .eq('role', 'admin');

    // Note: email は auth.users から取得する必要があるため、ここでは簡略化
    setAdmins(data || []);
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const handleDelete = async (profileId) => {
    if (!confirm('このAdminを削除しますか？')) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', profileId);
      if (error) throw error;
      showToast('Adminを削除しました');
      fetchAdmins();
    } catch (err) {
      showToast('エラーが発生しました');
    }
  };

  return (
    <>
      <div className="flex justify-end mb-5">
        <PrimaryButton onClick={() => { setForm({ name: '', email: '', password: '' }); setErrors({}); setShowModal(true); }}>
          + Adminを追加
        </PrimaryButton>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,45,120,0.15)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'rgba(255,45,120,0.08)' }}>
              {['名前', 'メールアドレス', ''].map((h) => (
                <th key={h} className="text-left px-5 py-3 font-semibold" style={{ color: 'rgba(255,140,187,0.6)', fontSize: '11px', letterSpacing: '0.15em' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin.id} style={{ borderTop: '1px solid rgba(255,45,120,0.06)' }}>
                <td className="px-5 py-4" style={{ color: '#f0e6c8' }}>{admin.name}</td>
                <td className="px-5 py-4" style={{ color: 'rgba(255,140,187,0.5)' }}>—</td>
                <td className="px-5 py-4 text-right">
                  <button
                    onClick={() => handleDelete(admin.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
                    style={{ background: 'rgba(200,50,80,0.1)', border: '1px solid rgba(200,50,80,0.25)', color: '#ff6688' }}
                  >
                    削除
                  </button>
                </td>
              </tr>
            ))}
            {admins.length === 0 && (
              <tr>
                <td colSpan={3} className="px-5 py-10 text-center text-sm" style={{ color: 'rgba(255,140,187,0.25)' }}>
                  Adminユーザーはいません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal title="Adminを追加" onClose={() => setShowModal(false)}>
          <InputField label="名前" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="田中 マネージャー" required />
          <InputField label="メールアドレス" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="admin@example.com" required />
          <InputField label="パスワード" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} placeholder="8文字以上" required />
          <div className="flex justify-end gap-3 mt-2">
            <GhostButton onClick={() => setShowModal(false)}>キャンセル</GhostButton>
            <PrimaryButton onClick={() => showToast('Supabase Auth との連携が必要です')}>追加</PrimaryButton>
          </div>
        </Modal>
      )}

      {toast && (
        <div
          className="fixed bottom-6 right-6 px-5 py-3 rounded-xl text-sm font-semibold z-50"
          style={{
            background: 'rgba(15,5,30,0.95)',
            border: '1px solid rgba(255,45,120,0.4)',
            color: '#ff8cbb',
            boxShadow: '0 0 20px rgba(255,45,120,0.2)',
          }}
        >
          {toast}
        </div>
      )}
    </>
  );
}

// ── メインコンポーネント ───────────────────────────────────────────────
const TABS = [
  { key: 'cast', label: 'キャスト' },
  { key: 'admin', label: 'Admin' },
];

export default function Casts() {
  const [tab, setTab] = useState('cast');

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
          Cast & Admin
        </h1>
        <p className="text-xs tracking-widest" style={{ color: 'rgba(255,140,187,0.5)', letterSpacing: '0.2em' }}>
          キャスト・管理者アカウントを管理します
        </p>
      </div>

      {/* タブ */}
      <div className="flex gap-2 mb-6">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="px-6 py-2.5 rounded-xl text-sm font-bold tracking-widest transition-all"
            style={{
              background: tab === t.key
                ? 'linear-gradient(135deg, rgba(255,45,120,0.25), rgba(255,45,120,0.1))'
                : 'rgba(255,255,255,0.03)',
              border: `1px solid ${tab === t.key ? 'rgba(255,45,120,0.6)' : 'rgba(255,45,120,0.1)'}`,
              color: tab === t.key ? '#ff8cbb' : 'rgba(240,200,220,0.35)',
              boxShadow: tab === t.key ? '0 0 15px rgba(255,45,120,0.2)' : 'none',
              fontFamily: "'Noto Sans JP', sans-serif",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'cast' ? <CastTab /> : <AdminTab />}
    </div>
  );
}
