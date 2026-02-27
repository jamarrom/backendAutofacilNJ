// pages/api/public/[...slug].ts
import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'
import mime from 'mime-types'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Solo permitir método GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Obtener la ruta del archivo desde los parámetros
    const { slug } = req.query
    
    if (!slug || !Array.isArray(slug) || slug.length === 0) {
      return res.status(400).json({ error: 'Ruta inválida' })
    }

    // Construir la ruta completa del archivo
    // slug viene como ['uploads', 'cars', 'nombre-archivo.jpg']
    const filePath = path.join(process.cwd(), 'public', ...slug)
    
    // Verificar que el archivo existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Archivo no encontrado' })
    }

    // Verificar que no sea un directorio
    const stat = fs.statSync(filePath)
    if (stat.isDirectory()) {
      return res.status(400).json({ error: 'No es un archivo' })
    }

    // Determinar el MIME type
    const mimeType = mime.lookup(filePath) || 'application/octet-stream'
    
    // Leer el archivo y enviarlo
    const fileContent = fs.readFileSync(filePath)
    
    // Configurar headers
    res.setHeader('Content-Type', mimeType)
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
    res.setHeader('Content-Length', stat.size)
    
    res.status(200).send(fileContent)
  } catch (error) {
    console.error('Error sirviendo archivo:', error)
    res.status(500).json({ error: 'Error al servir el archivo' })
  }
}