import { useEffect, useState } from 'react'
import { api } from './api/axios'

interface HealthResponse {
  status: string
  timestamp: string
}

function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api
      .get<HealthResponse>('/api/v1/health')
      .then((res) => {
        setHealth(res.data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message || 'Gagal terhubung ke backend')
        setLoading(false)
      })
  }, [])

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-zinc-200 p-6 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mb-4">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Marketplace Barang Bekas
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Komunitas jual beli barang bekas terpercaya
        </p>

        <div className="mt-6 pt-6 border-t border-zinc-100 text-left text-sm space-y-2">
          <div className="flex items-center justify-between py-1">
            <span className="text-zinc-500">Frontend:</span>
            <span className="font-medium text-emerald-600">Vite + React + TS (Aktif)</span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-zinc-500">Backend API (/api/v1/health):</span>
            {loading ? (
              <span className="text-amber-500">Menghubungi...</span>
            ) : error ? (
              <span className="text-red-500">Error: {error}</span>
            ) : (
              <span className="font-medium text-emerald-600">
                {health?.status === 'ok' ? 'Terhubung (OK)' : 'Terhubung'}
              </span>
            )}
          </div>
          {health?.timestamp && (
            <div className="flex items-center justify-between py-1 text-xs text-zinc-400">
              <span>Waktu Server:</span>
              <span>{health.timestamp}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
