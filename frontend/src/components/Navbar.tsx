import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { ChevronDown, LogOut, Package, PlusCircle, ShoppingBag, User as UserIcon } from 'lucide-react'
import { useAuth } from '../features/auth/useAuth'

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    setDropdownOpen(false)
    await logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-zinc-200">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold shadow-sm transition-transform group-hover:scale-105">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-zinc-900 tracking-tight leading-tight">
              PasarWarga
            </span>
            <span className="text-[11px] text-zinc-500 font-normal hidden sm:block">
              Marketplace Komunitas
            </span>
          </div>
        </Link>

        {/* Dynamic Navigation Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isLoading ? (
            <div className="h-9 w-20 sm:w-24 bg-zinc-100 rounded-lg animate-pulse" />
          ) : !isAuthenticated ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link
                to="/login"
                className="h-10 px-3 sm:px-4 inline-flex items-center justify-center text-sm font-medium text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
              >
                Masuk
              </Link>
              <Link
                to="/register"
                className="h-10 px-3 sm:px-4 inline-flex items-center justify-center text-sm font-medium bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
              >
                Daftar
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Pasang Barang CTA */}
              <Link
                to="/pasang"
                className="h-10 px-3 sm:px-4 inline-flex items-center justify-center gap-1.5 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
              >
                <PlusCircle className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline">Pasang Barang</span>
                <span className="sm:hidden text-xs">Pasang</span>
              </Link>

              {/* User Account Menu */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="h-10 px-2.5 sm:px-3 inline-flex items-center gap-1.5 sm:gap-2 rounded-lg border border-zinc-200 hover:bg-zinc-50 transition-colors text-sm text-zinc-800 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
                  aria-expanded={dropdownOpen}
                  aria-label="Menu akun pengguna"
                >
                  <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 font-semibold text-xs flex items-center justify-center flex-shrink-0">
                    {user?.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium max-w-[70px] sm:max-w-[120px] truncate text-xs sm:text-sm">
                    {user?.name}
                  </span>
                  <ChevronDown className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-1.5 w-56 bg-white rounded-xl shadow-md border border-zinc-200 py-1.5 z-50 text-sm">
                    <div className="px-3 py-2 border-b border-zinc-100">
                      <p className="font-medium text-zinc-900 truncate">
                        {user?.name}
                      </p>
                      <p className="text-xs text-zinc-500 truncate">
                        {user?.email || user?.phone}
                      </p>
                    </div>

                    <Link
                      to={user?.id ? `/users/${user.id}` : '/profile'}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-zinc-700 hover:bg-zinc-50 transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-zinc-400" />
                      <span>Profil Saya</span>
                    </Link>

                    <Link
                      to="/me/listings"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-zinc-700 hover:bg-zinc-50 transition-colors"
                    >
                      <Package className="w-4 h-4 text-zinc-400" />
                      <span>Listing Saya</span>
                    </Link>

                    <div className="my-1 border-t border-zinc-100" />

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span>Keluar</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

