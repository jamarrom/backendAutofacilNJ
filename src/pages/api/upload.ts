// pages/api/upload.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

export const config = {
  api: {
    bodyParser: false,
  },
}

const uploadDir = path.join(process.cwd(), 'public', 'uploads')

// Asegurar que el directorio existe
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true, mode: 0o755 })
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const formidable = require('formidable')
  const form = new formidable.IncomingForm({
    uploadDir,
    keepExtensions: true,
    maxFileSize: 50 * 1024 * 1024,
    multiples: true,
  })

  form.parse(req, (err: any, fields: any, files: any) => {
    if (err) {
      console.error('Formidable error:', err)
      return res.status(500).json({ error: 'Error al procesar archivos' })
    }

    const type = Array.isArray(fields.type) ? fields.type[0] : fields.type
    const safeType = ['cars', 'sliders'].includes(type) ? type : 'cars'

    const typeDir = path.join(uploadDir, safeType)
    if (!fs.existsSync(typeDir)) {
      fs.mkdirSync(typeDir, { recursive: true, mode: 0o755 })
    }

    const uploaded: any[] = []
    const fileList = Array.isArray(files.files) ? files.files : files.files ? [files.files] : []

    for (const file of fileList) {
      if (!file?.originalFilename) continue

      const ext = path.extname(file.originalFilename)
      const newName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${ext}`
      const newPath = path.join(typeDir, newName)

      try {
        // Mover el archivo
        fs.renameSync(file.filepath, newPath)
        // Establecer permisos
        fs.chmodSync(newPath, 0o644)
      } catch (error) {
        console.error('Error procesando archivo:', error)
        continue
      }

      // IMPORTANTE: Ahora usamos la ruta del API en lugar de la directa
      uploaded.push({
        url: `/api/public/uploads/${safeType}/${newName}`, // Ruta modificada
        name: file.originalFilename,
        size: file.size,
        type: file.mimetype || 'image/jpeg',
      })
    }

    if (uploaded.length === 0) {
      return res.status(400).json({ error: 'No se subió ningún archivo válido' })
    }

    res.status(200).json({ files: uploaded })
  })
}