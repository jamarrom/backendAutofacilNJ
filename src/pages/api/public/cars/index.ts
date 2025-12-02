// pages/api/public/cars/index.ts → VERSIÓN 100% CORRECTA
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')


  // LEER LIMIT CORRECTAMENTE
  const limitParam = req.query.limit
  const limit = limitParam ? Number(limitParam) : null

  // CLAVE: solo aplicar take si es número válido y > 0
  const take = (limit && limit > 0) ? limit : undefined

  try {
    const cars = await prisma.car.findMany({

      include: {
        images: { orderBy: { order: 'asc' } },
        features: true,
      },
      orderBy: { createdAt: 'desc' },
      take, // ← AHORA SÍ FUNCIONA
    })

    console.log(`API devolviendo ${cars.length} autos (limit: ${limit || 'sin límite'})`)

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
      isFeatured: car.isFeatured || false,
      fuelType: car.fuelType,
      type: car.type,
      transmission: car.transmission || 'Automática',
    }))

    res.status(200).json({ cars: serializedCars })
  } catch (error: any) {
    console.error('Error API:', error)
    res.status(500).json({ error: error.message })
  }
}