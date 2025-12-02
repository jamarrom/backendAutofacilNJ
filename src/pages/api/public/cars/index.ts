// pages/api/public/cars/index.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).end()

  // LEER PARÁMETRO limit DE LA URL
  const limit = req.query.limit ? parseInt(req.query.limit as string) : null

  try {
    const cars = await prisma.car.findMany({
      include: {
        images: { orderBy: { order: 'asc' } },
        features: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit || undefined, // ← SI VIENE limit=6 → solo 6, sino → todos
    })

    const serializedCars = cars.map(car => ({
      id: car.id,
      title: car.title,
      brand: car.brand,
      model: car.model,
      year: car.year,
      price: Number(car.price),
      mileage: car.mileage,
      primaryImage: car.images.find(i => i.isPrimary)?.url || car.images[0]?.url || '/placeholder.jpg',
      images: car.images.map(i => i.url),
      isFeatured: car.isFeatured,
      fuelType: car.fuelType,
      type: car.type,
      transmission: car.transmission,
      // ... resto de campos
    }))

    res.status(200).json({ cars: serializedCars, total: cars.length })
  } catch (error) {
    res.status(500).json({ error: 'Error' })
  }
}