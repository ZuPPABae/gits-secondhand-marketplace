import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './features/auth/AuthContext'
import { Navbar } from './components/Navbar'
import { ProtectedRoute } from './components/ProtectedRoute'
import { GuestRoute } from './components/GuestRoute'
import { Home } from './pages/Home'
import { ListingDetail } from './pages/ListingDetail'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { ListingForm } from './pages/ListingForm'
import { MyListings } from './pages/MyListings'
import { Profile } from './pages/Profile'
import { NotFound } from './pages/NotFound'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-zinc-50 flex flex-col font-sans text-zinc-900">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Halaman Publik */}
                <Route path="/" element={<Home />} />
                <Route path="/listings/:id" element={<ListingDetail />} />

                {/* Halaman Tamu (Guest only) */}
                <Route
                  path="/login"
                  element={
                    <GuestRoute>
                      <Login />
                    </GuestRoute>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <GuestRoute>
                      <Register />
                    </GuestRoute>
                  }
                />

                {/* Halaman Terproteksi (Login required) */}
                <Route
                  path="/pasang"
                  element={
                    <ProtectedRoute>
                      <ListingForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-listings"
                  element={
                    <ProtectedRoute>
                      <MyListings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />

                {/* 404 Not Found */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
