// pages/api/public/cars/index.ts — VERSIÓN 100% FUNCIONAL
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../../lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // CORS (importante)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  try {
    const cars = await prisma.car.findMany({
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        features: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    console.log(`Se encontraron ${cars.length} autos`) // ← Esto te dirá cuántos trae

    const serializedCars = cars.map(car => {
      const primaryImg = car.images.find(img => img.isPrimary)
      const firstImg = car.images[0]

      return {
        id: car.id,
        title: car.title,
        brand: car.brand,
        model: car.model,
        year: car.year,
        price: Number(car.price),
        mileage: car.mileage,
        color: car.color,
        type: car.type,
        fuelType: car.fuelType,
        transmission: car.transmission,
        seats: car.seats,
        horsepower: car.horsepower || null,
        fuelEconomy: car.fuelEconomy || null,
        category: car.category,
        isFeatured: car.isFeatured,
        description: car.description,
        primaryImage: primaryImg?.url || firstImg?.url || '/placeholder.jpg',
        images: car.images.length > 0 ? car.images.map(img => img.url) : ['/placeholder.jpg'],
        features: car.features ? car.features.map(f => f.name) : [],
        createdAt: car.createdAt.toISOString(),
      }
    })

    res.status(200).json({ cars: serializedCars })
  } catch (error: any) {
    console.error('Error en API pública:', error)
    res.status(500).json({ 
      error: 'Error cargando vehículos',
      details: error.message 
    })
  }
}