import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import axios from 'axios'
import { AlertCircle } from 'lucide-react'
import { useAuth } from '../features/auth/useAuth'
import { Input } from '../components/Input'
import { Button } from '../components/Button'
import { zodResolver } from '../lib/zodResolver'

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Alamat email wajib diisi.')
    .email('Format alamat email tidak valid.'),
  password: z
    .string()
    .min(1, 'Kata sandi wajib diisi.'),
  remember: z.boolean().optional(),
})

type LoginFormValues = z.infer<typeof loginSchema>

export const Login: React.FC = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [generalError, setGeneralError] = useState<string | null>(null)

  React.useEffect(() => {
    document.title = 'Masuk — PasarWarga'
  }, [])

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/'

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      remember: false,
    },
  })

  const onSubmit = async (data: LoginFormValues) => {
    setGeneralError(null)
    try {
      await login(data)
      navigate(from, { replace: true })
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status
        const responseData = err.response?.data as {
          message?: string
          errors?: Record<string, string[]>
        }

        if (status === 422 && responseData?.errors) {
          // Set errors per field
          for (const [field, messages] of Object.entries(responseData.errors)) {
            setError(field as keyof LoginFormValues, {
              type: 'server',
              message: messages[0],
            })
          }
        } else if (status === 429) {
          setGeneralError('Terlalu banyak percobaan masuk. Silakan tunggu 1 menit.')
        } else {
          setGeneralError(responseData?.message || 'Gagal masuk. Periksa kembali email dan kata sandi Anda.')
        }
      } else {
        setGeneralError('Terjadi kesalahan jaringan. Coba beberapa saat lagi.')
      }
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-zinc-50">
      <div className="w-full max-w-md bg-white rounded-xl border border-zinc-200 shadow-sm p-6 sm:p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Masuk ke Akun
          </h1>
          <p className="mt-1.5 text-sm text-zinc-500">
            Selamat datang kembali di marketplace warga
          </p>
        </div>

        {generalError && (
          <div className="mb-5 p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600 mt-0.5" />
            <span className="leading-snug">{generalError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <Input
              label="Alamat Email"
              type="email"
              autoComplete="email"
              placeholder="nama@email.com"
              required
              error={errors.email?.message}
              {...register('email')}
            />
          </div>

          <div>
            <Input
              label="Kata Sandi"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              required
              error={errors.password?.message}
              {...register('password')}
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-600/20"
                {...register('remember')}
              />
              <span className="text-zinc-600 text-xs sm:text-sm">Ingat saya</span>
            </label>
          </div>

          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            className="w-full"
          >
            Masuk
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-zinc-100 text-center text-sm text-zinc-500">
          Belum punya akun?{' '}
          <Link
            to="/register"
            className="font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
          >
            Daftar sekarang
          </Link>
        </div>
      </div>
    </div>
  )
}
