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
  uploadType?: 'cars' | 'sliders'
  maxFiles?: number
}

export default function ImageUpload({ 
  onFilesUpload, 
  multiple = true, 
  uploadType = 'cars',
  maxFiles = 10 
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      files.forEach(file => {
        formData.append('files', file)
      })
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
      alert('Error al subir las imágenes')
    } finally {
      setUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const files = Array.from(event.dataTransfer.files)
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    
    if (imageFiles.length > 0) {
      uploadFiles(imageFiles)
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        style={{
          border: '2px dashed #ccc',
          borderRadius: '8px',
          padding: '2rem',
          textAlign: 'center',
          cursor: uploading ? 'not-allowed' : 'pointer',
          backgroundColor: uploading ? '#f8fafc' : 'white',
          opacity: uploading ? 0.7 : 1
        }}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          disabled={uploading}
        />
        
        {uploading ? (
          <div>
            <p>Subiendo imágenes... {progress}%</p>
            <div style={{
              width: '100%',
              height: '4px',
              backgroundColor: '#e5e5e5',
              borderRadius: '2px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${progress}%`,
                height: '100%',
                backgroundColor: '#dc2626',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
        ) : (
          <div>
            <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
              Haz clic o arrastra imágenes aquí
            </p>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
              PNG, JPG, JPEG hasta 10MB
              {multiple && `, máximo ${maxFiles} archivos`}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}