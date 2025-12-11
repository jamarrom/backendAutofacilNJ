// components/AdminLayout.tsx
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
  const currentPath = router.asPath

  const menuItems = [
    {
      href: '/admin',
      label: 'Autos',
      icon: 'Car',
      exact: true,
    },
    {
      // Este ítem ahora redirige directamente al slider
      href: '/admin/content/sliders',   // ← Va directo al slider
      label: 'Contenido',
      children: [
        { href: '/admin/content/sliders', label: 'Slider Home' },
        { href: '/admin/content/contact', label: 'Contacto' },
      ],
    },
  ]

  // Detecta si estamos en cualquier página de contenido
  const isInContentSection = currentPath.startsWith('/admin/content')

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', fontFamily: 'system-ui, sans-serif' }}>
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
            Panel Admin - AutoFácil
          </h1>
          <button
            onClick={() => router.push('/login')}
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
            const isActive = item.exact
              ? currentPath === item.href
              : currentPath.startsWith(item.href) || isInContentSection

            const hasActiveChild =
              item.children?.some((child) => currentPath === child.href) || false

            // Mostrar submenú si estamos en cualquier página de /admin/content/*
            const showChildren = isInContentSection

            return (
              <div key={item.href}>
                {/* Ítem principal: ahora va directo al slider */}
                <Link href={item.href}>
                  <div
                    style={{
                      padding: '1.5rem 2rem',
                      fontSize: '1.4rem',
                      fontWeight: isActive || hasActiveChild ? '900' : '600',
                      backgroundColor: isActive || hasActiveChild ? '#dc2626' : 'transparent',
                      borderLeft: isActive || hasActiveChild ? '8px solid #fbbf24' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                    }}
                    onMouseOver={(e) => {
                      if (!isActive && !hasActiveChild) {
                        e.currentTarget.style.backgroundColor = '#374151'
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isActive && !hasActiveChild) {
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }
                    }}
                  >
                    {item.icon} {item.label}
                  </div>
                </Link>

                {/* Submenú siempre visible cuando estamos en contenido */}
                {showChildren && item.children && (
                  <div style={{ backgroundColor: '#111827' }}>
                    {item.children.map((child) => {
                      const isChildActive = currentPath === child.href

                      return (
                        <Link key={child.href} href={child.href}>
                          <div
                            style={{
                              padding: '1rem 3rem',
                              fontSize: '1.2rem',
                              fontWeight: isChildActive ? '800' : '500',
                              backgroundColor: isChildActive ? '#dc2626' : 'transparent',
                              borderLeft: isChildActive ? '4px solid #fbbf24' : 'none',
                              cursor: 'pointer',
                              transition: 'all 0.3s',
                            }}
                            onMouseOver={(e) => {
                              if (!isChildActive) {
                                e.currentTarget.style.backgroundColor = '#1f2937'
                              }
                            }}
                            onMouseOut={(e) => {
                              if (!isChildActive) {
                                e.currentTarget.style.backgroundColor = 'transparent'
                              }
                            }}
                          >
                            {child.label}
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </aside>

        {/* Contenido principal */}
        <main style={{ flex: 1, padding: '2rem' }}>
          {children}
        </main>
      </div>
    </div>
  )
}