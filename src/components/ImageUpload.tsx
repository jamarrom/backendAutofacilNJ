// components/ImageUpload.tsx
import { useState, useRef } from 'react'

interface UploadedFile {
  url: string
  name: string
  size: number
  type: string
  previewUrl?: string // URL local para previsualización
}

interface ImageUploadProps {
  onFilesUpload: (files: UploadedFile[]) => void
  multiple?: boolean
  uploadType?: 'cars' | 'sliders' | 'videos'
  maxFiles?: number
  accept?: string
  label?: string
}

export default function ImageUpload({ 
  onFilesUpload, 
  multiple = true, 
  uploadType = 'cars',
  maxFiles = 10,
  accept = "image/*",
  label
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isVideo = accept.includes('video')

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setProgress(0)

    try {
      // Crear FormData para subir
      const formData = new FormData()
      Array.from(files).forEach(file => formData.append('files', file))
      formData.append('type', uploadType)

      // Subir al servidor
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        
        // Crear URLs locales para previsualización
        const filesWithPreview = result.files.map((file: any, index: number) => {
          // Crear URL local del archivo original para previsualización
          const originalFile = Array.from(files)[index]
          const previewUrl = URL.createObjectURL(originalFile)
          
          return {
            ...file,
            previewUrl, // Guardamos la URL local para previsualización
            type: originalFile.type
          }
        })

        // Enviar al componente padre con previewUrl
        onFilesUpload(filesWithPreview)
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

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const droppedFiles = Array.from(event.dataTransfer.files)

    // Filtramos por el accept que venga
    const validFiles = droppedFiles.filter(file => 
      accept.split(',').some(pattern => 
        file.type.match(new RegExp(pattern.trim().replace('*', '.*')))
      )
    )

    if (validFiles.length > 0) {
      setUploading(true)
      setProgress(0)

      try {
        const formData = new FormData()
        validFiles.forEach(file => formData.append('files', file))
        formData.append('type', uploadType)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (response.ok) {
          const result = await response.json()
          
          // Crear URLs locales para previsualización
          const filesWithPreview = result.files.map((file: any, index: number) => {
            const previewUrl = URL.createObjectURL(validFiles[index])
            return {
              ...file,
              previewUrl,
              type: validFiles[index].type
            }
          })

          onFilesUpload(filesWithPreview)
          setProgress(100)
        } else {
          throw new Error('Upload failed')
        }
      } catch (error) {
        console.error('Error uploading files:', error)
        alert(isVideo ? 'Error al subir el video' : 'Error al subir las imágenes')
      } finally {
        setUploading(false)
      }
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

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
          accept={accept}
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