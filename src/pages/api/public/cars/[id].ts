// pages/api/public/car/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../../lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID del auto requerido' })
  }

  res.setHeader('Access-Control-Allow-Origin', '*')

  try {
    const car = await prisma.car.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { order: 'asc' }
        },
        features: true
      }
    })

    if (!car) {
      return res.status(404).json({ error: 'Auto no encontrado' })
    }

    // Normalizar datos para el frontend
    const fuelMap: Record<string, string> = {
      GASOLINE: 'Gasolina',
      DIESEL: 'Diésel',
      ELECTRIC: 'Eléctrico',
      HYBRID: 'Híbrido'
    }

    const transmissionMap: Record<string, string> = {
      AUTOMATIC: 'Automática',
      MANUAL: 'Manual'
    }

    const typeMap: Record<string, string> = {
      SEDAN: 'Sedán',
      SUV: 'SUV',
      COUPE: 'Cupé',
      HATCHBACK: 'Hatchback',
      TRUCK: 'Camioneta'
    }

    const brandMap: Record<string, string> = {
      BMW: 'BMW',
      MERCEDES_BENZ: 'Mercedes-Benz',
      PORSCHE: 'Porsche',
      TESLA: 'Tesla',
      AUDI: 'Audi',
      LEXUS: 'Lexus',
      CADILLAC: 'Cadillac',
      DODGE: 'Dodge',
      FORD: 'Ford',
      JEEP: 'Jeep',
      VOLKSWAGEN: 'Volkswagen'
    }

    const response = {
      id: car.id,
      title: car.title,
      brand: brandMap[car.brand] || car.brand,
      model: car.model,
      year: car.year,
      price: car.price,
      mileage: car.mileage,
      color: car.color,
      seats: car.seats,
      horsepower: car.horsepower,
      fuelEconomy: car.fuelEconomy,
      description: car.description || 'Sin descripción disponible.',
      type: typeMap[car.type],
      fuelType: fuelMap[car.fuelType],
      transmission: transmissionMap[car.transmission],
      isFeatured: car.isFeatured,
      images: car.images.map(img => ({
        url: img.url,
        isPrimary: img.isPrimary
      }))
    }

    res.status(200).json(response)
  } catch (error) {
    console.error('Error cargando auto:', error)
    res.status(500).json({ error: 'Error interno' })
  }
}