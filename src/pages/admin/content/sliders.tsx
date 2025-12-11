// pages/admin/sliders.tsx
import { useState, useEffect } from 'react'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import ImageUpload from '../../../components/ImageUpload'
import AdminLayout from '../../../components/AdminLayout'

interface Slider {
  id: string
  mediaType: 'IMAGE' | 'VIDEO'
  imageUrl?: string
  videoUrl?: string
  thumbnailUrl?: string
  title?: string
  subtitle?: string
  order: number
  isActive: boolean
}

export default function SlidersAdmin() {
  const router = useRouter()
  const { tab } = router.query

  const [activeTab, setActiveTab] = useState<'home' | 'auction'>('home')
  const [sliders, setSliders] = useState<Slider[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    mediaType: 'IMAGE' as 'IMAGE' | 'VIDEO',
    imageUrl: '',
    videoUrl: '',
    thumbnailUrl: '',
    title: '',
    subtitle: '',
    order: 0
  })

  useEffect(() => {
    if (tab === 'home' || tab === 'auction') {
      setActiveTab(tab)
    } else if (!tab) {
      setActiveTab('home')
    }
  }, [tab])

  const handleTabChange = (newTab: 'home' | 'auction') => {
    setActiveTab(newTab)
    router.push(`/admin/sliders?tab=${newTab}`, undefined, { shallow: true })
  }

  useEffect(() => {
    fetchSliders()
  }, [activeTab])

  const fetchSliders = async () => {
    setLoading(true)
    try {
      const endpoint = activeTab === 'home' ? '/api/sliders/home' : '/api/sliders/auction'
      const res = await fetch(endpoint)
      const data = await res.json()
      setSliders(data.sort((a: Slider, b: Slider) => a.order - b.order))
    } catch (error) {
      console.error('Error al cargar sliders:', error)
      alert('Error al cargar los sliders')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.mediaType === 'IMAGE' && !formData.imageUrl) {
      alert('Debes subir una imagen para tipo Imagen')
      return
    }
    if (formData.mediaType === 'VIDEO' && (!formData.videoUrl || !formData.thumbnailUrl)) {
      alert('Debes subir un video y un thumbnail para tipo Video')
      return
    }

    try {
      const endpoint = activeTab === 'home' ? '/api/sliders/home' : '/api/sliders/auction'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        setShowForm(false)
        setFormData({
          mediaType: 'IMAGE',
          imageUrl: '',
          videoUrl: '',
          thumbnailUrl: '',
          title: '',
          subtitle: '',
          order: 0
        })
        fetchSliders()
      } else {
        alert('Error al guardar el slider')
      }
    } catch (error) {
      alert('Error de conexión')
    }
  }

  const deleteSlider = async (id: string) => {
    if (!confirm('¿Seguro que quieres eliminar este slider?')) return

    try {
      const endpoint = activeTab === 'home' ? '/api/sliders/home' : '/api/sliders/auction'
      const res = await fetch(`${endpoint}/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchSliders()
      } else {
        alert('Error al eliminar')
      }
    } catch (error) {
      alert('No se pudo eliminar')
    }
  }

  const handleMediaUpload = (type: 'image' | 'video' | 'thumbnail', uploadedFiles: any[]) => {
    if (uploadedFiles.length > 0) {
      const url = uploadedFiles[0].url
      if (type === 'image') {
        setFormData(prev => ({ ...prev, imageUrl: url }))
      } else if (type === 'video') {
        setFormData(prev => ({ ...prev, videoUrl: url }))
      } else if (type === 'thumbnail') {
        setFormData(prev => ({ ...prev, thumbnailUrl: url }))
      }
    }
  }

  const currentTitle = activeTab === 'home' ? 'Slider Home' : 'Slider Remate'

  return (
    <AdminLayout title="Administrar Sliders">
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Header + Tabs */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2.5rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {/* <button
              onClick={() => handleTabChange('home')}
              style={{
                padding: '0.85rem 2rem',
                borderRadius: '12px',
                border: 'none',
                fontWeight: '600',
                fontSize: '1rem',
                cursor: 'pointer',
                backgroundColor: activeTab === 'home' ? '#dc2626' : '#e5e7eb',
                color: activeTab === 'home' ? 'white' : '#374151',
                boxShadow: activeTab === 'home' ? '0 6px 20px rgba(220,38,38,0.3)' : 'none',
                transition: 'all 0.3s'
              }}
            >
              Slider Home
            </button>
            <button
              onClick={() => handleTabChange('auction')}
              style={{
                padding: '0.85rem 2rem',
                borderRadius: '12px',
                border: 'none',
                fontWeight: '600',
                fontSize: '1rem',
                cursor: 'pointer',
                backgroundColor: activeTab === 'auction' ? '#dc2626' : '#e5e7eb',
                color: activeTab === 'auction' ? 'white' : '#374151',
                boxShadow: activeTab === 'auction' ? '0 6px 20px rgba(220,38,38,0.3)' : 'none',
                transition: 'all 0.3s'
              }}
            >
              Slider Remate
            </button> */}
          </div>
        </div>

        {/* Botón Agregar */}
        <div style={{ marginBottom: '2rem', textAlign: 'right' }}>
          <button
            onClick={() => setShowForm(true)}
            style={{
              backgroundColor: '#dc2626',
              color: 'white',
              padding: '1rem 2.2rem',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '600',
              fontSize: '1.1rem',
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(220,38,38,0.3)'
            }}
          >
            + Agregar Slider
          </button>
        </div>

        {/* Formulario */}
        {showForm && (
          <div style={{
            backgroundColor: 'white',
            padding: '2.5rem',
            borderRadius: '16px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            marginBottom: '3rem'
          }}>
            <h3 style={{ marginTop: 0, color: '#1e3a8a', fontSize: '1.6rem' }}>
              Nuevo Slider – {currentTitle}
            </h3>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.8rem' }}>

              <div>
                <label style={{ display: 'block', marginBottom: '0.7rem', fontWeight: '600' }}>
                  Tipo de Media *
                </label>
                <select
                  value={formData.mediaType}
                  onChange={e => setFormData(prev => ({ ...prev, mediaType: e.target.value as 'IMAGE' | 'VIDEO', imageUrl: '', videoUrl: '', thumbnailUrl: '' }))}
                  style={inputStyle}
                >
                  <option value="IMAGE">Imagen</option>
                  <option value="VIDEO">Video</option>
                </select>
              </div>

              {formData.mediaType === 'IMAGE' ? (
                <div>
                  <label style={{ display: 'block', marginBottom: '0.7rem', fontWeight: '600' }}>
                    Imagen del Slider *
                  </label>
                  {!formData.imageUrl ? (
                    <ImageUpload
                      onFilesUpload={(files) => handleMediaUpload('image', files)}
                      multiple={false}
                      uploadType="sliders"
                      accept="image/jpeg,image/png,image/webp,image/jpg"
                    />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        style={{ width: '380px', height: '180px', objectFit: 'cover', borderRadius: '12px', border: '3px solid #dc2626' }}
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                        style={{
                          backgroundColor: '#ef4444',
                          color: 'white',
                          padding: '0.7rem 1.5rem',
                          border: 'none',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          fontWeight: '600'
                        }}
                      >
                        Cambiar Imagen
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.7rem', fontWeight: '600' }}>
                      Video del Slider *
                    </label>
                    {!formData.videoUrl ? (
                      <ImageUpload
                        onFilesUpload={(files) => handleMediaUpload('video', files)}
                        multiple={false}
                        uploadType="sliders"
                        accept="video/mp4,video/webm,video/ogg"
                        label="Haz clic o arrastra el video del slider"
                      />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <video
                          src={formData.videoUrl}
                          style={{ width: '380px', height: '180px', objectFit: 'cover', borderRadius: '12px', border: '3px solid #dc2626' }}
                          controls
                        />
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, videoUrl: '' }))}
                          style={{
                            backgroundColor: '#ef4444',
                            color: 'white',
                            padding: '0.7rem 1.5rem',
                            border: 'none',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontWeight: '600'
                          }}
                        >
                          Cambiar Video
                        </button>
                      </div>
                    )}
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.7rem', fontWeight: '600' }}>
                      Imagen Thumbnail para Video *
                    </label>
                    {!formData.thumbnailUrl ? (
                      <ImageUpload
                        onFilesUpload={(files) => handleMediaUpload('thumbnail', files)}
                        multiple={false}
                        uploadType="sliders"
                        accept="image/*"
                        label="Sube una imagen como portada del video"
                      />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <img
                          src={formData.thumbnailUrl}
                          alt="Thumbnail Preview"
                          style={{ width: '380px', height: '180px', objectFit: 'cover', borderRadius: '12px', border: '3px solid #dc2626' }}
                        />
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, thumbnailUrl: '' }))}
                          style={{
                            backgroundColor: '#ef4444',
                            color: 'white',
                            padding: '0.7rem 1.5rem',
                            border: 'none',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontWeight: '600'
                          }}
                        >
                          Cambiar Thumbnail
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Título (opcional)</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    style={inputStyle}
                    placeholder="Ej: Ofertas Imperdibles"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Subtítulo (opcional)</label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={e => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                    style={inputStyle}
                    placeholder="Ej: Hasta 40% off en remates"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Orden de aparición *</label>
                <input
                  type="number"
                  min="0"
                  value={formData.order}
                  onChange={e => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                  style={inputStyle}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <button type="submit" style={btnPrimary}>Guardar Slider</button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setFormData({
                      mediaType: 'IMAGE',
                      imageUrl: '',
                      videoUrl: '',
                      thumbnailUrl: '',
                      title: '',
                      subtitle: '',
                      order: 0
                    })
                  }}
                  style={btnSecondary}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de Sliders */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem', fontSize: '1.2rem' }}>Cargando sliders...</div>
        ) : (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#1e3a8a' }}>
                  <th style={thStyle}>Tipo</th>
                  <th style={thStyle}>Preview</th>
                  <th style={thStyle}>Título</th>
                  <th style={thStyle}>Subtítulo</th>
                  <th style={thStyle}>Orden</th>
                  <th style={thStyle}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sliders.map((slider) => (
                  <tr key={slider.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={tdStyle}>{slider.mediaType}</td>
                    <td style={tdStyle}>
                      {slider.mediaType === 'IMAGE' ? (
                        <img
                          src={slider.imageUrl}
                          alt={slider.title || 'Slider'}
                          style={{ width: '200px', height: '110px', objectFit: 'cover', borderRadius: '10px' }}
                        />
                      ) : (
                        <img
                          src={slider.thumbnailUrl}
                          alt={slider.title || 'Video Slider'}
                          style={{ width: '200px', height: '110px', objectFit: 'cover', borderRadius: '10px' }}
                        />
                      )}
                    </td>
                    <td style={tdStyle}>{slider.title || '—'}</td>
                    <td style={tdStyle}>{slider.subtitle || '—'}</td>
                    <td style={tdStyle}><strong>{slider.order}</strong></td>
                    <td style={tdStyle}>
                      <button
                        onClick={() => deleteSlider(slider.id)}
                        style={{
                          backgroundColor: '#ef4444',
                          color: 'white',
                          padding: '0.6rem 1.2rem',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: '600'
                        }}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {sliders.length === 0 && (
              <div style={{
                padding: '5rem',
                textAlign: 'center',
                color: '#6b7280',
                fontSize: '1.2rem'
              }}>
                No hay sliders configurados para {activeTab === 'home' ? 'Home' : 'Remate'}
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

// Estilos
const inputStyle = {
  width: '100%',
  padding: '0.9rem 1.2rem',
  border: '1px solid #d1d5db',
  borderRadius: '10px',
  fontSize: '1rem'
}

const thStyle = {
  padding: '1.5rem',
  textAlign: 'left' as const,
  color: 'white',
  fontWeight: '600'
}

const tdStyle = {
  padding: '1.8rem 1.5rem',
  verticalAlign: 'middle'
}

const btnPrimary = {
  backgroundColor: '#dc2626',
  color: 'white',
  padding: '1rem 2.5rem',
  border: 'none',
  borderRadius: '12px',
  fontWeight: '600',
  fontSize: '1.1rem',
  cursor: 'pointer'
}

const btnSecondary = {
  ...btnPrimary,
  backgroundColor: '#6b7280'
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { getSession } = await import('next-auth/react')
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