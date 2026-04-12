'use client'

import { useState, useRef, useEffect } from 'react'

type Todo = {
  id: number
  text: string
  completed: boolean
  deadline: string | null // "YYYY-MM-DD"
}

type DeadlineStatus = 'overdue' | 'today' | 'soon' | 'future'

function getDeadlineStatus(dateStr: string): DeadlineStatus {
  const date = new Date(dateStr + 'T00:00:00')
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const diff = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (diff < 0) return 'overdue'
  if (diff === 0) return 'today'
  if (diff <= 3) return 'soon'
  return 'future'
}

function formatDeadline(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

const deadlineBadgeStyle: Record<DeadlineStatus, string> = {
  overdue: 'bg-red-50 border-red-200 text-red-500',
  today:   'bg-amber-50 border-amber-200 text-amber-600',
  soon:    'bg-blue-50 border-blue-200 text-blue-500',
  future:  'bg-slate-50 border-slate-200 text-slate-500',
}

const deadlineLabel: Record<DeadlineStatus, string> = {
  overdue: '期限切れ',
  today:   '今日まで',
  soon:    'もうすぐ',
  future:  '',
}

// カレンダーアイコン SVG
function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )
}

function openDatePicker(el: HTMLInputElement | null) {
  if (!el) return
  try {
    // showPicker() は Chrome99+, Firefox101+, Safari16+ で利用可能
    el.showPicker()
  } catch {
    el.click()
  }
}

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [inputValue, setInputValue] = useState('')
  const [newDeadline, setNewDeadline] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const newDateRef = useRef<HTMLInputElement>(null)
  const todoDateRefs = useRef<Record<number, HTMLInputElement | null>>({})

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function addTodo() {
    const text = inputValue.trim()
    if (!text) return
    setTodos((prev) => [
      ...prev,
      { id: Date.now(), text, completed: false, deadline: newDeadline || null },
    ])
    setInputValue('')
    setNewDeadline('')
    inputRef.current?.focus()
  }

  function toggleTodo(id: number) {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    )
  }

  function deleteTodo(id: number) {
    setTodos((prev) => prev.filter((t) => t.id !== id))
  }

  function updateDeadline(id: number, value: string) {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, deadline: value || null } : t))
    )
  }

  function removeDeadline(id: number) {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, deadline: null } : t)))
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') addTodo()
  }

  const completed = todos.filter((t) => t.completed).length
  const remaining = todos.length - completed
  const progress = todos.length > 0 ? (completed / todos.length) * 100 : 0
  const todayStr = new Date().toISOString().split('T')[0]

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 flex items-center justify-center p-4">
      {/* 背景の装飾 blob */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-indigo-400/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* メインカード */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">

          {/* ヘッダー */}
          <div className="bg-gradient-to-br from-violet-500 to-indigo-600 px-8 pt-8 pb-7">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-violet-200 text-xs font-semibold uppercase tracking-widest mb-1">My Tasks</p>
                <h1 className="text-4xl font-bold text-white leading-none">ToDo</h1>
                <p className="text-violet-200 text-sm mt-2">
                  {todos.length === 0
                    ? 'タスクを追加してみましょう'
                    : remaining === 0
                    ? '🎉 全て完了しました！'
                    : `あと ${remaining} 件残っています`}
                </p>
              </div>
              {todos.length > 0 && (
                <div className="flex flex-col items-end">
                  <span className="text-5xl font-bold text-white leading-none">{completed}</span>
                  <span className="text-violet-300 text-sm">/ {todos.length} 完了</span>
                </div>
              )}
            </div>

            {/* 進捗バー */}
            {todos.length > 0 && (
              <div className="mt-6">
                <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-violet-300 text-xs mt-1.5 text-right">{Math.round(progress)}% 完了</p>
              </div>
            )}
          </div>

          {/* ボディ */}
          <div className="px-6 py-6">

            {/* 入力エリア */}
            <div className="mb-5">
              <div className="flex gap-2">
                {/* テキスト入力 + カレンダーアイコン */}
                <div className="relative flex-1">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="新しいタスクを入力..."
                    className="w-full bg-slate-50 rounded-2xl pl-4 pr-11 py-3 text-sm text-slate-700 placeholder-slate-400 outline-none border-2 border-transparent focus:border-violet-300 focus:bg-white transition-all duration-200"
                  />
                  {/* カレンダーアイコンボタン */}
                  <button
                    type="button"
                    onClick={() => openDatePicker(newDateRef.current)}
                    aria-label="期限を設定"
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors ${
                      newDeadline
                        ? 'text-violet-500'
                        : 'text-slate-300 hover:text-violet-400'
                    }`}
                  >
                    <CalendarIcon className="h-5 w-5" />
                  </button>
                  {/* 非表示の date input */}
                  <input
                    ref={newDateRef}
                    type="date"
                    min={todayStr}
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="absolute opacity-0 pointer-events-none w-0 h-0 bottom-0 right-10"
                    tabIndex={-1}
                  />
                </div>
                {/* 追加ボタン */}
                <button
                  onClick={addTodo}
                  disabled={!inputValue.trim()}
                  className="bg-gradient-to-r from-violet-500 to-indigo-500 text-white rounded-2xl px-5 py-3 text-sm font-semibold shadow-lg shadow-violet-200 hover:shadow-xl hover:shadow-violet-300 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none transition-all duration-200"
                >
                  追加
                </button>
              </div>

              {/* 選択中の期限バッジ */}
              {newDeadline && (
                <div className="flex items-center gap-1.5 mt-2 ml-1">
                  <span className="text-xs text-slate-400">期限:</span>
                  <span className="inline-flex items-center gap-1 bg-violet-50 border border-violet-200 text-violet-600 text-xs font-medium px-2.5 py-1 rounded-full">
                    <CalendarIcon className="h-3 w-3" />
                    {formatDeadline(newDeadline)}
                    <button
                      onClick={() => setNewDeadline('')}
                      aria-label="期限を外す"
                      className="ml-0.5 hover:text-violet-800 transition-colors"
                    >
                      <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M2 2l8 8M10 2l-8 8" />
                      </svg>
                    </button>
                  </span>
                </div>
              )}
            </div>

            {/* タスクリスト */}
            {todos.length === 0 ? (
              <div className="flex flex-col items-center py-14 text-slate-300">
                <svg className="w-14 h-14 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-sm font-medium text-slate-400">タスクがまだありません</p>
                <p className="text-xs text-slate-300 mt-1">上の入力欄からタスクを追加しましょう</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {todos.map((todo) => {
                  const status = todo.deadline ? getDeadlineStatus(todo.deadline) : null
                  return (
                    <li
                      key={todo.id}
                      className={`group flex flex-col gap-2 p-4 rounded-2xl border transition-all duration-200 ${
                        todo.completed
                          ? 'bg-slate-50 border-slate-100'
                          : 'bg-white border-slate-100 shadow-sm hover:shadow-md hover:border-violet-100 hover:-translate-y-0.5'
                      }`}
                    >
                      {/* メイン行 */}
                      <div className="flex items-center gap-3">
                        {/* チェックボックス */}
                        <button
                          onClick={() => toggleTodo(todo.id)}
                          aria-label={todo.completed ? '未完了に戻す' : '完了にする'}
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-all duration-200 ${
                            todo.completed
                              ? 'bg-gradient-to-br from-violet-500 to-indigo-500 shadow-sm shadow-violet-200'
                              : 'border-2 border-slate-200 hover:border-violet-400 hover:bg-violet-50'
                          }`}
                        >
                          {todo.completed && (
                            <svg className="h-3.5 w-3.5 text-white" viewBox="0 0 12 12" fill="none"
                              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M2 6l3 3 5-5" />
                            </svg>
                          )}
                        </button>

                        {/* テキスト */}
                        <span className={`flex-1 text-sm font-medium transition-all duration-200 ${
                          todo.completed ? 'text-slate-300 line-through' : 'text-slate-700'
                        }`}>
                          {todo.text}
                        </span>

                        {/* 削除ボタン（ホバー時のみ表示） */}
                        <button
                          onClick={() => deleteTodo(todo.id)}
                          aria-label="タスクを削除"
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-xl text-slate-300 hover:bg-red-50 hover:text-red-400 transition-all duration-200"
                        >
                          <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor"
                            strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 4h10M6 4V2.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5V4M5 4l.5 8.5h5L11 4" />
                          </svg>
                        </button>
                      </div>

                      {/* 期限行 */}
                      <div className="pl-9 flex items-center gap-1.5">
                        {todo.deadline && status ? (
                          <>
                            {/* 期限バッジ */}
                            <span className={`inline-flex items-center gap-1 border text-xs font-medium px-2.5 py-1 rounded-full ${deadlineBadgeStyle[status]}`}>
                              <CalendarIcon className="h-3 w-3" />
                              {formatDeadline(todo.deadline)}
                              {deadlineLabel[status] && (
                                <span className="opacity-70">・{deadlineLabel[status]}</span>
                              )}
                            </span>
                            {/* 期限変更ボタン */}
                            {!todo.completed && (
                              <div className="relative opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <button
                                  onClick={() => openDatePicker(todoDateRefs.current[todo.id])}
                                  aria-label="期限を変更"
                                  className="p-1 rounded-lg text-slate-300 hover:text-violet-500 hover:bg-violet-50 transition-colors"
                                >
                                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                  </svg>
                                </button>
                                <input
                                  type="date"
                                  defaultValue={todo.deadline}
                                  onChange={(e) => updateDeadline(todo.id, e.target.value)}
                                  ref={(el) => { todoDateRefs.current[todo.id] = el }}
                                  className="absolute opacity-0 pointer-events-none w-0 h-0"
                                  tabIndex={-1}
                                />
                              </div>
                            )}
                            {/* 期限削除ボタン */}
                            {!todo.completed && (
                              <button
                                onClick={() => removeDeadline(todo.id)}
                                aria-label="期限を削除"
                                className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-50 transition-all duration-200"
                              >
                                <svg className="h-3.5 w-3.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                  <path d="M2 2l8 8M10 2l-8 8" />
                                </svg>
                              </button>
                            )}
                          </>
                        ) : (
                          /* 期限未設定 & 未完了: ホバー時に「期限を設定」を表示 */
                          !todo.completed && (
                            <div className="relative opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <button
                                onClick={() => openDatePicker(todoDateRefs.current[todo.id])}
                                aria-label="期限を設定"
                                className="inline-flex items-center gap-1 text-xs text-slate-300 hover:text-violet-400 transition-colors"
                              >
                                <CalendarIcon className="h-3.5 w-3.5" />
                                期限を設定
                              </button>
                              <input
                                type="date"
                                min={todayStr}
                                onChange={(e) => updateDeadline(todo.id, e.target.value)}
                                ref={(el) => { todoDateRefs.current[todo.id] = el }}
                                className="absolute opacity-0 pointer-events-none w-0 h-0"
                                tabIndex={-1}
                              />
                            </div>
                          )
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}

            {/* 完了済み一括削除 */}
            {todos.some((t) => t.completed) && (
              <button
                onClick={() => setTodos((prev) => prev.filter((t) => !t.completed))}
                className="mt-4 w-full py-2.5 rounded-2xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-50 transition-all duration-200"
              >
                完了済みをすべて削除
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-white/30 text-xs mt-5 tracking-wide">
          Enter キーでも追加できます
        </p>
      </div>
    </div>
  )
}
