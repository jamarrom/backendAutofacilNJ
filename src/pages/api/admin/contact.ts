import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]' // ← Ajusta la ruta según tu proyecto
import { prisma } from '../../../lib/prisma'

const CONTACT_KEY = 'contact_info'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Usa getServerSession con authOptions
  const session = await getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(401).json({ error: 'No autorizado' })
  }

  if (req.method === 'GET') {
    try {
      const entry = await prisma.siteContent.findUnique({
        where: { key: CONTACT_KEY }
      })
      return res.status(200).json(entry?.value || null)
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Error al leer datos' })
    }
  }

  if (req.method === 'POST') {
    try {
      const value = req.body

      await prisma.siteContent.upsert({
        where: { key: CONTACT_KEY },
        update: { value },
        create: { key: CONTACT_KEY, value }
      })

      return res.status(200).json({ success: true })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Error al guardar' })
    }
  }

  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}