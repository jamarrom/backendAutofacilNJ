// components/AdminLayout.tsx
import { getSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function AdminLayout({
  children,
  title = "Admin",
}: {
  children: React.ReactNode
  title?: string
}) {
  const router = useRouter()

  const menuItems = [
    { href: '/admin', label: 'Autos', icon: '🚗' },
    { href: '/admin/content', label: 'Contenido', icon: '📝' },
  ]

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f3f4f6',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      {/* Header */}
      <header
        style={{
          background: 'linear-gradient(90deg, #1e3a8a, #1e40af)',
          color: 'white',
          padding: '1.5rem 2rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
        }}
      >
        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', margin: 0 }}>
            <img src="../logoFooter.png" />  Panel Admin - AutoFácil
          </h1>
          <button
            onClick={() => router.push('/api/auth/signout')}
            style={{
              padding: '0.75rem 2rem',
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      <div style={{ display: 'flex' }}>
        {/* Sidebar */}
        <aside
          style={{
            width: '280px',
            backgroundColor: '#1f2937',
            color: 'white',
            minHeight: 'calc(100vh - 90px)',
            padding: '2rem 0',
          }}
        >
          {menuItems.map((item) => {
            const isActive =
              router.asPath === item.href

            return (
              <Link key={item.href} href={item.href}>
                <div
                  style={{
                    padding: '1.5rem 2rem',
                    fontSize: '1.4rem',
                    fontWeight: isActive ? '900' : '600',
                    backgroundColor: isActive ? '#dc2626' : 'transparent',
                    borderLeft: isActive ? '8px solid #fbbf24' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                  }}
                  onMouseOver={(e) =>
                    !isActive &&
                    (e.currentTarget.style.backgroundColor = '#374151')
                  }
                  onMouseOut={(e) =>
                    !isActive &&
                    (e.currentTarget.style.backgroundColor = 'transparent')
                  }
                >
                  {item.icon} {item.label}
                </div>
              </Link>
            )
          })}
        </aside>

        {/* Contenido principal */}
        <main style={{ flex: 1, padding: '2rem' }}>{children}</main>
      </div>
    </div>
  )
}
