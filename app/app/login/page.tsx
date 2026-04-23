'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Mode = 'login' | 'reset'

const INVALID_TOKEN_MESSAGE =
  '재설정 링크가 만료되었거나 유효하지 않습니다. 다시 요청해주세요.'

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginPageContent />
    </Suspense>
  )
}

function LoginFallback() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">link_memory</h1>
          <p className="text-zinc-400 text-sm mt-1">나만의 지식 아카이브</p>
        </div>
      </div>
    </div>
  )
}

function LoginPageContent() {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resetNotice, setResetNotice] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  // URL 쿼리의 error 플래그는 렌더 중 파생값으로 표시 (useEffect+setState 금지)
  const tokenError =
    searchParams.get('error') === 'invalid-token' ? INVALID_TOKEN_MESSAGE : null
  const displayError = error ?? tokenError

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.')
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  async function handleResetRequest(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResetNotice(null)

    const origin = window.location.origin
    // 이메일 enumeration 방지를 위해 성공/실패와 무관하게 동일한 안내 메시지 노출
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback`,
    })

    setResetNotice('입력하신 이메일로 재설정 링크를 보냈습니다. 메일함을 확인하세요.')
    setLoading(false)
  }

  function switchMode(next: Mode) {
    setMode(next)
    setError(null)
    setResetNotice(null)
    setPassword('')
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* 로고 */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-zinc-100">link_memory</h1>
          <p className="text-zinc-400 text-sm mt-1">
            {mode === 'login' ? '나만의 지식 아카이브' : '비밀번호 재설정 링크 받기'}
          </p>
        </div>

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="이메일"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {displayError && <p className="text-red-400 text-sm">{displayError}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => switchMode('reset')}
                className="text-sm text-zinc-400 hover:text-indigo-400 transition-colors"
              >
                비밀번호를 잊으셨나요?
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleResetRequest} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="이메일"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {displayError && <p className="text-red-400 text-sm">{displayError}</p>}
            {resetNotice && (
              <p className="text-indigo-300 text-sm">{resetNotice}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
            >
              {loading ? '전송 중...' : '재설정 링크 받기'}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="text-sm text-zinc-400 hover:text-indigo-400 transition-colors"
              >
                로그인으로 돌아가기
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
