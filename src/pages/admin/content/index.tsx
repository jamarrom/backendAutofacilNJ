// pages/admin/content/index.tsx
import { useState } from 'react'
import AdminLayout from '../../../components/AdminLayout'
import Link from 'next/link'

export default function ContentManager() {
  const [activeTab, setActiveTab] = useState<'slider' | 'contact'>('slider')

  return (
    <AdminLayout title="Gestión de Contenido. 2">
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.8rem', fontWeight: '900', color: '#1e3a8a', marginBottom: '2rem' }}>
          Gestión de Contenido
        </h1>

        {/* TABS */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem', borderBottom: '3px solid #e5e7eb' }}>
          <button
            onClick={() => setActiveTab('slider')}
            style={{
              padding: '1rem 2rem',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              backgroundColor: activeTab === 'slider' ? '#dc2626' : 'transparent',
              color: activeTab === 'slider' ? 'white' : '#374151',
              border: 'none',
              borderRadius: '1rem 1rem 0 0',
              cursor: 'pointer'
            }}
          >
            Slider Home
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            style={{
              padding: '1rem 2rem',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              backgroundColor: activeTab === 'contact' ? '#dc2626' : 'transparent',
              color: activeTab === 'contact' ? 'white' : '#374151',
              border: 'none',
              borderRadius: '1rem 1rem 0 0',
              cursor: 'pointer'
            }}
          >
            Contacto
          </button>
        </div>

        {/* CONTENIDO DE CADA TAB */}
        {activeTab === 'slider' && (
            
          <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: '#f9fafb', borderRadius: '2rem' }}>
            <h2 style={{ fontSize: '2.5rem', color: '#1e40af' }}>Gestión del Slider Home</h2>
            <p style={{ fontSize: '1.5rem', color: '#6b7280', margin: '2rem 0' }}>
              Aquí podrás subir, ordenar y eliminar las imágenes del slider principal.
            </p>
            <Link href="/admin/content/sliders">
              <button style={{
                padding: '1.5rem 4rem',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '2rem',
                fontSize: '1.8rem',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}>
                Ir al Slider Home →
              </button>
            </Link>
          </div>
        )}

        {activeTab === 'contact' && (
          <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: '#f9fafb', borderRadius: '2rem' }}>
            <h2 style={{ fontSize: '2.5rem', color: '#1e40af' }}>Información de Contacto</h2>
            <p style={{ fontSize: '1.5rem', color: '#6b7280', margin: '2rem 0' }}>
              Edita la información que aparece en el pie de página y sección de contacto.
            </p>
            <Link href="/admin/content/contact">
              <button style={{
                padding: '1.5rem 4rem',
                backgroundColor: '#1e40af',
                color: 'white',
                border: 'none',
                borderRadius: '2rem',
                fontSize: '1.8rem',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}>
                Editar Contacto →
              </button>
            </Link>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}