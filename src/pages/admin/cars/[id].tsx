// pages/admin/cars/[id].tsx - Versión corregida
// EDITAR VEHÍCULO — VERSIÓN ACTUALIZADA PARA IMÁGENES Y VIDEOS

import { useState } from 'react'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { getSession } from 'next-auth/react'
import ImageUpload from '../../../components/ImageUpload'
import AdminLayout from '../../../components/AdminLayout'
import {prisma} from '../../../lib/prisma'

const BRANDS = [
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

type BrandType = typeof BRANDS[number]['value']

const CAR_TYPES = ['SEDAN', 'SUV', 'COUPE', 'HATCHBACK', 'TRUCK', 'CONVERTIBLE'] as const
type CarType = typeof CAR_TYPES[number]

const FUEL_TYPES = ['GASOLINE', 'DIESEL', 'ELECTRIC', 'HYBRID'] as const
type FuelType = typeof FUEL_TYPES[number]

const TRANSMISSIONS = ['AUTOMATIC', 'MANUAL'] as const
type TransmissionType = typeof TRANSMISSIONS[number]

const CATEGORIES = ['NEW', 'AUCTION'] as const
type CategoryType = typeof CATEGORIES[number]

// Definir tipos explícitamente
type MediaType = 'IMAGE' | 'VIDEO'

interface CarImage { 
  id: string
  url: string; 
  mediaType: MediaType;
  thumbnailUrl?: string;
  order: number; 
  isPrimary: boolean 
}

interface CarFeature { 
  id: string
  name: string; 
  description?: string 
}

// Definir el tipo para formData
interface FormData {
  title: string
  brand: BrandType
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
  images: CarImage[]
  features: CarFeature[]
}

interface Car {
  id: string
  title: string
  brand: BrandType
  model: string
  year: number
  price: number
  mileage: number
  color: string
  type: CarType
  fuelType: FuelType
  transmission: TransmissionType
  seats: number
  horsepower?: number
  fuelEconomy?: string
  category: CategoryType
  isFeatured: boolean
  description: string
  images: CarImage[]
  features: CarFeature[]
}

export default function EditCar({ car }: { car: Car }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [nextId, setNextId] = useState(car.images.length + 1)

  const [formData, setFormData] = useState<FormData>({
    title: car.title,
    brand: car.brand,
    model: car.model,
    year: car.year,
    price: car.price,
    mileage: car.mileage,
    color: car.color,
    type: car.type,
    fuelType: car.fuelType,
    transmission: car.transmission,
    seats: car.seats,
    horsepower: car.horsepower || 0,
    fuelEconomy: car.fuelEconomy || '',
    category: car.category,
    isFeatured: car.isFeatured,
    description: car.description,
    images: car.images.map(img => ({
      id: img.id,
      url: img.url,
      mediaType: img.mediaType || 'IMAGE',
      thumbnailUrl: img.thumbnailUrl || '',
      order: img.order,
      isPrimary: img.isPrimary,
    })),
    features: car.features.map(f => ({
      id: f.id,
      name: f.name,
      description: f.description || ''
    })),
  })

  // ==================== AGREGAR IMAGEN/VIDEO A LA GALERÍA ====================
  const handleImagesUpload = (uploadedFiles: any[]) => {
    if (uploadedFiles.length === 0) return

    const newImages: CarImage[] = uploadedFiles.map((file, i) => {
      const isVideo = file.type?.startsWith('video/') || file.url?.includes('.mp4') || file.url?.includes('.mov')
      
      return {
        id: `temp-${nextId + i}`,
        url: file.url,
        mediaType: isVideo ? 'VIDEO' : 'IMAGE',
        thumbnailUrl: isVideo ? '' : undefined,
        order: formData.images.length + i,
        isPrimary: formData.images.length === 0 && i === 0, // Primera imagen/video es principal si no hay ninguna
      }
    })

    setFormData(prev => ({ 
      ...prev, 
      images: [...prev.images, ...newImages] 
    }))
    setNextId(prev => prev + uploadedFiles.length)
  }

  // ==================== THUMBNAIL PARA VIDEOS ====================
  const handleThumbnailUpload = (index: number, files: any[]) => {
    if (files.length > 0) {
      setFormData(prev => ({
        ...prev,
        images: prev.images.map((img, i) => 
          i === index 
            ? { ...img, thumbnailUrl: files[0].url }
            : img
        )
      }))
    }
  }

  // ==================== ELIMINAR IMAGEN/VIDEO ====================
  const removeImage = (index: number) => {
    setFormData(prev => {
      const updatedImages = prev.images.filter((_, i) => i !== index)
      
      // Si eliminamos la imagen principal, asignar la siguiente como principal
      if (prev.images[index]?.isPrimary && updatedImages.length > 0) {
        updatedImages[0].isPrimary = true
      }
      
      return {
        ...prev,
        images: updatedImages
      }
    })
  }

  // ==================== HACER IMAGEN/VIDEO PRINCIPAL ====================
  const setPrimaryImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => ({
        ...img,
        isPrimary: i === index
      }))
    }))
  }

  // ==================== CARACTERÍSTICAS ====================
  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, { 
        id: `temp-${Date.now()}`, 
        name: '', 
        description: '' 
      }],
    }))
  }

  const updateFeature = (index: number, field: 'name' | 'description', value: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((f, i) => (i === index ? { ...f, [field]: value } : f)),
    }))
  }

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
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

    setSaving(true)
    
    try {
      // Preparar datos para la API
      const apiData = {
        ...formData,
        title: formData.title.trim(),
        year: Number(formData.year),
        price: Number(formData.price),
        mileage: Number(formData.mileage),
        seats: Number(formData.seats),
        horsepower: formData.horsepower ? Number(formData.horsepower) : null,
      }

      const res = await fetch(`/api/cars/${car.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData),
      })

      if (res.ok) {
        alert('Vehículo actualizado con éxito')
        router.push('/admin')
      } else {
        const err = await res.json()
        alert('Error: ' + (err.error || 'No se pudo guardar'))
      }
    } catch {
      alert('Error de conexión')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminLayout title="Editar Vehículo">
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f3f4f6',
        padding: '3rem 1rem',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '900',
            textAlign: 'center',
            color: '#1e40af',
            marginBottom: '3rem',
            textShadow: '2px 2px 10px rgba(0,0,0,0.1)'
          }}>
            EDITAR VEHÍCULO
          </h1>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>

            {/* INFORMACIÓN DEL VEHÍCULO */}
            <section style={{
              backgroundColor: 'white',
              borderRadius: '2rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
              overflow: 'hidden'
            }}>
              <div style={{
                background: 'linear-gradient(90deg, #dc2626, #991b1b)',
                color: 'white',
                padding: '2rem',
                fontSize: '1.5rem',
                fontWeight: 'bold'
              }}>
                Información del Vehículo
              </div>

              <div style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                {/* TÍTULO */}
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', fontSize: '1.5rem', color: '#7f1d1d', marginBottom: '0.75rem' }}>
                    Título del Anuncio *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                    required
                    style={{
                      width: '100%',
                      padding: '1.25rem',
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      backgroundColor: '#fef2f2',
                      border: '4px solid #fca5a5',
                      borderRadius: '1rem',
                      outline: 'none',
                      transition: 'all 0.3s'
                    }}
                    onFocus={e => e.target.style.borderColor = '#ef4444'}
                    onBlur={e => e.target.style.borderColor = '#fca5a5'}
                    placeholder="Ej: BMW M8 Competition 2024 - Full Extras"
                  />
                </div>

                {/* MARCA + MODELO */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 'bold', fontSize: '1.25rem', marginBottom: '0.5rem' }}>Marca *</label>
                    <select
                      value={formData.brand}
                      onChange={e => setFormData(p => ({ ...p, brand: e.target.value as BrandType }))}
                      required
                      style={{
                        width: '100%',
                        padding: '1rem',
                        fontSize: '1.25rem',
                        border: '3px solid #d1d5db',
                        borderRadius: '1rem',
                        backgroundColor: 'white',
                        outline: 'none'
                      }}
                    >
                      {BRANDS.map(b => (
                        <option key={b.value} value={b.value}>{b.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 'bold', fontSize: '1.25rem', marginBottom: '0.5rem' }}>Modelo / Versión *</label>
                    <input
                      type="text"
                      value={formData.model}
                      onChange={e => setFormData(p => ({ ...p, model: e.target.value }))}
                      required
                      style={{
                        width: '100%',
                        padding: '1rem',
                        fontSize: '1.25rem',
                        border: '3px solid #d1d5db',
                        borderRadius: '1rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                {/* AÑO / PRECIO / KM */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem' }}>
                  {[
                    { label: 'Año *', value: formData.year, key: 'year' },
                    { label: 'Precio (CLP) *', value: formData.price, key: 'price' },
                    { label: 'Kilometraje *', value: formData.mileage, key: 'mileage' }
                  ].map(item => (
                    <div key={item.key}>
                      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>{item.label}</label>
                      <input
                        type="number"
                        value={item.value}
                        onChange={e => setFormData(p => ({ ...p, [item.key]: Number(e.target.value) }))}
                        required
                        style={{
                          width: '100%',
                          padding: '1rem',
                          fontSize: '1.25rem',
                          border: '3px solid #d1d5db',
                          borderRadius: '1rem',
                          outline: 'none'
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* TIPO / COMBUSTIBLE / TRANSMISIÓN */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Tipo *</label>
                    <select
                      value={formData.type}
                      onChange={e => setFormData(p => ({ ...p, type: e.target.value as CarType }))}
                      style={{ width: '100%', padding: '1rem', fontSize: '1.25rem', border: '3px solid #d1d5db', borderRadius: '1rem' }}
                    >
                      {CAR_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Combustible *</label>
                    <select
                      value={formData.fuelType}
                      onChange={e => setFormData(p => ({ ...p, fuelType: e.target.value as FuelType }))}
                      style={{ width: '100%', padding: '1rem', fontSize: '1.25rem', border: '3px solid #d1d5db', borderRadius: '1rem' }}
                    >
                      {FUEL_TYPES.map(f => (
                        <option key={f} value={f}>
                          {f === 'GASOLINE' ? 'Gasolina' : f === 'DIESEL' ? 'Diésel' : f === 'ELECTRIC' ? 'Eléctrico' : 'Híbrido'}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Transmisión *</label>
                    <select
                      value={formData.transmission}
                      onChange={e => setFormData(p => ({ ...p, transmission: e.target.value as TransmissionType }))}
                      style={{ width: '100%', padding: '1rem', fontSize: '1.25rem', border: '3px solid #d1d5db', borderRadius: '1rem' }}
                    >
                      {TRANSMISSIONS.map(t => (
                        <option key={t} value={t}>{t === 'AUTOMATIC' ? 'Automática' : 'Manual'}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* COLOR / ASIENTOS / HP / ECONOMÍA */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Color *</label>
                    <input
                      type="text"
                      value={formData.color}
                      onChange={e => setFormData(p => ({ ...p, color: e.target.value }))}
                      required
                      style={{ width: '100%', padding: '1rem', fontSize: '1.25rem', border: '3px solid #d1d5db', borderRadius: '1rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Asientos *</label>
                    <input
                      type="number"
                      value={formData.seats}
                      onChange={e => setFormData(p => ({ ...p, seats: Number(e.target.value) }))}
                      required
                      style={{ width: '100%', padding: '1rem', fontSize: '1.25rem', border: '3px solid #d1d5db', borderRadius: '1rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Caballos de fuerza</label>
                    <input
                      type="number"
                      value={formData.horsepower || ''}
                      onChange={e => setFormData(p => ({ ...p, horsepower: Number(e.target.value) || 0 }))}
                      style={{ width: '100%', padding: '1rem', fontSize: '1.25rem', border: '3px solid #d1d5db', borderRadius: '1rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>Economía de combustible</label>
                    <input
                      type="text"
                      value={formData.fuelEconomy}
                      onChange={e => setFormData(p => ({ ...p, fuelEconomy: e.target.value }))}
                      placeholder="Ej: 12 km/l ciudad"
                      style={{ width: '100%', padding: '1rem', fontSize: '1.25rem', border: '3px solid #d1d5db', borderRadius: '1rem' }}
                    />
                  </div>
                </div>

                {/* DESTACADO + CATEGORÍA + DESCRIPCIÓN */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
                      <input
                        type="checkbox"
                        checked={formData.isFeatured}
                        onChange={e => setFormData(p => ({ ...p, isFeatured: e.target.checked }))}
                        style={{ width: '2rem', height: '2rem' }}
                      />
                      Vehículo destacado
                    </label>

                    <div>
                      <p style={{ fontWeight: 'bold', fontSize: '1.5rem', marginBottom: '1rem' }}>Categoría *</p>
                      {CATEGORIES.map(c => (
                        <label key={c} style={{ display: 'block', marginBottom: '1rem', fontSize: '1.25rem' }}>
                          <input
                            type="radio"
                            name="category"
                            value={c}
                            checked={formData.category === c}
                            onChange={e => setFormData(p => ({ ...p, category: e.target.value as CategoryType }))}
                            style={{ marginRight: '1rem', transform: 'scale(1.5)' }}
                          />
                          {c === 'NEW' ? 'Semi nuevo' : 'Remate'}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: 'bold', fontSize: '1.5rem', marginBottom: '1rem' }}>Descripción completa</label>
                    <textarea
                      value={formData.description}
                      onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                      rows={10}
                      style={{
                        width: '100%',
                        padding: '1.5rem',
                        fontSize: '1.25rem',
                        border: '3px solid #d1d5db',
                        borderRadius: '1.5rem',
                        resize: 'none',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* GALERÍA DE IMÁGENES Y VIDEOS */}
            <section style={{
              backgroundColor: 'white',
              borderRadius: '2rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
              overflow: 'hidden'
            }}>
              <div style={{
                background: 'linear-gradient(90deg, #dc2626, #991b1b)',
                color: 'white',
                padding: '2rem',
                fontSize: '1.5rem',
                fontWeight: 'bold'
              }}>
                Galería de Imágenes y Videos ({formData.images.length})
              </div>
              <div style={{ padding: '2.5rem' }}>
                <div style={{ marginBottom: '2rem' }}>
                  <p style={{ color: '#666', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
                    Sube imágenes y/o videos del vehículo. Puedes mezclar ambos tipos.
                    <br />
                    <span style={{ color: '#dc2626', fontWeight: 'bold' }}>
                      * Los videos requieren un thumbnail (imagen de portada)
                    </span>
                  </p>
                  
                  <ImageUpload 
                    onFilesUpload={handleImagesUpload} 
                    multiple={true} 
                    uploadType="cars" 
                    accept="image/*,video/*"
                    label="Haz clic para subir imágenes o videos"
                    maxFiles={20} 
                  />
                  
                  <div style={{ marginTop: '1rem', color: '#666', fontSize: '0.9rem' }}>
                    <p>📸 Imágenes: JPG, PNG, GIF</p>
                    <p>🎥 Videos: MP4, MOV, AVI</p>
                  </div>
                </div>

                {formData.images.length > 0 && (
                  <div style={{
                    marginTop: '3rem',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '2rem'
                  }}>
                    {formData.images.map((img, i) => (
                      <div key={img.id} style={{
                        position: 'relative',
                        borderRadius: '1.5rem',
                        overflow: 'hidden',
                        border: img.isPrimary ? '8px solid #dc2626' : '4px solid #e5e7eb',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                        transition: 'all 0.3s',
                        background: '#f9fafb'
                      }}>
                        {/* Vista previa según tipo */}
                        {img.mediaType === 'IMAGE' ? (
                          <img src={img.url} alt="" style={{ width: '100%', height: '250px', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ position: 'relative', height: '250px' }}>
                            {/* Si tiene thumbnail, mostrarlo */}
                            {img.thumbnailUrl ? (
                              <img 
                                src={img.thumbnailUrl} 
                                alt="Video thumbnail" 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
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
                              top: '1rem', 
                              right: '1rem', 
                              background: 'rgba(0,0,0,0.7)', 
                              color: 'white', 
                              padding: '0.5rem 1rem', 
                              borderRadius: '20px',
                              fontSize: '0.9rem',
                              fontWeight: 'bold'
                            }}>
                              VIDEO
                            </div>
                          </div>
                        )}
                        
                        <div style={{
                          position: 'absolute',
                          top: '1rem',
                          right: '1rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.5rem'
                        }}>
                          <button
                            type="button"
                            onClick={() => setPrimaryImage(i)}
                            style={{
                              padding: '0.75rem 1.5rem',
                              backgroundColor: img.isPrimary ? '#dc2626' : '#1f2937',
                              color: 'white',
                              border: 'none',
                              borderRadius: '1rem',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {img.isPrimary ? 'Principal' : 'Hacer Principal'}
                          </button>
                          <button
                            type="button"
                            onClick={() => removeImage(i)}
                            style={{
                              width: '50px',
                              height: '50px',
                              backgroundColor: '#dc2626',
                              color: 'white',
                              border: 'none',
                              borderRadius: '50%',
                              fontSize: '1.5rem',
                              cursor: 'pointer',
                              alignSelf: 'flex-end'
                            }}
                          >×</button>
                        </div>
                        
                        {/* Para videos: subir thumbnail si no tiene */}
                        {img.mediaType === 'VIDEO' && !img.thumbnailUrl && (
                          <div style={{ 
                            position: 'absolute', 
                            bottom: '80px', 
                            left: '1rem', 
                            right: '1rem' 
                          }}>
                            <div style={{
                              background: '#3b82f6',
                              color: 'white',
                              padding: '0.75rem',
                              borderRadius: '0.75rem',
                              textAlign: 'center',
                              fontWeight: 'bold',
                              fontSize: '0.9rem',
                              cursor: 'pointer'
                            }}>
                              <ImageUpload
                                onFilesUpload={(files) => handleThumbnailUpload(i, files)}
                                multiple={false}
                                uploadType="cars"
                                accept="image/*"
                                label="Subir thumbnail"
                              />
                            </div>
                          </div>
                        )}
                        
                        {img.isPrimary && (
                          <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            backgroundColor: '#dc2626',
                            color: 'white',
                            textAlign: 'center',
                            padding: '1rem',
                            fontWeight: 'bold',
                            fontSize: '1.1rem'
                          }}>
                            {img.mediaType === 'IMAGE' ? 'IMAGEN PRINCIPAL' : 'VIDEO PRINCIPAL'}
                          </div>
                        )}
                        
                        {/* Info del medio */}
                        <div style={{ 
                          position: 'absolute',
                          bottom: img.isPrimary ? '50px' : '10px',
                          left: '10px',
                          background: 'rgba(0,0,0,0.7)',
                          color: 'white',
                          padding: '0.5rem 1rem',
                          borderRadius: '20px',
                          fontSize: '0.8rem',
                          fontWeight: 'bold'
                        }}>
                          {img.mediaType === 'IMAGE' ? '📸 Imagen' : '🎥 Video'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* CARACTERÍSTICAS */}
            <section style={{
              backgroundColor: 'white',
              borderRadius: '2rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
              overflow: 'hidden'
            }}>
              <div style={{
                background: 'linear-gradient(90deg, #1e40af, #1e3a8a)',
                color: 'white',
                padding: '2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Características Extras</h2>
                <button
                  type="button"
                  onClick={addFeature}
                  style={{
                    padding: '1rem 2rem',
                    backgroundColor: 'white',
                    color: '#1e40af',
                    border: 'none',
                    borderRadius: '1rem',
                    fontWeight: 'bold',
                    fontSize: '1.25rem',
                    cursor: 'pointer'
                  }}
                >
                  + Agregar Característica
                </button>
              </div>
              <div style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {formData.features.map((f, i) => (
                  <div key={f.id} style={{ display: 'block', gridTemplateColumns: '1fr 1fr auto', gap: '1.5rem', alignItems: 'end' }}>
                    <input
                      type="text"
                      placeholder="Nombre (ej: Techo panorámico)"
                      value={f.name}
                      onChange={e => updateFeature(i, 'name', e.target.value)}
                      style={{
                        width: '60%',
                        padding: '1rem',
                        fontSize: '1.25rem',
                        border: '3px solid #d1d5db',
                        borderRadius: '1rem',
                        marginRight: '1.5rem'
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Descripción (opcional)"
                      value={f.description || ''}
                      onChange={e => updateFeature(i, 'description', e.target.value)}
                      style={{
                        display: 'none',
                        width: '60%',
                        padding: '1rem',
                        fontSize: '1.25rem',
                        border: '3px solid #d1d5db',
                        borderRadius: '1rem',
                        marginRight: '1.5rem'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeFeature(i)}
                      style={{
                        padding: '1rem 2rem',
                        backgroundColor: '#dc2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '1rem',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* BOTONES FINALES */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '2rem', marginTop: '4rem' }}>
              <button
                type="button"
                onClick={() => router.push('/admin')}
                style={{
                  padding: '1.5rem 4rem',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '2rem',
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                style={{
                  padding: '1.75rem 6rem',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '2rem',
                  fontSize: '1.5rem',
                  fontWeight: '900',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.7 : 1
                }}
              >
                {saving ? 'Guardando...' : 'Actualizar Vehículo'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession({ req: context.req })

  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    }
  }

  const { id } = context.params as { id: string }

  try {
    const car = await prisma.car.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: [{ isPrimary: 'desc' }, { order: 'asc' }],
        },
        features: true,
      },
    })

    if (!car) {
      return { notFound: true }
    }

    // CONVERSIÓN DE FECHAS A STRING
    const serializedCar: Car = {
      ...car,
      createdAt: car.createdAt.toISOString(),
      updatedAt: car.updatedAt.toISOString(),
      images: car.images.map(img => ({
        id: img.id,
        url: img.url,
        mediaType: (img.mediaType as MediaType) || 'IMAGE',
        thumbnailUrl: img.thumbnailUrl || '',
        order: img.order,
        isPrimary: img.isPrimary,
      })),
      features: car.features.map(f => ({
        id: f.id,
        name: f.name,
        description: f.description || '',
      })),
      horsepower: car.horsepower || undefined,
      fuelEconomy: car.fuelEconomy || undefined,
    } as Car

    return {
      props: {
        car: serializedCar,
      },
    }
  } catch (error) {
    console.error('Error cargando vehículo:', error)
    return { notFound: true }
  }
}