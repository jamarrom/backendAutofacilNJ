// pages/admin/content/contact.tsx
import { useState, useEffect } from 'react'
import AdminLayout from '../../../components/AdminLayout'

interface ContactData {
  address: string
  phones: string
  emails: string
  hours: string
}

const DEFAULT_DATA: ContactData = {
  address: "Av. Principal 123\nCiudad de México2, CDMX 01234\nMéxico",
  phones: "+52 (55) 1234-5678\n+52 (55) 9876-5432",
  emails: "info@autofacil.com.mx\nventas@autofacil.com.mx",
  hours: "Lunes - Viernes: 9:00 AM - 7:00 PM\nSábado: 10:00 AM - 6:00 PM\nDomingo: Cerrado"
}

export default function ContactEditor() {
  const [data, setData] = useState<ContactData>(DEFAULT_DATA)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // CARGAR DESDE LA BASE DE DATOS AL INICIAR
  useEffect(() => {
    fetch('/api/admin/contact')
      .then(res => res.json())
      .then((savedData) => {
        if (savedData) {
          setData(savedData)
        }
        // Si no hay datos, se queda con DEFAULT_DATA y el API los crea automáticamente
      })
      .catch(() => {
        alert('Error al conectar con el servidor')
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)

    const res = await fetch('/api/admin/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include' // ← ESTA LÍNEA ES LA CLAVE
    })

    if (res.ok) {
        alert('¡Guardado con éxito!')
    } else {
        console.error('Error al guardar:', res)
        alert('Error al guardar')
    }
    setSaving(false)
    }

  if (loading) {
    return (
      <AdminLayout title="Contacto">
        <div style={{ textAlign: 'center', padding: '5rem', fontSize: '1.5rem' }}>
          Cargando datos de contacto...
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Editar Información de Contacto">
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1rem' }}>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: '900',
          color: '#1e3a8a',
          textAlign: 'center',
          marginBottom: '3rem'
        }}>
          Información de Contacto
        </h1>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '2rem',
          padding: '3rem',
          boxShadow: '0 25px 50px rgba(0,0,0,0.15)'
        }}>
          <div style={{ display: 'grid', gap: '2.5rem' }}>

            {/* VISÍTANOS */}
            <div>
              <label style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#dc2626' }}>
                Visítanos
              </label>
              <textarea
                rows={4}
                value={data.address}
                onChange={(e) => setData({ ...data, address: e.target.value })}
                style={{
                  width: '100%',
                  padding: '1.5rem',
                  marginTop: '0.8rem',
                  fontSize: '1.3rem',
                  border: '3px solid #e5e7eb',
                  borderRadius: '1rem',
                  fontFamily: 'monospace',
                  backgroundColor: '#f9fafb'
                }}
              />
            </div>

            {/* LLÁMANOS */}
            <div>
              <label style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#dc2626' }}>
                Llámanos
              </label>
              <textarea
                rows={3}
                value={data.phones}
                onChange={(e) => setData({ ...data, phones: e.target.value })}
                style={{
                  width: '100%',
                  padding: '1.5rem',
                  marginTop: '0.8rem',
                  fontSize: '1.3rem',
                  border: '3px solid #e5e7eb',
                  borderRadius: '1rem',
                  fontFamily: 'monospace',
                  backgroundColor: '#f9fafb'
                }}
              />
            </div>

            {/* ESCRÍBENOS */}
            <div>
              <label style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#dc2626' }}>
                Escríbenos
              </label>
              <textarea
                rows={3}
                value={data.emails}
                onChange={(e) => setData({ ...data, emails: e.target.value })}
                style={{
                  width: '100%',
                  padding: '1.5rem',
                  marginTop: '0.8rem',
                  fontSize: '1.3rem',
                  border: '3px solid #e5e7eb',
                  borderRadius: '1rem',
                  fontFamily: 'monospace',
                  backgroundColor: '#f9fafb'
                }}
              />
            </div>

            {/* HORARIO */}
            <div>
              <label style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#dc2626' }}>
                Horario de Atención
              </label>
              <textarea
                rows={4}
                value={data.hours}
                onChange={(e) => setData({ ...data, hours: e.target.value })}
                style={{
                  width: '100%',
                  padding: '1.5rem',
                  marginTop: '0.8rem',
                  fontSize: '1.3rem',
                  border: '3px solid #e5e7eb',
                  borderRadius: '1rem',
                  fontFamily: 'monospace',
                  backgroundColor: '#f9fafb'
                }}
              />
            </div>

            {/* BOTÓN GUARDAR */}
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: '1.5rem 6rem',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '2rem',
                  fontSize: '2rem',
                  fontWeight: '900',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.7 : 1,
                  minWidth: '320px'
                }}
              >
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>

          </div>
        </div>

        <p style={{
          textAlign: 'center',
          marginTop: '2rem',
          color: '#6b7280',
          fontSize: '1.2rem'
        }}>
          Los cambios se reflejan inmediatamente en toda la web.
        </p>
      </div>
    </AdminLayout>
  )
}