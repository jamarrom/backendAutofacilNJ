import { useState, useEffect } from 'react'
import { getSession } from 'next-auth/react'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'

const carTypes = ['SEDAN', 'SUV', 'COUPE', 'HATCHBACK', 'TRUCK']
const fuelTypes = ['GASOLINE', 'DIESEL', 'ELECTRIC', 'HYBRID']
const categories = ['NEW', 'AUCTION']

export default function CarForm({ car }: { car?: any }) {
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    price: 0,
    type: 'SEDAN',
    fuelType: 'GASOLINE',
    transmission: 'AUTOMATIC',
    mileage: 0,
    color: '',
    seats: 5,
    horsepower: 0,
    fuelEconomy: '',
    category: 'NEW',
    isFeatured: false,
    description: '',
    images: [] as { url: string; order: number }[],
    features: [] as { name: string; description: string }[]
  })
  
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (car) {
      setFormData({
        ...car,
        images: car.images || [],
        features: car.features || []
      })
    }
  }, [car])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = car ? `/api/cars/${car.id}` : '/api/cars'
      const method = car ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        router.push('/admin')
      } else {
        alert('Error al guardar el auto')
      }
    } catch (error) {
      alert('Error al guardar el auto')
    } finally {
      setLoading(false)
    }
  }

  const addImage = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, { url: '', order: prev.images.length }]
    }))
  }

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, { name: '', description: '' }]
    }))
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: 'white',
      padding: '2rem'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ color: '#1e3a8a', marginBottom: '2rem' }}>
          {car ? 'Editar Auto' : 'Agregar Nuevo Auto'}
        </h1>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Campos básicos */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label>Marca *</label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                required
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
            <div>
              <label>Modelo *</label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                required
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div>
              <label>Año *</label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                required
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
            <div>
              <label>Precio *</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                required
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
            <div>
              <label>Kilometraje *</label>
              <input
                type="number"
                value={formData.mileage}
                onChange={(e) => setFormData(prev => ({ ...prev, mileage: parseInt(e.target.value) }))}
                required
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div>
              <label>Tipo *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
              >
                {carTypes.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0) + type.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Combustible *</label>
              <select
                value={formData.fuelType}
                onChange={(e) => setFormData(prev => ({ ...prev, fuelType: e.target.value }))}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
              >
                {fuelTypes.map(type => (
                  <option key={type} value={type}>
                    {type === 'GASOLINE' ? 'Gasolina' : 
                     type === 'DIESEL' ? 'Diésel' :
                     type === 'ELECTRIC' ? 'Eléctrico' : 'Híbrido'}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Categoría *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'NEW' ? 'Nuevo' : 'Remate'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Más campos... */}

          <div>
            <label>
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                style={{ marginRight: '0.5rem' }}
              />
              Destacado
            </label>
          </div>

          <div>
            <label>Descripción</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </div>

          {/* Imágenes y características */}

          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: '#dc2626',
              color: 'white',
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            {loading ? 'Guardando...' : (car ? 'Actualizar Auto' : 'Crear Auto')}
          </button>
        </form>
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context)
  
  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false
      }
    }
  }

  return {
    props: {}
  }
}