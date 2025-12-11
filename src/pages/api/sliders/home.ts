import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../pages/api/auth/[...nextauth]'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)

  if (req.method === 'GET') {
    try {
      const sliders = await prisma.homeSlider.findMany({
        orderBy: { order: 'asc' },
        where: { isActive: true }
      })
      res.json(sliders)
    } catch (error) {
      res.status(500).json({ error: 'Error fetching home sliders' })
    }
  } 
  else if (req.method === 'POST') {
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { mediaType, imageUrl, videoUrl, thumbnailUrl, title, subtitle, order } = req.body

    // Validaciones
    if (mediaType === 'IMAGE' && !imageUrl) {
      return res.status(400).json({ error: 'Se requiere imagen para tipo IMAGE' })
    }
    if (mediaType === 'VIDEO' && (!videoUrl || !thumbnailUrl)) {
      return res.status(400).json({ error: 'Se requiere video y thumbnail para tipo VIDEO' })
    }

    try {
      const slider = await prisma.homeSlider.create({
        data: {
          mediaType,
          imageUrl: mediaType === 'IMAGE' ? imageUrl : null,
          videoUrl: mediaType === 'VIDEO' ? videoUrl : null,
          thumbnailUrl: mediaType === 'VIDEO' ? thumbnailUrl : null,
          title,
          subtitle,
          order: Number(order) || 0,
        }
      })
      res.status(201).json(slider)
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: 'Error al crear slider' })
    }
  } 
  else if (req.method === 'DELETE') {
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { id } = req.query
    if (!id) return res.status(400).json({ error: 'ID requerido' })

    try {
      await prisma.homeSlider.delete({ where: { id: id as string } })
      res.status(204).end()
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar slider' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'DELETE'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}