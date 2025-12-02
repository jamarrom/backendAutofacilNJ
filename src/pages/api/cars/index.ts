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
      const carData = req.body
      
      const car = await prisma.car.create({
        data: {
          ...carData,
          images: {
            create: carData.images || []
          },
          features: {
            create: carData.features || []
          }
        },
        include: {
          images: true,
          features: true
        }
      })

      res.status(201).json(car)
    } catch (error) {
      res.status(500).json({ error: 'Error creating car' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}