import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  const { id } = req.query

  if (req.method === 'GET') {
    // Obtener auto específico (público)
    try {
      const car = await prisma.car.findUnique({
        where: { id: id as string },
        include: {
          images: {
            orderBy: { order: 'asc' }
          },
          features: true
        }
      })

      if (!car) {
        return res.status(404).json({ error: 'Car not found' })
      }

      res.json(car)
    } catch (error) {
      res.status(500).json({ error: 'Error fetching car' })
    }
  } 
  else if (req.method === 'PUT') {
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    try {
      console.log('Actualizando auto:', id)
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
        isPrimary: img.isPrimary || index === 0
      }))

      const car = await prisma.car.update({
        where: { id: id as string },
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
            deleteMany: {}, // Eliminar imágenes existentes
            create: imagesWithPrimary.map((img: any) => ({
              url: img.url,
              order: img.order,
              isPrimary: img.isPrimary
            }))
          },
          features: {
            deleteMany: {}, // Eliminar características existentes
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

      console.log('Auto actualizado exitosamente:', car.id)
      res.json(car)

    } catch (error) {
      console.error('Error detallado al actualizar auto:', error)
      res.status(500).json({ 
        error: 'Error updating car',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  } 
  else if (req.method === 'DELETE') {
    // Eliminar auto (requiere autenticación)
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    try {
      await prisma.car.delete({
        where: { id: id as string }
      })

      res.status(204).end()
    } catch (error) {
      res.status(500).json({ error: 'Error deleting car' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}