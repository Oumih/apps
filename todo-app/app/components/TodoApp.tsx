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
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    )
  }

  function deleteTodo(id: number) {
    setTodos((prev) => prev.filter((todo) => todo.id !== id))
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') addTodo()
  }

  const remaining = todos.filter((t) => !t.completed).length

  return (
    <div className="min-h-screen bg-slate-100 flex items-start justify-center pt-16 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">ToDo</h1>
          {todos.length > 0 && (
            <p className="mt-1 text-sm text-slate-500">
              {remaining === 0
                ? 'すべて完了しました!'
                : `残り ${remaining} 件`}
            </p>
          )}
        </div>

        {/* Input */}
        <div className="flex gap-2 mb-6">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="新しいタスクを入力..."
            className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 shadow-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
          />
          <button
            onClick={addTodo}
            disabled={!inputValue.trim()}
            className="rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-600 active:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            追加
          </button>
        </div>

        {/* Todo list */}
        {todos.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-400">
            タスクがまだありません
          </div>
        ) : (
          <ul className="space-y-2">
            {todos.map((todo) => (
              <li
                key={todo.id}
                className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm"
              >
                {/* Checkbox */}
                <button
                  onClick={() => toggleTodo(todo.id)}
                  aria-label={todo.completed ? '未完了に戻す' : '完了にする'}
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${
                    todo.completed
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-slate-300 hover:border-blue-400'
                  }`}
                >
                  {todo.completed && (
                    <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 6l3 3 5-5" />
                    </svg>
                  )}
                </button>

                {/* Text */}
                <span
                  className={`flex-1 text-sm transition ${
                    todo.completed
                      ? 'text-slate-400 line-through'
                      : 'text-slate-700'
                  }`}
                >
                  {todo.text}
                </span>

                {/* Delete */}
                <button
                  onClick={() => deleteTodo(todo.id)}
                  aria-label="タスクを削除"
                  className="ml-1 rounded p-1 text-slate-300 hover:bg-red-50 hover:text-red-400 transition"
                >
                  <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
            className="mt-4 w-full rounded-lg border border-slate-200 bg-white py-2 text-sm text-slate-400 hover:text-red-400 hover:border-red-200 transition"
          >
            完了済みをすべて削除
          </button>
        )}
      </div>
    </div>
  )
}
