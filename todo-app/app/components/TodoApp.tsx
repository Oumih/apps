'use client'

import { useState, useRef, useEffect } from 'react'

type Todo = {
  id: number
  text: string
  completed: boolean
}

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function addTodo() {
    const text = inputValue.trim()
    if (!text) return
    setTodos((prev) => [...prev, { id: Date.now(), text, completed: false }])
    setInputValue('')
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

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') addTodo()
  }

  const completed = todos.filter((t) => t.completed).length
  const remaining = todos.length - completed
  const progress = todos.length > 0 ? (completed / todos.length) * 100 : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 flex items-center justify-center p-4">
      {/* Background decorative blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-indigo-400/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Main card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">

          {/* Card header — gradient zone */}
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

              {/* Completion counter */}
              {todos.length > 0 && (
                <div className="flex flex-col items-end">
                  <span className="text-5xl font-bold text-white leading-none">{completed}</span>
                  <span className="text-violet-300 text-sm">/ {todos.length} 完了</span>
                </div>
              )}
            </div>

            {/* Progress bar */}
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

          {/* Card body */}
          <div className="px-6 py-6">
            {/* Input */}
            <div className="flex gap-2 mb-5">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="新しいタスクを入力..."
                className="flex-1 bg-slate-50 rounded-2xl px-4 py-3 text-sm text-slate-700 placeholder-slate-400 outline-none border-2 border-transparent focus:border-violet-300 focus:bg-white transition-all duration-200"
              />
              <button
                onClick={addTodo}
                disabled={!inputValue.trim()}
                className="bg-gradient-to-r from-violet-500 to-indigo-500 text-white rounded-2xl px-5 py-3 text-sm font-semibold shadow-lg shadow-violet-200 hover:shadow-xl hover:shadow-violet-300 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none transition-all duration-200"
              >
                追加
              </button>
            </div>

            {/* Empty state */}
            {todos.length === 0 ? (
              <div className="flex flex-col items-center py-14 text-slate-300">
                <svg
                  className="w-14 h-14 mb-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <p className="text-sm font-medium text-slate-400">タスクがまだありません</p>
                <p className="text-xs text-slate-300 mt-1">上の入力欄からタスクを追加しましょう</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {todos.map((todo) => (
                  <li
                    key={todo.id}
                    className={`group flex items-center gap-3 p-4 rounded-2xl border transition-all duration-200 ${
                      todo.completed
                        ? 'bg-slate-50 border-slate-100'
                        : 'bg-white border-slate-100 shadow-sm hover:shadow-md hover:border-violet-100 hover:-translate-y-0.5'
                    }`}
                  >
                    {/* Custom checkbox */}
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
                        <svg
                          className="h-3.5 w-3.5 text-white"
                          viewBox="0 0 12 12"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M2 6l3 3 5-5" />
                        </svg>
                      )}
                    </button>

                    {/* Task text */}
                    <span
                      className={`flex-1 text-sm font-medium transition-all duration-200 ${
                        todo.completed
                          ? 'text-slate-300 line-through'
                          : 'text-slate-700'
                      }`}
                    >
                      {todo.text}
                    </span>

                    {/* Delete button — visible on hover */}
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      aria-label="タスクを削除"
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-xl text-slate-300 hover:bg-red-50 hover:text-red-400 transition-all duration-200"
                    >
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 4h10M6 4V2.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5V4M5 4l.5 8.5h5L11 4" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* Clear completed */}
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

        {/* Hint text */}
        <p className="text-center text-white/30 text-xs mt-5 tracking-wide">
          Enter キーでも追加できます
        </p>
      </div>
    </div>
  )
}
