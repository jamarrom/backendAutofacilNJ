// pages/api/public/slider/home.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../../lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).end()

  try {
    const slides = await prisma.homeSlider.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      select: {
        imageUrl: true,
        title: true,
        subtitle: true,
      }
    })

    // Si no hay slides activos, devolvídete de los defaults (para que no se rompa)
    if (slides.length === 0) {
      return res.status(200).json([])
    }

    res.status(200).json(slides)
  } catch (error) {
    console.error('Error cargando hero slider:', error)
    res.status(500).json({ error: 'Error interno' })
  }
}