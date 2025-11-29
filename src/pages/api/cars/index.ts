import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../pages/api/auth/[...nextauth]'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)

  if (req.method === 'GET') {
    // Obtener todos los autos (público)
    try {
      const { category, type, brand, minPrice, maxPrice, minYear, maxYear, fuelType } = req.query
      
      const where: any = {}
      
      if (category) where.category = category
      if (type) where.type = type
      if (brand) where.brand = { contains: brand, mode: 'insensitive' }
      if (fuelType) where.fuelType = fuelType
      
      if (minPrice || maxPrice) {
        where.price = {}
        if (minPrice) where.price.gte = parseFloat(minPrice as string)
        if (maxPrice) where.price.lte = parseFloat(maxPrice as string)
      }
      
      if (minYear || maxYear) {
        where.year = {}
        if (minYear) where.year.gte = parseInt(minYear as string)
        if (maxYear) where.year.lte = parseInt(maxYear as string)
      }

      const cars = await prisma.car.findMany({
        where,
        include: {
          images: {
            orderBy: { order: 'asc' }
          },
          features: true
        },
        orderBy: { createdAt: 'desc' }
      })

      res.json(cars)
    } catch (error) {
      res.status(500).json({ error: 'Error fetching cars' })
    }
  } 
  else if (req.method === 'POST') {
    // Crear nuevo auto (requiere autenticación)
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    try {
      console.log('Datos recibidos:', req.body)
      
      const carData = req.body
      
      // Validar datos requeridos
      if (!carData.brand || !carData.model || !carData.year || !carData.price) {
        return res.status(400).json({ error: 'Faltan campos requeridos' })
      }

      // Validar que haya al menos una imagen
      if (!carData.images || carData.images.length === 0) {
        return res.status(400).json({ error: 'Se requiere al menos una imagen' })
      }

      // Asegurarse de que haya una imagen principal
      const imagesWithPrimary = carData.images.map((img: any, index: number) => ({
        ...img,
        isPrimary: img.isPrimary || index === 0 // Si no hay principal, la primera es principal
      }))

      const car = await prisma.car.create({
        data: {
          brand: carData.brand,
          model: carData.model,
          year: parseInt(carData.year),
          price: parseFloat(carData.price),
          type: carData.type,
          fuelType: carData.fuelType,
          transmission: carData.transmission,
          mileage: parseInt(carData.mileage),
          color: carData.color,
          seats: parseInt(carData.seats),
          horsepower: carData.horsepower ? parseInt(carData.horsepower) : null,
          fuelEconomy: carData.fuelEconomy || null,
          category: carData.category,
          isFeatured: carData.isFeatured || false,
          description: carData.description || '',
          images: {
            create: imagesWithPrimary.map((img: any) => ({
              url: img.url,
              order: img.order,
              isPrimary: img.isPrimary
            }))
          },
          features: {
            create: (carData.features || []).map((feature: any) => ({
              name: feature.name,
              description: feature.description || ''
            }))
          }
        },
        include: {
          images: true,
          features: true
        }
      })

      console.log('Auto creado exitosamente:', car.id)
      res.status(201).json(car)

    } catch (error) {
      console.error('Error detallado al crear auto:', error)
      res.status(500).json({ 
        error: 'Error creating car',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}