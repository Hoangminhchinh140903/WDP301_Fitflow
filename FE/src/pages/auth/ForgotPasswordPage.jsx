import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { forgotPasswordApi, resetPasswordApi } from '../../services/auth.service'

const STEP = Object.freeze({
  REQUEST: 'request',
  RESET: 'reset',
  SUCCESS: 'success',
})

const ForgotPasswordPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const tokenFromUrl = searchParams.get('token') || ''
  const emailFromUrl = searchParams.get('email') || ''

  const [step, setStep] = useState(
    tokenFromUrl ? STEP.RESET : STEP.REQUEST
  )

  // Step 1 — request
  const [email, setEmail] = useState('')
  const [requestLoading, setRequestLoading] = useState(false)
  const [requestMessage, setRequestMessage] = useState('')
  const [requestError, setRequestError] = useState('')

  // Step 2 — reset
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [resetError, setResetError] = useState('')

  useEffect(() => {
    if (tokenFromUrl) {
      setStep(STEP.RESET)
    }
  }, [tokenFromUrl])

  // ─── Step 1: Request reset email ─────────────────────────────────
  const handleRequestSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      setRequestError('')
      setRequestMessage('')

      const trimmedEmail = email.trim()
      if (!trimmedEmail) {
        setRequestError('Vui lòng nhập email')
        return
      }

      setRequestLoading(true)
      try {
        const res = await forgotPasswordApi({ email: trimmedEmail })
        setRequestMessage(
          res?.message ||
            'Nếu email tồn tại, hướng dẫn đặt lại mật khẩu đã được gửi.'
        )
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          'Đã có lỗi xảy ra, vui lòng thử lại.'
        setRequestError(msg)
      } finally {
        setRequestLoading(false)
      }
    },
    [email]
  )

  // ─── Step 2: Reset password ──────────────────────────────────────
  const handleResetSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      setResetError('')

      if (!newPassword || !confirmPassword) {
        setResetError('Vui lòng nhập đầy đủ mật khẩu')
        return
      }

      if (newPassword.length < 6) {
        setResetError('Mật khẩu phải có ít nhất 6 ký tự')
        return
      }

      if (newPassword !== confirmPassword) {
        setResetError('Mật khẩu xác nhận không khớp')
        return
      }

      setResetLoading(true)
      try {
        await resetPasswordApi({
          token: tokenFromUrl,
          newPassword,
        })
        setStep(STEP.SUCCESS)
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          'Không thể đặt lại mật khẩu. Token có thể đã hết hạn.'
        setResetError(msg)
      } finally {
        setResetLoading(false)
      }
    },
    [newPassword, confirmPassword, tokenFromUrl]
  )

  // ─── Render helpers ──────────────────────────────────────────────
  const renderRequestStep = () => (
    <form onSubmit={handleRequestSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="forgot-email"
          className="block text-sm font-medium text-slate-300 mb-1.5"
        >
          Email đăng ký
        </label>
        <input
          id="forgot-email"
          type="email"
          autoComplete="email"
          autoFocus
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={requestLoading}
          className="w-full rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-3 text-white placeholder-slate-500 outline-none transition-all focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 disabled:opacity-50"
        />
      </div>

      {requestError && (
        <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2 border border-red-500/20">
          {requestError}
        </p>
      )}

      {requestMessage && (
        <p className="text-sm text-emerald-400 bg-emerald-500/10 rounded-lg px-3 py-2 border border-emerald-500/20">
          {requestMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={requestLoading}
        className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 py-3 font-semibold text-white shadow-lg shadow-sky-500/25 transition-all hover:from-sky-400 hover:to-blue-500 hover:shadow-sky-500/40 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {requestLoading ? (
          <span className="inline-flex items-center gap-2">
            <Spinner /> Đang gửi...
          </span>
        ) : (
          'Gửi email đặt lại mật khẩu'
        )}
      </button>
    </form>
  )

  const renderResetStep = () => (
    <form onSubmit={handleResetSubmit} className="space-y-5">
      {emailFromUrl && (
        <div className="rounded-lg bg-slate-800/50 px-4 py-2.5 text-sm text-slate-400 border border-slate-700/50">
          Đặt lại mật khẩu cho{' '}
          <span className="text-white font-medium">{emailFromUrl}</span>
        </div>
      )}

      <div>
        <label
          htmlFor="new-password"
          className="block text-sm font-medium text-slate-300 mb-1.5"
        >
          Mật khẩu mới
        </label>
        <div className="relative">
          <input
            id="new-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            autoFocus
            placeholder="Tối thiểu 6 ký tự"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={resetLoading}
            className="w-full rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-3 pr-12 text-white placeholder-slate-500 outline-none transition-all focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 disabled:opacity-50"
          />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          >
            {showPassword ? <EyeOff /> : <EyeOn />}
          </button>
        </div>
      </div>

      <div>
        <label
          htmlFor="confirm-password"
          className="block text-sm font-medium text-slate-300 mb-1.5"
        >
          Xác nhận mật khẩu mới
        </label>
        <input
          id="confirm-password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="Nhập lại mật khẩu"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={resetLoading}
          className="w-full rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-3 text-white placeholder-slate-500 outline-none transition-all focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 disabled:opacity-50"
        />
      </div>

      {/* Password strength hint */}
      {newPassword.length > 0 && (
        <div className="flex items-center gap-2 text-xs">
          <div className="flex gap-1 flex-1">
            {[1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  getPasswordStrength(newPassword) >= level
                    ? level <= 1
                      ? 'bg-red-500'
                      : level <= 2
                        ? 'bg-orange-500'
                        : level <= 3
                          ? 'bg-yellow-500'
                          : 'bg-emerald-500'
                    : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
          <span className="text-slate-500">
            {getPasswordStrengthLabel(newPassword)}
          </span>
        </div>
      )}

      {resetError && (
        <p className="text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2 border border-red-500/20">
          {resetError}
        </p>
      )}

      <button
        type="submit"
        disabled={resetLoading}
        className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 py-3 font-semibold text-white shadow-lg shadow-sky-500/25 transition-all hover:from-sky-400 hover:to-blue-500 hover:shadow-sky-500/40 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {resetLoading ? (
          <span className="inline-flex items-center gap-2">
            <Spinner /> Đang xử lý...
          </span>
        ) : (
          'Đặt lại mật khẩu'
        )}
      </button>
    </form>
  )

  const renderSuccessStep = () => (
    <div className="text-center space-y-5">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/30">
        <svg
          className="h-8 w-8 text-emerald-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-1">
          Đặt lại mật khẩu thành công!
        </h3>
        <p className="text-sm text-slate-400">
          Bạn có thể đăng nhập với mật khẩu mới.
        </p>
      </div>

      <button
        onClick={() => navigate('/login')}
        className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 py-3 font-semibold text-white shadow-lg shadow-sky-500/25 transition-all hover:from-sky-400 hover:to-blue-500 hover:shadow-sky-500/40 active:scale-[0.98]"
      >
        Đăng nhập ngay
      </button>
    </div>
  )

  const stepConfig = {
    [STEP.REQUEST]: {
      title: 'Quên mật khẩu',
      subtitle: 'Nhập email đã đăng ký để nhận link đặt lại mật khẩu',
      icon: (
        <svg className="h-7 w-7 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
      ),
    },
    [STEP.RESET]: {
      title: 'Đặt lại mật khẩu',
      subtitle: 'Tạo mật khẩu mới cho tài khoản của bạn',
      icon: (
        <svg className="h-7 w-7 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
      ),
    },
    [STEP.SUCCESS]: {
      title: 'Hoàn tất',
      subtitle: '',
      icon: null,
    },
  }

  const currentStep = stepConfig[step]

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">
      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-sky-500/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-blue-600/5 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo / Brand */}
        <Link
          to="/"
          className="mb-8 flex items-center justify-center gap-2 text-white transition-opacity hover:opacity-80"
        >
          <span className="text-2xl font-bold tracking-tight">
            FIT<span className="text-sky-400">FLOW</span>
          </span>
        </Link>

        {/* Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl shadow-black/30 backdrop-blur-sm">
          {/* Header */}
          {step !== STEP.SUCCESS && (
            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10 ring-1 ring-sky-500/20">
                {currentStep.icon}
              </div>
              <h1 className="text-xl font-bold text-white">
                {currentStep.title}
              </h1>
              {currentStep.subtitle && (
                <p className="mt-1.5 text-sm text-slate-400">
                  {currentStep.subtitle}
                </p>
              )}
            </div>
          )}

          {/* Step content */}
          {step === STEP.REQUEST && renderRequestStep()}
          {step === STEP.RESET && renderResetStep()}
          {step === STEP.SUCCESS && renderSuccessStep()}
        </div>

        {/* Footer links */}
        <div className="mt-6 flex items-center justify-center gap-4 text-sm text-slate-500">
          <Link
            to="/login"
            className="transition-colors hover:text-sky-400"
          >
            Đăng nhập
          </Link>
          <span className="text-slate-700">•</span>
          <Link
            to="/signup"
            className="transition-colors hover:text-sky-400"
          >
            Đăng ký
          </Link>
        </div>
      </div>
    </div>
  )
}

// ─── Tiny inline components ────────────────────────────────────────

const Spinner = () => (
  <svg
    className="h-4 w-4 animate-spin"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx={12}
      cy={12}
      r={10}
      stroke="currentColor"
      strokeWidth={4}
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
)

const EyeOn = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const EyeOff = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
  </svg>
)

// ─── Password strength helpers ─────────────────────────────────────

function getPasswordStrength(password) {
  let score = 0
  if (password.length >= 6) score++
  if (password.length >= 8 && /[A-Z]/.test(password)) score++
  if (/\d/.test(password) && /[a-z]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  return score
}

function getPasswordStrengthLabel(password) {
  const s = getPasswordStrength(password)
  if (s <= 1) return 'Yếu'
  if (s === 2) return 'Trung bình'
  if (s === 3) return 'Khá'
  return 'Mạnh'
}

export default ForgotPasswordPage
