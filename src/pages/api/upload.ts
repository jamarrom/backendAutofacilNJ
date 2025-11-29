import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth/[...nextauth]'
import formidable from 'formidable'
import fs from 'fs'
import path from 'path'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const form = formidable({
      uploadDir: './public/uploads',
      keepExtensions: true,
      maxFiles: 10,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      filename: (name, ext, part) => {
        const timestamp = Date.now()
        const random = Math.random().toString(36).substring(2, 15)
        return `${timestamp}-${random}${ext}`
      }
    })

    const [fields, files] = await form.parse(req)

    const uploadedFiles = Array.isArray(files.files) ? files.files : [files.files]
    
    const results = uploadedFiles.map(file => {
      if (!file) return null
      
      // Mover el archivo a la carpeta correcta
      const originalPath = file.filepath
      const fileName = file.newFilename
      const uploadType = fields.type?.[0] || 'cars'
      const targetDir = `./public/uploads/${uploadType}`
      const targetPath = path.join(targetDir, fileName)

      // Crear directorio si no existe
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true })
      }

      // Mover archivo
      fs.renameSync(originalPath, targetPath)

      return {
        url: `/uploads/${uploadType}/${fileName}`,
        name: file.originalFilename || fileName,
        size: file.size,
        type: file.mimetype
      }
    }).filter(Boolean)

    res.json({ 
      success: true, 
      files: results 
    })

  } catch (error) {
    console.error('Error uploading files:', error)
    res.status(500).json({ error: 'Error uploading files' })
  }
}