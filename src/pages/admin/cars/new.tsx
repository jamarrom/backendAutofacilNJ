import { useState } from 'react'
import { getSession } from 'next-auth/react'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import ImageUpload from '../../../components/ImageUpload'
import AdminLayout from '../../../components/AdminLayout'

const carTypes = ['SEDAN', 'SUV', 'COUPE', 'HATCHBACK', 'TRUCK']
const fuelTypes = ['GASOLINE', 'DIESEL', 'ELECTRIC', 'HYBRID']
const categories = ['NEW', 'AUCTION']
const transmissionTypes = ['AUTOMATIC', 'MANUAL']

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
    images: [] as { url: string; order: number; isPrimary: boolean }[],
    features: [] as { name: string; description: string }[]
  })
  
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleImagesUpload = (uploadedFiles: any[]) => {
    setFormData(prev => ({
      ...prev,
      images: [
        ...prev.images,
        ...uploadedFiles.map((file, index) => ({
          url: file.url,
          order: prev.images.length + index,
          isPrimary: prev.images.length === 0 // La primera imagen es principal por defecto
        }))
      ]
    }))
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
        // Validaciones antes de enviar
        if (formData.images.length < 3) {
            alert('Debes agregar al menos 3 imágenes')
            setLoading(false)
            return
        }

        // Asegurar que haya una imagen principal
        const imagesWithPrimary = formData.images.map((img, index) => ({
            ...img,
            isPrimary: img.isPrimary || (index === 0 && !formData.images.some(i => i.isPrimary))
        }))

        const dataToSend = {
            ...formData,
            images: imagesWithPrimary,
            // Asegurar que los números sean números
            year: parseInt(formData.year.toString()),
            price: parseFloat(formData.price.toString()),
            mileage: parseInt(formData.mileage.toString()),
            seats: parseInt(formData.seats.toString()),
            horsepower: formData.horsepower ? parseInt(formData.horsepower.toString()) : null,
        }

        console.log('Enviando datos:', dataToSend)

        const url = car ? `/api/cars/${car.id}` : '/api/cars'
        const method = car ? 'PUT' : 'POST'

        const response = await fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
        })

        const result = await response.json()
        console.log('Respuesta del servidor:', result)

        if (response.ok) {
            alert('Auto guardado exitosamente')
            router.push('/admin')
        } else {
            alert(`Error: ${result.error}${result.details ? ` - ${result.details}` : ''}`)
        }
    } catch (error) {
        console.error('Error en handleSubmit:', error)
        alert('Error al guardar el auto')
    } finally {
        setLoading(false)
    }
 }

  const addImage = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, { url: '', order: prev.images.length, isPrimary: false }]
    }))
  }

  const updateImage = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => 
        i === index ? { ...img, [field]: value } : img
      )
    }))
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const setPrimaryImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => ({
        ...img,
        isPrimary: i === index
      }))
    }))
  }

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, { name: '', description: '' }]
    }))
  }

  const updateFeature = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => 
        i === index ? { ...feature, [field]: value } : feature
      )
    }))
  }

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }))
  }

  return (
    <AdminLayout title="Agregar Nuevo Auto">
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ color: '#1e3a8a', marginBottom: '2rem' }}>
          {car ? 'Editar Auto' : 'Agregar Nuevo Auto'}
        </h1>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Información Básica */}
          <div style={{ border: '1px solid #e5e5e5', borderRadius: '8px', padding: '1.5rem' }}>
            <h3 style={{ color: '#1e3a8a', marginBottom: '1rem' }}>Información Básica</h3>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
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
                <label>Transmisión *</label>
                <select
                  value={formData.transmission}
                  onChange={(e) => setFormData(prev => ({ ...prev, transmission: e.target.value }))}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                >
                  {transmissionTypes.map(type => (
                    <option key={type} value={type}>
                      {type === 'AUTOMATIC' ? 'Automática' : 'Manual'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <label>Color *</label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  required
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label>Asientos *</label>
                <input
                  type="number"
                  value={formData.seats}
                  onChange={(e) => setFormData(prev => ({ ...prev, seats: parseInt(e.target.value) }))}
                  required
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <label>Caballos de Fuerza</label>
                <input
                  type="number"
                  value={formData.horsepower}
                  onChange={(e) => setFormData(prev => ({ ...prev, horsepower: parseInt(e.target.value) }))}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label>Economía de Combustible</label>
                <input
                  type="text"
                  value={formData.fuelEconomy}
                  onChange={(e) => setFormData(prev => ({ ...prev, fuelEconomy: e.target.value }))}
                  placeholder="Ej: 16/23 MPG"
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>
            </div>

            <div style={{ marginTop: '1rem' }}>
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

            <div style={{ marginTop: '1rem' }}>
              <label>Categoría *</label>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                {categories.map(cat => (
                  <label key={cat} style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      type="radio"
                      name="category"
                      value={cat}
                      checked={formData.category === cat}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      style={{ marginRight: '0.5rem' }}
                    />
                    {cat === 'NEW' ? 'Nuevo' : 'Remate'}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <label>Descripción</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
          </div>

          {/* Imágenes */}
          <div style={{ border: '1px solid #e5e5e5', borderRadius: '8px', padding: '1.5rem' }}>
            <h3 style={{ color: '#1e3a8a', marginBottom: '1rem' }}>Imágenes</h3>
            
            {/* Upload de imágenes */}
            <div style={{ marginBottom: '2rem' }}>
              <ImageUpload 
                onFilesUpload={handleImagesUpload}
                multiple={true}
                uploadType="cars"
                maxFiles={10}
              />
            </div>

            {/* Vista previa de imágenes */}
            {formData.images.length > 0 && (
              <div>
                <h4 style={{ marginBottom: '1rem' }}>Imágenes subidas:</h4>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                  gap: '1rem',
                  marginBottom: '1rem'
                }}>
                  {formData.images.map((image, index) => (
                    <div key={index} style={{
                      position: 'relative',
                      border: image.isPrimary ? '3px solid #dc2626' : '1px solid #e5e5e5',
                      borderRadius: '8px',
                      overflow: 'hidden'
                    }}>
                      <img 
                        src={image.url} 
                        alt={`Imagen ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '100px',
                          objectFit: 'cover'
                        }}
                      />
                      <div style={{
                        position: 'absolute',
                        top: '0.25rem',
                        right: '0.25rem',
                        display: 'flex',
                        gap: '0.25rem'
                      }}>
                        <button
                          type="button"
                          onClick={() => setPrimaryImage(index)}
                          style={{
                            backgroundColor: image.isPrimary ? '#dc2626' : 'rgba(0,0,0,0.7)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '0.25rem 0.5rem',
                            fontSize: '0.75rem',
                            cursor: 'pointer'
                          }}
                        >
                          {image.isPrimary ? 'Principal' : 'Principal'}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          style={{
                            backgroundColor: 'rgba(239,68,68,0.9)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '0.25rem',
                            cursor: 'pointer'
                          }}
                        >
                          ✕
                        </button>
                      </div>
                      {image.isPrimary && (
                        <div style={{
                          position: 'absolute',
                          bottom: '0',
                          left: '0',
                          right: '0',
                          backgroundColor: 'rgba(220,38,38,0.9)',
                          color: 'white',
                          textAlign: 'center',
                          padding: '0.25rem',
                          fontSize: '0.75rem'
                        }}>
                          Imagen Principal
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                  ✅ {formData.images.length} imagen(es) subida(s). 
                  {formData.images.some(img => img.isPrimary) ? ' ✅ Imagen principal seleccionada.' : ' ❌ Selecciona una imagen principal.'}
                </p>
              </div>
            )}
          </div>


          {/* Características */}
          <div style={{ border: '1px solid #e5e5e5', borderRadius: '8px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ color: '#1e3a8a', margin: 0 }}>Características</h3>
              <button
                type="button"
                onClick={addFeature}
                style={{
                  backgroundColor: '#1e3a8a',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                + Agregar Característica
              </button>
            </div>

            {formData.features.map((feature, index) => (
              <div key={index} style={{ 
                display: 'flex', 
                gap: '1rem', 
                alignItems: 'center', 
                marginBottom: '1rem',
                padding: '1rem',
                border: '1px solid #e5e5e5',
                borderRadius: '4px'
              }}>
                <div style={{ flex: 1 }}>
                  <label>Nombre *</label>
                  <input
                    type="text"
                    value={feature.name}
                    onChange={(e) => updateFeature(index, 'name', e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                  />
                </div>
                <div style={{ flex: 2 }}>
                  <label>Descripción</label>
                  <input
                    type="text"
                    value={feature.description}
                    onChange={(e) => updateFeature(index, 'description', e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    style={{
                      backgroundColor: '#ef4444',
                      color: 'white',
                      padding: '0.5rem',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: '#dc2626',
              color: 'white',
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '1rem'
            }}
          >
            {loading ? 'Guardando...' : (car ? 'Actualizar Auto' : 'Crear Auto')}
          </button>
        </form>
      </div>
    </AdminLayout>
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