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

  // Configurar CORS para permitir acceso desde cualquier origen
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // Manejar solicitudes OPTIONS para CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Solo permitir método GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  try {
    const car = await prisma.car.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: [{ isPrimary: 'desc' }, { order: 'asc' }]
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
      TRUCK: 'Camioneta',
      CONVERTIBLE: 'Convertible'
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

    const categoryMap: Record<string, string> = {
      NEW: 'Semi nuevo',
      AUCTION: 'Remate'
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
      type: typeMap[car.type] || car.type,
      fuelType: fuelMap[car.fuelType] || car.fuelType,
      transmission: transmissionMap[car.transmission] || car.transmission,
      category: categoryMap[car.category] || car.category,
      isFeatured: car.isFeatured,
      createdAt: car.createdAt.toISOString(),
      updatedAt: car.updatedAt.toISOString(),
      
      // Incluir imágenes con mediaType y thumbnailUrl
      images: car.images.map(img => ({
        id: img.id,
        url: img.url,
        mediaType: img.mediaType || 'IMAGE', // Default a IMAGE si no existe
        thumbnailUrl: img.thumbnailUrl || null,
        order: img.order,
        isPrimary: img.isPrimary
      })),
      
      // Incluir características
      features: car.features.map(feature => ({
        id: feature.id,
        name: feature.name,
        description: feature.description || ''
      }))
    }

    res.status(200).json(response)
  } catch (error) {
    console.error('Error cargando auto:', error)
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    })
  }
}