// pages/admin/index.tsx
import { useState, useEffect } from 'react'
import { GetServerSideProps } from 'next'
import Link from 'next/link'
import AdminLayout from '../../components/AdminLayout'

interface Car {
  id: string
  title: string
  brand: string
  model: string
  year: number
  price: number
  type: string
  category: string
  isFeatured: boolean
}

export default function AdminDashboard() {
  const [cars, setCars] = useState<Car[]>([])
  const [filteredCars, setFilteredCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'NEW' | 'AUCTION'>('ALL')

  useEffect(() => {
    fetchCars()
  }, [])

  useEffect(() => {
    if (categoryFilter === 'ALL') {
      setFilteredCars(cars)
    } else {
      setFilteredCars(cars.filter(car => car.category === categoryFilter))
    }
  }, [categoryFilter, cars])

  const fetchCars = async () => {
    try {
      const response = await fetch('/api/cars')
      const data = await response.json()
      setCars(data)
    } catch (error) {
      console.error('Error fetching cars:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteCar = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este auto?')) return

    try {
      await fetch(`/api/cars/${id}`, { method: 'DELETE' })
      fetchCars()
    } catch (error) {
      console.error('Error deleting car:', error)
    }
  }

  if (loading) {
    return (
      <AdminLayout title="Administrar Autos">
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <p>Cargando autos...</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Administrar Autos">
      <div style={{ maxWidth: '1300px', margin: '0 auto' }}>

        {/* Header con título y botón agregar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h1 style={{ fontSize: '2rem', color: '#1e3a8a', margin: 0 }}>
              Gestión de Autos
            </h1>
            <p style={{ color: '#6b7280', margin: '0.5rem 0 0' }}>
              Total: {cars.length} auto{cars.length !== 1 ? 's' : ''}
            </p>
          </div>

          <Link
            href="/admin/cars/new"
            style={{
              backgroundColor: '#dc2626',
              color: 'white',
              padding: '0.85rem 1.8rem',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '1rem',
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
          >
            + Agregar Auto
          </Link>
        </div>

        {/* Filtro por categoría */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ marginRight: '1rem', fontWeight: '500' }}>Filtrar por categoría:</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            style={{
              padding: '0.65rem 1rem',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              backgroundColor: 'white',
              fontSize: '1rem'
            }}
          >
            <option value="ALL">Todos los autos</option>
            <option value="NEW">Solo semi nuevos</option>
            <option value="AUCTION">Solo remates</option>
          </select>
        </div>

        {/* Tabla */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#1e3a8a' }}>
                <th style={{ padding: '1.25rem', textAlign: 'left', color: 'white' }}>Auto</th>
                <th style={{ padding: '1.25rem', textAlign: 'left', color: 'white' }}>Año</th>
                <th style={{ padding: '1.25rem', textAlign: 'left', color: 'white' }}>Precio</th>
                <th style={{ padding: '1.25rem', textAlign: 'left', color: 'white' }}>Tipo</th>
                <th style={{ padding: '1.25rem', textAlign: 'left', color: 'white' }}>Categoría</th>
                <th style={{ padding: '1.25rem', textAlign: 'left', color: 'white' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredCars.map((car) => (
                <tr key={car.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <strong>{car.title}</strong>
                      {car.isFeatured && (
                        <span style={{
                          backgroundColor: '#dc2626',
                          color: 'white',
                          padding: '0.25rem 0.6rem',
                          borderRadius: '999px',
                          fontSize: '0.75rem',
                          fontWeight: '600'
                        }}>
                          Destacado
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem' }}>{car.year}</td>
                  <td style={{ padding: '1.25rem', fontWeight: '600' }}>
                    ${car.price.toLocaleString('es-CL')}
                  </td>
                  <td style={{ padding: '1.25rem' }}>{car.type}</td>
                  <td style={{ padding: '1.25rem' }}>
                    <span style={{
                      padding: '0.4rem 0.8rem',
                      borderRadius: '999px',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      backgroundColor: car.category === 'NEW' ? '#dbeafe' : '#fee2e2',
                      color: car.category === 'NEW' ? '#1e40af' : '#991b1b'
                    }}>
                      {car.category === 'NEW' ? 'Semi nuevo' : 'Remate'}
                    </span>
                  </td>
                  <td style={{ padding: '1.25rem' }}>
                    <Link
                      href={`/admin/cars/${car.id}`}
                      style={{
                        color: '#1e40af',
                        textDecoration: 'none',
                        marginRight: '1rem',
                        fontWeight: '500'
                      }}
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => deleteCar(car.id)}
                      style={{
                        color: '#dc2626',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: '500'
                      }}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredCars.length === 0 && (
            <div style={{
              padding: '4rem',
              textAlign: 'center',
              color: '#6b7280',
              fontSize: '1.1rem'
            }}>
              {cars.length === 0
                ? 'No hay autos registrados aún.'
                : 'No hay autos que coincidan con el filtro seleccionado.'}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { getSession } = await import('next-auth/react')
  const session = await getSession(context)

  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    }
  }

  return { props: {} }
}