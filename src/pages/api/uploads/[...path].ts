// pages/api/uploads/[...path].ts
import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Permite solo GET
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).end('Method Not Allowed')
  }

  try {
    // Obtiene la ruta después de /api/uploads/
    const filePathArray = req.query.path
    if (!filePathArray) {
      return res.status(400).json({ error: 'No file path provided' })
    }

    const filePath = Array.isArray(filePathArray)
      ? filePathArray
      : [filePathArray]

    // Ruta completa en el servidor
    const fullPath = path.join(process.cwd(), 'uploads', ...filePath)

    // Seguridad: evita salir de la carpeta uploads
    if (!fullPath.startsWith(path.join(process.cwd(), 'uploads'))) {
      return res.status(403).json({ error: 'Access denied' })
    }

    // Verifica que el archivo exista
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'File not found' })
    }

    // Lee el archivo
    const fileBuffer = fs.readFileSync(fullPath)

    // Detecta el tipo MIME
    const ext = path.extname(fullPath).toLowerCase()
    const mimeType = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
    }[ext] || 'application/octet-stream'

    // Cabeceras para mejor rendimiento
    res.setHeader('Content-Type', mimeType)
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
    res.setHeader('Access-Control-Allow-Origin', '*')

    // Envía la imagen
    res.send(fileBuffer)
  } catch (error) {
    console.error('Error serving upload:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Necesario para archivos grandes
export const config = {
  api: {
    responseLimit: false,
    bodyParser: false,
  },
}