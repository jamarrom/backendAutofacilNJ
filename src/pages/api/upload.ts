// pages/api/upload.ts → VUELVE A ESTO (el que ya funcionaba)
import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'
import formidable from 'formidable'

export const config = { api: { bodyParser: false } }

const uploadDir = path.join(process.cwd(), 'public', 'uploads')  // ← public!

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const form = formidable({
    multiples: true,
    uploadDir,
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024,
  })

  form.parse(req, (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'Upload failed' })

    const type = (fields.type?.[0] as string) || 'cars'
    const typeDir = path.join(uploadDir, type)
    if (!fs.existsSync(typeDir)) fs.mkdirSync(typeDir, { recursive: true })

    const uploaded: any[] = []
    const fileList = Array.isArray(files.files) ? files.files : [files.files]

    fileList.forEach(file => {
      if (!file?.originalFilename) return

      const ext = path.extname(file.originalFilename)
      const newName = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}${ext}`
      const oldPath = file.filepath
      const newPath = path.join(typeDir, newName)

      fs.renameSync(oldPath, newPath)

      // AQUÍ ESTÁ EL ÚNICO CAMBIO QUE NECESITAMOS:
      uploaded.push({
        url: `/uploads/${type}/${newName}`,  // ← SIN /public
        name: file.originalFilename,
        size: file.size,
        type: file.mimetype,
      })
    })

    res.status(200).json({ files: uploaded })
  })
}