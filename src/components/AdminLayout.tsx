// components/AdminLayout.tsx
import Link from 'next/link'
import { useRouter } from 'next/router'
import { signOut } from 'next-auth/react'
import { ReactNode } from 'react'

// ÍCONOS CORRECTOS de react-icons
import { FaCar, FaImages, FaGavel, FaSignOutAlt, FaHome } from 'react-icons/fa'
import { MdDashboard } from 'react-icons/md'

interface AdminLayoutProps {
  children: ReactNode
  title?: string
}

const navigation = [
  { name: 'Autos', href: '/admin', icon: FaCar },
  { name: 'Slider Home', href: '/admin/sliders?tab=home', icon: FaImages },
  { name: 'Slider Remate', href: '/admin/sliders?tab=auction', icon: FaGavel },
]

export default function AdminLayout({ children, title = 'Panel Admin' }: AdminLayoutProps) {
  const router = useRouter()

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' })
  }

  const isActive = (href: string) => {
    if (href === '/admin') return router.asPath === '/admin' || router.asPath.startsWith('/admin/cars')
    return router.asPath.startsWith(href)
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Sidebar */}
      <aside style={{
        width: '280px',
        background: 'linear-gradient(180deg, #1e3a8a 0%, #1e40af 100%)',
        color: 'white',
        padding: '2rem 1rem',
        position: 'fixed',
        height: '100vh',
        overflowY: 'auto',
        boxShadow: '4px 0 20px rgba(0,0,0,0.1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
            AutoFácil
          </h1>
          <p style={{ opacity: 0.9, fontSize: '0.9rem' }}>Panel Administrativo</p>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          {navigation.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem 1.5rem',
                  borderRadius: '12px',
                  backgroundColor: active ? 'rgba(255,255,255,0.2)' : 'transparent',
                  color: 'white',
                  textDecoration: 'none',
                  fontWeight: active ? '600' : '500',
                  transition: 'all 0.3s',
                  backdropFilter: active ? 'blur(10px)' : 'none'
                }}
                onMouseEnter={(e) => !active && (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)')}
                onMouseLeave={(e) => !active && (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <item.icon size={24} />
                <span>{item.name}</span>
                {active && <div style={{ marginLeft: 'auto', width: '8px', height: '8px', background: 'white', borderRadius: '50%' }} />}
              </Link>
            )
          })}
        </nav>

        <button
          onClick={handleSignOut}
          style={{
            marginTop: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            width: '100%',
            padding: '1rem 1.5rem',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
        >
          <FaSignOutAlt size={22} />
          Cerrar Sesión
        </button>
      </aside>

      {/* Contenido principal */}
      <div style={{ marginLeft: '280px', flex: 1 }}>
        <header style={{
          backgroundColor: 'white',
          padding: '1.5rem 3rem',
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <h2 style={{ fontSize: '1.8rem', color: '#1e3a8a', margin: 0 }}>
            {title}
          </h2>

          {router.asPath !== '/admin' && (
            <button
              onClick={() => router.back()}
              style={{
                backgroundColor: '#6b7280',
                color: 'white',
                padding: '0.75rem 1.8rem',
                border: 'none',
                borderRadius: '10px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              ← Volver
            </button>
          )}
        </header>

        <main style={{ padding: '2.5rem', maxWidth: '1400px', margin: '0 auto' }}>
          {children}
        </main>
      </div>
    </div>
  )
}