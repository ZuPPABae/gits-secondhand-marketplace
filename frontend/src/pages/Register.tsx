import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import axios from 'axios'
import { AlertCircle } from 'lucide-react'
import { useAuth } from '../features/auth/useAuth'
import { Input } from '../components/Input'
import { Button } from '../components/Button'
import { zodResolver } from '../lib/zodResolver'

const registerSchema = z
  .object({
    name: z.string().min(1, 'Nama lengkap wajib diisi.').max(255),
    email: z
      .string()
      .min(1, 'Alamat email wajib diisi.')
      .email('Format alamat email tidak valid.')
      .max(255),
    phone: z
      .string()
      .min(1, 'Nomor WhatsApp wajib diisi.')
      .regex(/^62[0-9]{8,13}$/, 'Nomor WhatsApp harus diawali 62 (contoh: 628123456789).'),
    location: z.string().min(1, 'Lokasi/kota domisili wajib diisi.').max(255),
    password: z.string().min(8, 'Kata sandi minimal 8 karakter.'),
    password_confirmation: z.string().min(1, 'Konfirmasi kata sandi wajib diisi.'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Konfirmasi kata sandi tidak cocok.',
    path: ['password_confirmation'],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

export const Register: React.FC = () => {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [generalError, setGeneralError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      location: '',
      password: '',
      password_confirmation: '',
    },
  })

  const onSubmit = async (data: RegisterFormValues) => {
    setGeneralError(null)
    try {
      await registerUser(data)
      navigate('/', { replace: true })
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status
        const responseData = err.response?.data as {
          message?: string
          errors?: Record<string, string[]>
        }

        if (status === 422 && responseData?.errors) {
          for (const [field, messages] of Object.entries(responseData.errors)) {
            setError(field as keyof RegisterFormValues, {
              type: 'server',
              message: messages[0],
            })
          }
        } else if (status === 429) {
          setGeneralError('Terlalu banyak percobaan pendaftaran. Silakan coba lagi 1 menit.')
        } else {
          setGeneralError(responseData?.message || 'Gagal mendaftar. Silakan periksa kembali formulir.')
        }
      } else {
        setGeneralError('Terjadi kesalahan koneksi ke server.')
      }
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-zinc-50 py-8">
      <div className="w-full max-w-lg bg-white rounded-xl border border-zinc-200 shadow-sm p-6 sm:p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Daftar Akun Baru
          </h1>
          <p className="mt-1.5 text-sm text-zinc-500">
            Bergabung dengan komunitas jual-beli barang bekas terpercaya
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
              label="Nama Lengkap"
              type="text"
              placeholder="Contoh: Pak Budi Santoso"
              required
              error={errors.name?.message}
              {...register('name')}
            />
          </div>

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
              label="Nomor WhatsApp"
              type="tel"
              placeholder="628123456789"
              helperText="Awali dengan 62 untuk memudahkan pembeli menghubungi via WhatsApp"
              required
              error={errors.phone?.message}
              {...register('phone')}
            />
          </div>

          <div>
            <Input
              label="Lokasi / Kota Domisili"
              type="text"
              placeholder="Contoh: Bandung, Jawa Barat"
              required
              error={errors.location?.message}
              {...register('location')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Input
                label="Kata Sandi"
                type="password"
                autoComplete="new-password"
                placeholder="Minimal 8 karakter"
                required
                error={errors.password?.message}
                {...register('password')}
              />
            </div>

            <div>
              <Input
                label="Konfirmasi Sandi"
                type="password"
                autoComplete="new-password"
                placeholder="Ulangi kata sandi"
                required
                error={errors.password_confirmation?.message}
                {...register('password_confirmation')}
              />
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              className="w-full"
            >
              Daftar Sekarang
            </Button>
          </div>
        </form>

        <div className="mt-6 pt-5 border-t border-zinc-100 text-center text-sm text-zinc-500">
          Sudah punya akun?{' '}
          <Link
            to="/login"
            className="font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
          >
            Masuk di sini
          </Link>
        </div>
      </div>
    </div>
  )
}

