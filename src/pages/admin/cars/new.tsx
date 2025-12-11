// pages/admin/cars/new.tsx
import { useState } from 'react'
import { getSession } from 'next-auth/react'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import ImageUpload from '../../../components/ImageUpload'
import AdminLayout from '../../../components/AdminLayout'

const MARCAS = [
  { value: 'BMW', label: 'BMW' },
  { value: 'MERCEDES_BENZ', label: 'Mercedes-Benz' },
  { value: 'PORSCHE', label: 'Porsche' },
  { value: 'TESLA', label: 'Tesla' },
  { value: 'AUDI', label: 'Audi' },
  { value: 'LEXUS', label: 'Lexus' },
  { value: 'CADILLAC', label: 'Cadillac' },
  { value: 'DODGE', label: 'Dodge' },
  { value: 'FORD', label: 'Ford' },
  { value: 'JEEP', label: 'Jeep' },
  { value: 'VOLKSWAGEN', label: 'Volkswagen' },
] as const

type MarcaType = typeof MARCAS[number]['value']

const carTypes = ['SEDAN', 'SUV', 'COUPE', 'HATCHBACK', 'TRUCK', 'CONVERTIBLE'] as const
type CarType = typeof carTypes[number]

const fuelTypes = ['GASOLINE', 'DIESEL', 'ELECTRIC', 'HYBRID'] as const
type FuelType = typeof fuelTypes[number]

const transmissionTypes = ['AUTOMATIC', 'MANUAL'] as const
type TransmissionType = typeof transmissionTypes[number]

const categories = ['NEW', 'AUCTION'] as const
type CategoryType = typeof categories[number]

// Definición del tipo para el formulario
interface FormData {
  title: string
  brand: MarcaType
  model: string
  year: number
  price: number
  mileage: number
  color: string
  type: CarType
  fuelType: FuelType
  transmission: TransmissionType
  seats: number
  horsepower: number
  fuelEconomy: string
  category: CategoryType
  isFeatured: boolean
  description: string
  images: { 
    url: string; 
    mediaType: 'IMAGE' | 'VIDEO'; 
    thumbnailUrl?: string; 
    order: number; 
    isPrimary: boolean 
  }[]
  features: { name: string; description?: string }[]
}

export default function NewCarForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [nextId, setNextId] = useState(1)

  const [formData, setFormData] = useState<FormData>({
    title: '',
    brand: 'BMW',
    model: '',
    year: new Date().getFullYear(),
    price: 0,
    mileage: 0,
    color: '',
    type: 'SEDAN',
    fuelType: 'GASOLINE',
    transmission: 'AUTOMATIC',
    seats: 5,
    horsepower: 0,
    fuelEconomy: '',
    category: 'NEW',
    isFeatured: false,
    description: '',
    
    // Imágenes (ahora pueden ser imágenes o videos)
    images: [],
    
    // Características
    features: []
  })

  // ==================== AGREGAR IMAGEN/VIDEO A LA GALERÍA ====================
  const handleMediaUpload = (uploadedFiles: any[]) => {
    if (uploadedFiles.length === 0) return

    const newImages = uploadedFiles.map((file, index) => {
      const isVideo = file.type.startsWith('video/')
      
      return {
        id: nextId + index,
        url: file.url,
        mediaType: isVideo ? 'VIDEO' as const : 'IMAGE' as const,
        thumbnailUrl: isVideo ? '' : undefined,
        order: formData.images.length + index,
        isPrimary: formData.images.length === 0 && index === 0 // Primera imagen/video es principal
      }
    })

    setFormData(p => ({
      ...p,
      images: [...p.images, ...newImages]
    }))
    
    setNextId(prev => prev + uploadedFiles.length)
  }

  // ==================== THUMBNAIL PARA VIDEOS ====================
  const handleThumbnailUpload = (index: number, files: any[]) => {
    if (files.length > 0) {
      setFormData(p => ({
        ...p,
        images: p.images.map((img, i) => 
          i === index 
            ? { ...img, thumbnailUrl: files[0].url }
            : img
        )
      }))
    }
  }

  // ==================== ELIMINAR IMAGEN/VIDEO DE LA GALERÍA ====================
  const removeImage = (index: number) => {
    setFormData(p => {
      const updatedImages = p.images.filter((_, i) => i !== index)
      
      // Si eliminamos la imagen principal, asignar la siguiente como principal
      if (p.images[index]?.isPrimary && updatedImages.length > 0) {
        updatedImages[0].isPrimary = true
      }
      
      return {
        ...p,
        images: updatedImages
      }
    })
  }

  // ==================== HACER IMAGEN/VIDEO PRINCIPAL ====================
  const setPrimaryImage = (index: number) => {
    setFormData(p => ({
      ...p,
      images: p.images.map((img, i) => ({
        ...img,
        isPrimary: i === index
      }))
    }))
  }

  // ==================== CARACTERÍSTICAS ====================
  const addFeature = () => {
    setFormData(p => ({ 
      ...p, 
      features: [...p.features, { name: '', description: '' }] 
    }))
  }

  const updateFeature = (i: number, field: 'name' | 'description', v: string) => {
    setFormData(p => ({
      ...p,
      features: p.features.map((f, idx) => 
        idx === i ? { ...f, [field]: v } : f
      )
    }))
  }

  const removeFeature = (i: number) => {
    setFormData(p => ({ 
      ...p, 
      features: p.features.filter((_, idx) => idx !== i) 
    }))
  }

  // ==================== ENVÍO CON VALIDACIÓN ====================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validaciones básicas
    if (!formData.title.trim()) return alert('El título es obligatorio')
    if (!formData.brand || !formData.model.trim()) return alert('Marca y modelo obligatorios')
    
    // Validar imágenes
    if (formData.images.length === 0) {
      return alert('Debes subir al menos una imagen o video')
    }
    
    // Validar que haya al menos una imagen/video principal
    const hasPrimary = formData.images.some(img => img.isPrimary)
    if (!hasPrimary) {
      return alert('Debes seleccionar una imagen o video principal')
    }
    
    // Validar thumbnails para videos
    const videosWithoutThumbnail = formData.images.filter(
      img => img.mediaType === 'VIDEO' && !img.thumbnailUrl
    )
    
    if (videosWithoutThumbnail.length > 0) {
      return alert('Todos los videos deben tener un thumbnail (imagen de portada)')
    }

    setLoading(true)

    try {
      // Preparar datos para la API
      const apiData = {
        ...formData,
        year: Number(formData.year),
        price: Number(formData.price),
        mileage: Number(formData.mileage),
        seats: Number(formData.seats),
        horsepower: formData.horsepower ? Number(formData.horsepower) : null,
      }

      const response = await fetch('/api/cars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData)
      })

      if (response.ok) {
        alert('Vehículo creado con éxito')
        router.push('/admin')
      } else {
        const err = await response.json()
        alert('Error: ' + (err.error || 'No se pudo guardar'))
      }
    } catch (err) {
      alert('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout title="Nuevo Vehículo">
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: '900', color: '#1e40af', textAlign: 'center', marginBottom: '3rem' }}>
          Nuevo Vehículo
        </h1>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '3rem' }}>

          {/* ==================== INFORMACIÓN DEL VEHÍCULO ==================== */}
          <section style={{ background: 'white', padding: '3rem', borderRadius: '20px', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}>
            <h2 style={{ color: '#dc2626', fontSize: '2.2rem', marginBottom: '2rem' }}>
              Información del Vehículo
            </h2>

            {/* Título */}
            <div style={{ marginBottom: '2.5rem' }}>
              <label style={{ display: 'block', fontWeight: 'bold', fontSize: '1.3rem', marginBottom: '1rem', color: '#991b1b' }}>
                Título*
              </label>
              <input
                type="text"
                placeholder="Ej: BMW M5 Competition 2024 - Full Extras - Único Dueño"
                value={formData.title}
                onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                required
                style={{ width: '100%', padding: '1.4rem', fontSize: '1.4rem', fontWeight: 'bold', border: '3px solid #fecaca', borderRadius: '14px', backgroundColor: '#fff1f2' }}
              />
            </div>

            {/* Marca + Modelo */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', marginBottom: '2.5rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '1rem' }}>Marca *</label>
                <select
                  value={formData.brand}
                  onChange={e => setFormData(p => ({ ...p, brand: e.target.value as MarcaType }))}
                  required
                  style={{ width: '100%', padding: '1.3rem', borderRadius: '12px', border: '2px solid #e5e7eb', fontSize: '1.2rem', backgroundColor: '#f9fafb' }}
                >
                  {MARCAS.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '1rem' }}>Modelo / Versión *</label>
                <input
                  type="text"
                  placeholder="Ej: M5 Competition"
                  value={formData.model}
                  onChange={e => setFormData(p => ({ ...p, model: e.target.value }))}
                  required
                  style={{ width: '100%', padding: '1.3rem', borderRadius: '12px', border: '2px solid #e5e7eb', fontSize: '1.2rem' }}
                />
              </div>
            </div>

            {/* Año / Precio / Kilometraje */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2.5rem', marginBottom: '2.5rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.8rem' }}>Año *</label>
                <input type="number" value={formData.year} onChange={e => setFormData(p => ({ ...p, year: Number(e.target.value) }))} required style={{ width: '100%', padding: '1.2rem', borderRadius: '12px', border: '2px solid #e5e7eb' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.8rem' }}>Precio (CLP) *</label>
                <input type="number" value={formData.price} onChange={e => setFormData(p => ({ ...p, price: Number(e.target.value) }))} required style={{ width: '100%', padding: '1.2rem', borderRadius: '12px', border: '2px solid #e5e7eb' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.8rem' }}>Kilometraje *</label>
                <input type="number" value={formData.mileage} onChange={e => setFormData(p => ({ ...p, mileage: Number(e.target.value) }))} required style={{ width: '100%', padding: '1.2rem', borderRadius: '12px', border: '2px solid #e5e7eb' }} />
              </div>
            </div>

            {/* Tipo / Combustible / Transmisión */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2.5rem', marginBottom: '2.5rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.8rem' }}>Tipo *</label>
                <select value={formData.type} onChange={e => setFormData(p => ({ ...p, type: e.target.value as CarType }))} style={{ width: '100%', padding: '1.2rem', borderRadius: '12px', border: '2px solid #e5e7eb' }}>
                  {carTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.8rem' }}>Combustible *</label>
                <select value={formData.fuelType} onChange={e => setFormData(p => ({ ...p, fuelType: e.target.value as FuelType }))} style={{ width: '100%', padding: '1.2rem', borderRadius: '12px', border: '2px solid #e5e7eb' }}>
                  {fuelTypes.map(t => <option key={t} value={t}>{t === 'GASOLINE' ? 'Gasolina' : t === 'DIESEL' ? 'Diésel' : t === 'ELECTRIC' ? 'Eléctrico' : 'Híbrido'}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.8rem' }}>Transmisión *</label>
                <select value={formData.transmission} onChange={e => setFormData(p => ({ ...p, transmission: e.target.value as TransmissionType }))} style={{ width: '100%', padding: '1.2rem', borderRadius: '12px', border: '2px solid #e5e7eb' }}>
                  {transmissionTypes.map(t => <option key={t} value={t}>{t === 'AUTOMATIC' ? 'Automática' : 'Manual'}</option>)}
                </select>
              </div>
            </div>

            {/* Color / Asientos */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', marginBottom: '2.5rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.8rem' }}>Color *</label>
                <input type="text" value={formData.color} onChange={e => setFormData(p => ({ ...p, color: e.target.value }))} required style={{ width: '100%', padding: '1.2rem', borderRadius: '12px', border: '2px solid #e5e7eb' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.8rem' }}>Asientos *</label>
                <input type="number" value={formData.seats} onChange={e => setFormData(p => ({ ...p, seats: Number(e.target.value) }))} required style={{ width: '100%', padding: '1.2rem', borderRadius: '12px', border: '2px solid #e5e7eb' }} />
              </div>
            </div>

            {/* HP / Economía */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', marginBottom: '2.5rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.8rem' }}>Caballos de fuerza</label>
                <input type="number" value={formData.horsepower || ''} onChange={e => setFormData(p => ({ ...p, horsepower: Number(e.target.value) || 0 }))} style={{ width: '100%', padding: '1.2rem', borderRadius: '12px', border: '2px solid #e5e7eb' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.8rem' }}>Economía de combustible</label>
                <input type="text" value={formData.fuelEconomy} onChange={e => setFormData(p => ({ ...p, fuelEconomy: e.target.value }))} placeholder="Ej: 12 km/l ciudad - 18 km/l carretera" style={{ width: '100%', padding: '1.2rem', borderRadius: '12px', border: '2px solid #e5e7eb' }} />
              </div>
            </div>

            {/* Destacado + Categoría + Descripción */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', marginBottom: '2rem' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontWeight: 'bold', fontSize: '1.2rem' }}>
                  <input type="checkbox" checked={formData.isFeatured} onChange={e => setFormData(p => ({ ...p, isFeatured: e.target.checked }))} />
                  Vehículo destacado
                </label>

                <div style={{ marginTop: '2rem' }}>
                  <strong style={{ display: 'block', marginBottom: '1rem' }}>Categoría *</strong>
                  {categories.map(c => (
                    <label key={c} style={{ display: 'block', marginBottom: '0.8rem' }}>
                      <input type="radio" name="cat" value={c} checked={formData.category === c} onChange={e => setFormData(p => ({ ...p, category: e.target.value as CategoryType }))} />
                      {' '}{c === 'NEW' ? 'Semi nuevo' : 'Remate'}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '1rem', fontSize: '1.2rem' }}>Descripción completa</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                  rows={8}
                  style={{ width: '100%', padding: '1.4rem', borderRadius: '14px', border: '2px solid #e5e7eb', fontSize: '1.1rem' }}
                />
              </div>
            </div>
          </section>

          {/* ==================== GALERÍA DE IMÁGENES Y VIDEOS ==================== */}
          <section style={{ background: 'white', padding: '3rem', borderRadius: '20px', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}>
            <h2 style={{ color: '#dc2626', fontSize: '2.2rem', marginBottom: '2rem' }}>
              Galería de Imágenes y Videos
            </h2>
            
            <div style={{ marginBottom: '2rem' }}>
              <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                Sube imágenes y/o videos del vehículo. Puedes mezclar ambos tipos.
                <br />
                <strong>Total actual: {formData.images.length} medios</strong>
                <br />
                <small>Primer medio subido se marcará como principal automáticamente.</small>
              </p>
              
              <ImageUpload
                onFilesUpload={handleMediaUpload}
                multiple={true}
                uploadType="cars"
                accept="image/*,video/*"
                label="Haz clic para subir imágenes o videos"
                maxFiles={20}
              />
              
              <div style={{ marginTop: '1rem', color: '#666', fontSize: '0.9rem' }}>
                <p>📸 Imágenes: JPG, PNG, GIF</p>
                <p>🎥 Videos: MP4, MOV, AVI</p>
                <p style={{ color: '#dc2626' }}>
                  * Los videos requieren un thumbnail (imagen de portada)
                </p>
              </div>
            </div>

            {/* Vista previa de galería */}
            {formData.images.length > 0 && (
              <div>
                <h3 style={{ color: '#dc2626', marginBottom: '1.5rem' }}>
                  Medios subidos ({formData.images.length})
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
                  {formData.images.map((img, index) => (
                    <div 
                      key={index} 
                      style={{ 
                        position: 'relative', 
                        border: img.isPrimary ? '5px solid #dc2626' : '2px solid #e5e7eb', 
                        borderRadius: '16px', 
                        overflow: 'hidden', 
                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                        background: '#f9fafb'
                      }}
                    >
                      {/* Vista previa según tipo */}
                      {img.mediaType === 'IMAGE' ? (
                        <img 
                          src={img.url} 
                          alt="" 
                          style={{ 
                            width: '100%', 
                            height: '180px', 
                            objectFit: 'cover',
                            display: 'block'
                          }} 
                        />
                      ) : (
                        <div style={{ position: 'relative', height: '180px' }}>
                          {/* Si tiene thumbnail, mostrarlo */}
                          {img.thumbnailUrl ? (
                            <img 
                              src={img.thumbnailUrl} 
                              alt="Video thumbnail" 
                              style={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'cover'
                              }} 
                            />
                          ) : (
                            <div style={{ 
                              width: '100%', 
                              height: '100%', 
                              background: '#1f2937',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white'
                            }}>
                              <span style={{ fontSize: '3rem' }}>🎥</span>
                            </div>
                          )}
                          
                          {/* Icono de video */}
                          <div style={{ 
                            position: 'absolute', 
                            top: '10px', 
                            right: '10px', 
                            background: 'rgba(0,0,0,0.7)', 
                            color: 'white', 
                            padding: '5px 10px', 
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            fontWeight: 'bold'
                          }}>
                            VIDEO
                          </div>
                        </div>
                      )}
                      
                      {/* Controles */}
                      <div style={{ padding: '1rem', background: 'white' }}>
                        {/* Botón para hacer principal */}
                        <button 
                          type="button" 
                          onClick={() => setPrimaryImage(index)}
                          style={{ 
                            width: '100%',
                            background: img.isPrimary ? '#dc2626' : '#374151', 
                            color: 'white', 
                            padding: '0.8rem',
                            borderRadius: '8px', 
                            fontWeight: 'bold',
                            marginBottom: '0.5rem',
                            border: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          {img.isPrimary ? '⭐ Principal' : 'Hacer Principal'}
                        </button>
                        
                        {/* Para videos: subir thumbnail */}
                        {img.mediaType === 'VIDEO' && !img.thumbnailUrl && (
                          <div style={{ marginBottom: '0.5rem' }}>
                            <ImageUpload
                              onFilesUpload={(files) => handleThumbnailUpload(index, files)}
                              multiple={false}
                              uploadType="cars"
                              accept="image/*"
                              label="Subir thumbnail"
                              
                            />
                          </div>
                        )}
                        
                        {/* Botón eliminar */}
                        <button 
                          type="button" 
                          onClick={() => removeImage(index)}
                          style={{ 
                            width: '100%',
                            background: '#ef4444', 
                            color: 'white', 
                            padding: '0.8rem',
                            borderRadius: '8px', 
                            fontWeight: 'bold',
                            border: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          Eliminar
                        </button>
                        
                        {/* Info del medio */}
                        <div style={{ 
                          marginTop: '0.5rem',
                          fontSize: '0.8rem',
                          color: '#666',
                          textAlign: 'center'
                        }}>
                          {img.mediaType === 'IMAGE' ? '📸 Imagen' : '🎥 Video'}
                          {img.isPrimary && ' • Principal'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* ==================== CARACTERÍSTICAS EXTRAS ==================== */}
          <section style={{ background: 'white', padding: '3rem', borderRadius: '20px', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ color: '#dc2626', fontSize: '2rem' }}>Características Extras</h2>
              <button 
                type="button" 
                onClick={addFeature}
                style={{ 
                  background: '#1e40af', 
                  color: 'white', 
                  padding: '1rem 2rem', 
                  borderRadius: '12px', 
                  fontWeight: 'bold', 
                  fontSize: '1.1rem' 
                }}
              >
                + Agregar Característica
              </button>
            </div>

            {formData.features.map((f, i) => (
              <div 
                key={i} 
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '3fr 1fr 100px', 
                  gap: '1.5rem', 
                  marginBottom: '1.5rem', 
                  alignItems: 'end' 
                }}
              >
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Nombre</label>
                  <input
                    type="text"
                    placeholder="Ej: Techo Solar"
                    value={f.name}
                    onChange={e => updateFeature(i, 'name', e.target.value)}
                    style={{ width: '100%', padding: '1rem', borderRadius: '10px', border: '2px solid #e5e7eb' }}
                  />
                </div>
                <div style={{display:'none'}}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Descripción (opcional)</label>
                  <input
                    type="text"
                    placeholder="Ej: Techo panorámico eléctrico"
                    value={f.description || ''}
                    onChange={e => updateFeature(i, 'description', e.target.value)}
                    style={{ width: '100%', padding: '1rem', borderRadius: '10px', border: '2px solid #e5e7eb' }}
                  />
                </div>
                <button 
                  type="button" 
                  onClick={() => removeFeature(i)}
                  style={{ 
                    background: '#ef4444', 
                    color: 'white', 
                    padding: '1rem', 
                    borderRadius: '10px',
                    height: 'fit-content'
                  }}
                >
                  Eliminar
                </button>
              </div>
            ))}
          </section>

          {/* ==================== BOTONES ==================== */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '2.5rem' }}>
            <button 
              type="button" 
              onClick={() => router.push('/admin')}
              style={{ 
                padding: '0.9rem 2rem', 
                background: '#6b7280', 
                color: 'white', 
                borderRadius: '16px', 
                fontSize: '1rem', 
                fontWeight: 'bold' 
              }}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                padding: '1rem 3rem', 
                background: '#dc2626', 
                color: 'white', 
                borderRadius: '16px', 
                fontWeight: '900', 
                boxShadow: '0 10px 30px rgba(220,38,38,0.4)',
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Guardando...' : 'Crear Vehículo'}
            </button>
          </div>
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
  return { props: {} }
}