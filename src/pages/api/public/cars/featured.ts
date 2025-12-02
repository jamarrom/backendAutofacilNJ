// pages/api/public/cars/featured.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../../lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // CORS (para que funcione con tu HTML en Live Server)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).end()

  try {
    const featuredCars = await prisma.car.findMany({
      where: { isFeatured: true }, // ← SOLO LOS DESTACADOS
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        features: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 12, // máximo 12 para el slider (puedes cambiarlo)
    })

    const serialized = featuredCars.map(car => ({
      id: car.id,
      title: car.title,
      brand: car.brand,
      model: car.model,
      year: car.year,
      price: Number(car.price),
      primaryImage: car.images.find(i => i.isPrimary)?.url || car.images[0]?.url || '/placeholder.jpg',
      images: car.images.map(i => i.url),
    }))

    res.status(200).json({ cars: serialized })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error cargando destacados' })
  }
}