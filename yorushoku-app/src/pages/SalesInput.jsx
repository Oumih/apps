import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const NEON_PINK = '#ff2d78';
const NEON_GOLD = '#ffe44d';

function InputRow({ row, index, onUpdate, onRemove, showRemove, casts }) {
  return (
    <div
      className="flex items-center gap-3 p-4 rounded-xl"
      style={{
        background: 'rgba(255,45,120,0.04)',
        border: '1px solid rgba(255,45,120,0.12)',
      }}
    >
      {/* キャスト選択 */}
      <div className="flex-1">
        <select
          value={row.castId}
          onChange={(e) => onUpdate(index, 'castId', e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl text-sm outline-none appearance-none"
          style={{
            background: 'rgba(10,4,22,0.8)',
            border: `1px solid ${row.castId ? 'rgba(255,45,120,0.3)' : 'rgba(255,45,120,0.15)'}`,
            color: row.castId ? '#f0e6c8' : 'rgba(255,140,187,0.3)',
            fontFamily: "'Noto Sans JP', sans-serif",
          }}
        >
          <option value="">キャストを選択</option>
          {casts.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* 金額入力 */}
      <div className="flex items-center gap-2 w-48">
        <span className="text-sm font-bold flex-shrink-0" style={{ color: 'rgba(255,228,77,0.5)' }}>¥</span>
        <input
          type="number"
          value={row.amount}
          onChange={(e) => onUpdate(index, 'amount', e.target.value)}
          placeholder="0"
          min="1"
          className="flex-1 px-3 py-2.5 rounded-xl text-sm outline-none"
          style={{
            background: 'rgba(10,4,22,0.8)',
            border: `1px solid ${row.amount ? 'rgba(255,228,77,0.3)' : 'rgba(255,45,120,0.15)'}`,
            color: NEON_GOLD,
            fontFamily: "'Cinzel', serif",
          }}
        />
        <style>{`
          input[type="number"]::-webkit-outer-spin-button,
          input[type="number"]::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          input[type="number"] {
            -moz-appearance: textfield;
          }
        `}</style>
      </div>

      {/* 削除ボタン */}
      {showRemove && (
        <button
          onClick={() => onRemove(index)}
          className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0 transition-all hover:opacity-70"
          style={{ background: 'rgba(200,50,80,0.1)', border: '1px solid rgba(200,50,80,0.2)', color: '#ff6688' }}
        >
          ✕
        </button>
      )}
    </div>
  );
}

export default function SalesInput() {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [rows, setRows] = useState([{ castId: '', amount: '' }]);
  const [memo, setMemo] = useState('');
  const [errors, setErrors] = useState([]);
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(false);
  const [casts, setCasts] = useState([]);
  const { user } = useAuth();

  // Supabase からキャストを取得
  useEffect(() => {
    const fetchCasts = async () => {
      if (!user) return;
      const { data: profile } = await supabase
        .from('profiles')
        .select('store_id')
        .eq('id', user.id)
        .single();

      if (!profile) return;

      const { data } = await supabase
        .from('casts')
        .select('id, name')
        .eq('store_id', profile.store_id)
        .eq('is_active', true)
        .order('created_at');

      setCasts(data || []);
    };

    fetchCasts();
  }, [user]);

  const addRow = () => setRows([...rows, { castId: '', amount: '' }]);

  const updateRow = (index, field, value) => {
    setRows(rows.map((r, i) => i === index ? { ...r, [field]: value } : r));
  };

  const removeRow = (index) => setRows(rows.filter((_, i) => i !== index));

  const validate = () => {
    const errs = [];
    if (rows.length === 0) { errs.push('1件以上入力してください'); return errs; }

    rows.forEach((row, i) => {
      if (!row.castId) errs.push(`行${i + 1}: キャストを選択してください`);
      if (!row.amount) errs.push(`行${i + 1}: 金額を入力してください`);
      else if (Number(row.amount) <= 0) errs.push(`行${i + 1}: 0より大きい金額を入力してください`);
    });

    const castIds = rows.map((r) => r.castId).filter(Boolean);
    const hasDup = castIds.length !== new Set(castIds).size;
    if (hasDup) errs.push('同じキャストが重複しています');

    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (errs.length) { setErrors(errs); return; }

    setLoading(true);
    setErrors([]);

    try {
      // ユーザーのプロフィールから store_id を取得
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('store_id')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        setErrors(['プロフィール情報が見つかりません']);
        setLoading(false);
        return;
      }

      // 各行を sales テーブルに insert
      const salesData = rows.map((row) => ({
        store_id: profile.store_id,
        cast_id: row.castId,
        amount: Number(row.amount),
        date,
        note: memo || null,
      }));

      const { error: insertError } = await supabase
        .from('sales')
        .insert(salesData);

      if (insertError) {
        setErrors([insertError.message || '保存に失敗しました']);
      } else {
        // 成功
        setRows([{ castId: '', amount: '' }]);
        setMemo('');
        setToast('登録しました');
        setTimeout(() => setToast(''), 2500);
      }
    } catch (err) {
      setErrors([err.message || '予期しないエラーが発生しました']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* ヘッダー */}
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
          Sales Input
        </h1>
        <p className="text-xs tracking-widest" style={{ color: 'rgba(255,140,187,0.5)', letterSpacing: '0.2em' }}>
          キャストの売上をまとめて登録します
        </p>
      </div>

      <div
        className="rounded-2xl p-7"
        style={{
          background: 'linear-gradient(135deg, rgba(15,5,25,0.9), rgba(8,4,18,0.9))',
          border: '1px solid rgba(255,45,120,0.2)',
          boxShadow: '0 0 40px rgba(255,45,120,0.06)',
        }}
      >
        {/* 日付 */}
        <div className="mb-6">
          <label className="block text-xs mb-2 tracking-widest" style={{ color: 'rgba(255,140,187,0.5)', letterSpacing: '0.15em' }}>
            日付
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl text-sm outline-none"
            style={{
              background: 'rgba(255,45,120,0.05)',
              border: '1px solid rgba(255,45,120,0.2)',
              color: '#f0e6c8',
              fontFamily: "'Noto Sans JP', sans-serif",
            }}
          />
        </div>

        {/* 入力行 */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs tracking-widest" style={{ color: 'rgba(255,140,187,0.5)', letterSpacing: '0.15em' }}>
              売上入力
            </label>
            <div className="flex gap-2 text-xs" style={{ color: 'rgba(255,140,187,0.3)' }}>
              <span className="w-32 text-center">キャスト</span>
              <span className="w-36 text-center">金額</span>
            </div>
          </div>
          <div className="space-y-2">
            {rows.map((row, i) => (
              <InputRow
                key={i}
                row={row}
                index={i}
                onUpdate={updateRow}
                onRemove={removeRow}
                showRemove={rows.length > 1}
                casts={casts}
              />
            ))}
          </div>
        </div>

        {/* 行追加 */}
        <button
          onClick={addRow}
          disabled={loading}
          className="w-full py-2.5 rounded-xl text-sm font-semibold mb-6 transition-all hover:opacity-70 disabled:opacity-50"
          style={{
            background: 'transparent',
            border: '1px dashed rgba(255,45,120,0.25)',
            color: 'rgba(255,140,187,0.4)',
            fontFamily: "'Noto Sans JP', sans-serif",
          }}
        >
          + 行を追加
        </button>

        {/* メモ */}
        <div className="mb-6">
          <label className="block text-xs mb-2 tracking-widest" style={{ color: 'rgba(255,140,187,0.5)', letterSpacing: '0.15em' }}>
            メモ（任意）
          </label>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            disabled={loading}
            placeholder="セッション全体へのメモ"
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none"
            style={{
              background: 'rgba(255,45,120,0.05)',
              border: '1px solid rgba(255,45,120,0.15)',
              color: '#f0e6c8',
              fontFamily: "'Noto Sans JP', sans-serif",
            }}
          />
        </div>

        {/* エラー */}
        {errors.length > 0 && (
          <div
            className="rounded-xl px-4 py-3 mb-5 space-y-1"
            style={{ background: 'rgba(255,45,120,0.08)', border: '1px solid rgba(255,45,120,0.3)' }}
          >
            {errors.map((e, i) => (
              <p key={i} className="text-xs" style={{ color: NEON_PINK }}>{e}</p>
            ))}
          </div>
        )}

        {/* 登録ボタン */}
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-8 py-3 rounded-xl text-sm font-black tracking-widest transition-all hover:scale-105 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, #ff2d78, #cc0055)',
              color: '#fff',
              fontFamily: "'Cinzel', serif",
              letterSpacing: '0.2em',
              boxShadow: '0 0 25px rgba(255,45,120,0.5)',
            }}
          >
            {loading ? 'REGISTERING...' : 'REGISTER'}
          </button>
        </div>
      </div>

      {/* トースト */}
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
    </div>
  );
}
