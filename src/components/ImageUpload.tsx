import { useState, useRef } from 'react'

interface UploadedFile {
  url: string
  name: string
  size: number
  type: string
}

interface ImageUploadProps {
  onFilesUpload: (files: UploadedFile[]) => void
  multiple?: boolean
  uploadType?: 'cars' | 'sliders' | 'videos' // puedes agregar más si quieres
  maxFiles?: number
  accept?: string              // NUEVA PROP
  label?: string               // Para personalizar el texto (opcional)
}

export default function ImageUpload({ 
  onFilesUpload, 
  multiple = true, 
  uploadType = 'cars',
  maxFiles = 10,
  accept = "image/*",          // por defecto imágenes
  label                                 // nuevo: texto personalizado
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isVideo = accept.includes('video')

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return
    await uploadFiles(Array.from(files))
  }

  const uploadFiles = async (files: File[]) => {
    setUploading(true)
    setProgress(0)

    try {
      const formData = new FormData()
      files.forEach(file => formData.append('files', file))
      formData.append('type', uploadType)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        onFilesUpload(result.files)
        setProgress(100)
      } else {
        throw new Error('Upload failed')
      }
    } catch (error) {
      console.error('Error uploading files:', error)
      alert(isVideo ? 'Error al subir el video' : 'Error al subir las imágenes')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const droppedFiles = Array.from(event.dataTransfer.files)

    // Filtramos por el accept que venga (imagen o video)
    const validFiles = droppedFiles.filter(file => 
      accept.split(',').some(pattern => 
        file.type.match(new RegExp(pattern.trim().replace('*', '.*')))
      )
    )

    if (validFiles.length > 0) {
      uploadFiles(validFiles)
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  // Texto dinámico según si es video o imagen
  const defaultLabel = isVideo 
    ? 'Haz clic o arrastra un video aquí'
    : 'Haz clic o arrastra imágenes aquí'

  const defaultSubLabel = isVideo
    ? 'MP4, WebM, OGG – Máximo 100MB recomendado'
    : 'PNG, JPG, JPEG hasta 10MB'

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        style={{
          border: '2px dashed #ccc',
          borderRadius: '12px',
          padding: '2.5rem',
          textAlign: 'center',
          cursor: uploading ? 'not-allowed' : 'pointer',
          backgroundColor: uploading ? '#f8fafc' : '#ffffff',
          opacity: uploading ? 0.6 : 1,
          transition: 'all 0.3s',
          boxShadow: uploading ? 'none' : '0 4px 12px rgba(0,0,0,0.05)'
        }}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={accept}                    // ahora sí respeta lo que le pases
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          disabled={uploading}
        />
        
        {uploading ? (
          <div>
            <p style={{ margin: '0 0 1rem', color: '#374151' }}>
              Subiendo {isVideo ? 'video' : 'imágenes'}... {progress}%
            </p>
            <div style={{
              width: '100%',
              height: '6px',
              backgroundColor: '#e5e7eb',
              borderRadius: '3px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${progress}%`,
                height: '100%',
                backgroundColor: '#dc2626',
                transition: 'width 0.4s ease'
              }} />
            </div>
          </div>
        ) : (
          <div>
            <p style={{ color: '#374151', fontWeight: '600', marginBottom: '0.5rem' }}>
              {label || defaultLabel}
            </p>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
              {defaultSubLabel}
              {!multiple && ' (solo 1 archivo)'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}