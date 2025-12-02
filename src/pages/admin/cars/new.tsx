// pages/admin/cars/new.tsx   ← También funciona perfecto como [id].tsx
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
] as const

const carTypes = ['SEDAN', 'SUV', 'COUPE', 'HATCHBACK', 'TRUCK', 'CONVERTIBLE'] as const
const fuelTypes = ['GASOLINE', 'DIESEL', 'ELECTRIC', 'HYBRID'] as const
const transmissionTypes = ['AUTOMATIC', 'MANUAL'] as const
const categories = ['NEW', 'AUCTION'] as const

export default function CarForm({ car }: { car?: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    title: car?.title || '',
    brand: car?.brand || 'BMW',
    model: car?.model || '',
    year: car?.year || new Date().getFullYear(),
    price: car?.price || 0,
    mileage: car?.mileage || 0,
    color: car?.color || '',
    type: car?.type || 'SEDAN',
    fuelType: car?.fuelType || 'GASOLINE',
    transmission: car?.transmission || 'AUTOMATIC',
    seats: car?.seats || 5,
    horsepower: car?.horsepower || 0,
    fuelEconomy: car?.fuelEconomy || '',
    category: car?.category || 'NEW',
    isFeatured: car?.isFeatured || false,
    description: car?.description || '',
    images: (car?.images ?? []) as { url: string; order: number; isPrimary: boolean }[],
    features: (car?.features ?? []) as { name: string; description?: string }[]
    })

  // ==================== IMÁGENES ====================
  const handleImagesUpload = (uploadedFiles: any[]) => {
    const newImages = uploadedFiles.map((file, i) => ({
      url: file.url,
      order: formData.images.length + i,
      isPrimary: formData.images.length === 0 && i === 0
    }))
    setFormData(prev => ({ ...prev, images: [...prev.images, ...newImages] }))
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
      images: prev.images.map((img, i) => ({ ...img, isPrimary: i === index }))
    }))
  }

  // ==================== CARACTERÍSTICAS ====================
  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, { name: '', description: '' }]
    }))
  }

  const updateFeature = (index: number, field: 'name' | 'description', value: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((f, i) => i === index ? { ...f, [field]: value } : f)
    }))
  }

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }))
  }

  // ==================== ENVÍO ====================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) return alert('El título es obligatorio')
    if (!formData.brand) return alert('Selecciona una marca')
    if (!formData.model.trim()) return alert('El modelo es obligatorio')
    if (formData.images.length < 3) return alert('Sube al menos 3 imágenes')
    if (!formData.images.some(img => img.isPrimary)) return alert('Selecciona una imagen principal')

    setLoading(true)

    try {
      const url = car ? `/api/cars/${car.id}` : '/api/cars'
      const method = car ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          title: formData.title.trim(),
          year: Number(formData.year),
          price: Number(formData.price),
          mileage: Number(formData.mileage),
          seats: Number(formData.seats),
          horsepower: formData.horsepower ? Number(formData.horsepower) : null,
        })
      })

      if (response.ok) {
        alert(car ? 'Vehículo actualizado con éxito' : 'Vehículo creado con éxito')
        router.push('/admin')
      } else {
        const error = await response.json()
        alert('Error: ' + (error.error || 'No se pudo guardar'))
      }
    } catch (err) {
      alert('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout title={car ? 'Editar Vehículo' : 'Nuevo Vehículo'}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: '900', color: '#1e40af', textAlign: 'center', marginBottom: '3rem' }}>
          {car ? 'Editar Vehículo' : 'Nuevo Vehículo'}
        </h1>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '3rem' }}>

          {/* ==================== INFORMACIÓN DEL VEHÍCULO ==================== */}
          <section style={{ background: 'white', padding: '3rem', borderRadius: '20px', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}>
            <h2 style={{ color: '#dc2626', fontSize: '2.2rem', marginBottom: '0 0 5rem 0', paddingBottom: '1rem' }}>
              Información del Vehículo
            </h2>

            {/* TÍTULO */}
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

            {/* MARCA (SELECT) + MODELO */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', marginBottom: '2.5rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '1rem' }}>Marca *</label>
                <select
                  value={formData.brand}
                  onChange={e => setFormData(p => ({ ...p, brand: e.target.value }))}
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

            {/* AÑO / PRECIO / KILOMETRAJE */}
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

            {/* TIPO / COMBUSTIBLE / TRANSMISIÓN */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2.5rem', marginBottom: '2.5rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.8rem' }}>Tipo *</label>
                <select value={formData.type} onChange={e => setFormData(p => ({ ...p, type: e.target.value as any }))} style={{ width: '100%', padding: '1.2rem', borderRadius: '12px', border: '2px solid #e5e7eb' }}>
                  {carTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.8rem' }}>Combustible *</label>
                <select value={formData.fuelType} onChange={e => setFormData(p => ({ ...p, fuelType: e.target.value as any }))} style={{ width: '100%', padding: '1.2rem', borderRadius: '12px', border: '2px solid #e5e7eb' }}>
                  {fuelTypes.map(t => <option key={t} value={t}>{t === 'GASOLINE' ? 'Gasolina' : t === 'DIESEL' ? 'Diésel' : t === 'ELECTRIC' ? 'Eléctrico' : 'Híbrido'}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.8rem' }}>Transmisión *</label>
                <select value={formData.transmission} onChange={e => setFormData(p => ({ ...p, transmission: e.target.value as any }))} style={{ width: '100%', padding: '1.2rem', borderRadius: '12px', border: '2px solid #e5e7eb' }}>
                  {transmissionTypes.map(t => <option key={t} value={t}>{t === 'AUTOMATIC' ? 'Automática' : 'Manual'}</option>)}
                </select>
              </div>
            </div>

            {/* COLOR / ASIENTOS */}
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

            {/* HP / ECONOMÍA */}
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

            {/* DESTACADO + CATEGORÍA + DESCRIPCIÓN */}
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
                      <input type="radio" name="cat" value={c} checked={formData.category === c} onChange={e => setFormData(p => ({ ...p, category: e.target.value as any }))} />
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

          {/* ==================== IMÁGENES ==================== */}
          <section style={{ background: 'white', padding: '3rem', borderRadius: '20px', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}>
            <h2 style={{ color: '#dc2626', fontSize: '2rem', marginBottom: '2rem' }}>Imágenes ({formData.images.length})</h2>
            <ImageUpload onFilesUpload={handleImagesUpload} multiple={true} uploadType="cars" maxFiles={20} />

            {formData.images.length > 0 && (
              <div style={{ marginTop: '2.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
                  {formData.images.map((img, i) => (
                    <div key={i} style={{ position: 'relative', border: img.isPrimary ? '5px solid #dc2626' : '2px solid #e5e7eb', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
                      <img src={img.url} alt="" style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '0.5rem' }}>
                        <button type="button" onClick={() => setPrimaryImage(i)} style={{ background: img.isPrimary ? '#dc2626' : '#1f2937', color: 'white', padding: '0.6rem 1.2rem', borderRadius: '10px', fontWeight: 'bold' }}>
                          {img.isPrimary ? 'Principal' : 'Hacer Principal'}
                        </button>
                        <button type="button" onClick={() => removeImage(i)} style={{ background: '#ef4444', color: 'white', width: '40px', height: '40px', borderRadius: '50%' }}>×</button>
                      </div>
                      {img.isPrimary && <div style={{ background: '#dc2626', color: 'white', textAlign: 'center', padding: '0.8rem', fontWeight: 'bold' }}>IMAGEN PRINCIPAL</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* ==================== CARACTERÍSTICAS ==================== */}
          <section style={{ background: 'white', padding: '3rem', borderRadius: '20px', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ color: '#dc2626', fontSize: '2rem' }}>Características Extras</h2>
              <button type="button" onClick={addFeature} style={{ background: '#1e40af', color: 'white', padding: '1rem 2rem', borderRadius: '12px', fontWeight: 'bold', fontSize: '1.1rem' }}>
                + Agregar Característica
              </button>
            </div>

            {formData.features.map((f, i) => (
              <div key={i} style={{ display: 'block', gridTemplateColumns: '2fr 3fr 100px', gap: '1.5rem', marginBottom: '1.5rem', alignItems: 'end' }}>
                <input type="text" placeholder="Ej: Techo Solar" value={f.name} onChange={e => updateFeature(i, 'name', e.target.value)} style={{ width:'80%',padding: '1rem', borderRadius: '10px', border: '2px solid #e5e7eb', marginRight:'10px' }} />
                {/* <input type="text" placeholder="Descripción (opcional)" value={f.description || ''} onChange={e => updateFeature(i, 'description', e.target.value)} style={{ padding: '1rem', borderRadius: '10px', border: '2px solid #e5e7eb' }} /> */}
                <button type="button" onClick={() => removeFeature(i)} style={{ background: '#ef4444', color: 'white', padding: '1rem', borderRadius: '10px', height: '100%' }}>Eliminar</button>
              </div>
            ))}
          </section>

          {/* ==================== BOTONES ==================== */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '2.5rem' }}>
            <button type="button" onClick={() => router.push('/admin')} style={{ padding: '0.9rem 2rem', background: '#6b7280', color: 'white', borderRadius: '16px', fontSize: '1rem', fontWeight: 'bold' }}>
              Cancelar
            </button>
            <button type="submit" disabled={loading} style={{ padding: '1rem 2rem', background: '#dc2626', color: 'white', borderRadius: '16px', fontSize: '1.1rem', fontWeight: '900', boxShadow: '0 10px 30px rgba(220,38,38,0.4)' }}>
              {loading ? 'Guardando...' : (car ? 'Actualizar Vehículo' : 'Crear Vehículo')}
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
    return { redirect: { destination: '/login', permanent: false } }
  }
  return { props: { car: null } } // Cambiar cuando hagas edición real
}