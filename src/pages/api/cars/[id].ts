// api/cars/[id].ts - Actualizado
import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { prisma } from '../../../lib/prisma'
import { CarBrand, CarType, FuelType, TransmissionType, CarCategory, MediaType } from '@prisma/client'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  const { id } = req.query

  if (req.method === 'GET') {
    try {
      const car = await prisma.car.findUnique({
        where: { id: id as string },
        include: {
          images: {
            orderBy: [{ isPrimary: 'desc' }, { order: 'asc' }]
          },
          features: true
        }
      })

      if (!car) {
        return res.status(404).json({ error: 'Car not found' })
      }

      res.json(car)
    } catch (error) {
      console.error('Error fetching car:', error)
      res.status(500).json({ error: 'Error fetching car' })
    }
  } 
  else if (req.method === 'PUT') {
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    try {
      console.log('Actualizando auto:', id)
      const carData = req.body

      // ========== VALIDACIÓN DE DATOS ==========
      const requiredFields = ['title', 'brand', 'model', 'price', 'year', 'mileage', 'color', 'seats']
      for (const field of requiredFields) {
        if (!carData[field] && carData[field] !== 0) {
          return res.status(400).json({ error: `Campo requerido faltante: ${field}` })
        }
      }
      
      // Validar enums
      const validBrands = Object.values(CarBrand)
      if (!validBrands.includes(carData.brand)) {
        return res.status(400).json({ error: 'Marca inválida' })
      }
      
      const validTypes = Object.values(CarType)
      if (!validTypes.includes(carData.type)) {
        return res.status(400).json({ error: 'Tipo de vehículo inválido' })
      }
      
      const validFuelTypes = Object.values(FuelType)
      if (!validFuelTypes.includes(carData.fuelType)) {
        return res.status(400).json({ error: 'Tipo de combustible inválido' })
      }
      
      const validTransmissions = Object.values(TransmissionType)
      if (!validTransmissions.includes(carData.transmission)) {
        return res.status(400).json({ error: 'Tipo de transmisión inválido' })
      }
      
      const validCategories = Object.values(CarCategory)
      if (!validCategories.includes(carData.category)) {
        return res.status(400).json({ error: 'Categoría inválida' })
      }
      
      // Validar imágenes/videos
      if (!carData.images || carData.images.length === 0) {
        return res.status(400).json({ error: 'Se requiere al menos una imagen o video' })
      }
      
      // Validar que haya una imagen/video principal
      const hasPrimary = carData.images.some((img: any) => img.isPrimary)
      if (!hasPrimary) {
        return res.status(400).json({ error: 'Debe haber una imagen o video principal' })
      }
      
      // Validar thumbnails para videos
      const videosWithoutThumbnail = carData.images.filter(
        (img: any) => img.mediaType === 'VIDEO' && !img.thumbnailUrl
      )
      
      if (videosWithoutThumbnail.length > 0) {
        return res.status(400).json({ error: 'Todos los videos deben tener un thumbnail' })
      }

      // ========== ACTUALIZACIÓN DEL VEHÍCULO ==========
      const car = await prisma.car.update({
        where: { id: id as string },
        data: {
          // Información básica
          title: carData.title.trim(),
          brand: carData.brand,
          model: carData.model.trim(),
          year: parseInt(carData.year),
          price: parseFloat(carData.price),
          type: carData.type,
          fuelType: carData.fuelType,
          transmission: carData.transmission,
          mileage: parseInt(carData.mileage),
          color: carData.color.trim(),
          seats: parseInt(carData.seats),
          horsepower: carData.horsepower ? parseInt(carData.horsepower) : null,
          fuelEconomy: carData.fuelEconomy?.trim() || null,
          category: carData.category,
          isFeatured: Boolean(carData.isFeatured),
          description: carData.description?.trim() || null,
          
          // Imágenes/Videos
          images: {
            deleteMany: {}, // Eliminar imágenes existentes
            create: carData.images.map((img: any, index: number) => ({
              mediaType: img.mediaType || 'IMAGE',
              url: img.url,
              thumbnailUrl: img.thumbnailUrl || null,
              order: img.order !== undefined ? img.order : index,
              isPrimary: img.isPrimary || false
            }))
          },
          
          // Características
          features: {
            deleteMany: {}, // Eliminar características existentes
            create: (carData.features || []).map((feature: any) => ({
              name: feature.name?.trim() || '',
              description: feature.description?.trim() || null
            })).filter((feature: any) => feature.name)
          }
        },
        include: {
          images: true,
          features: true
        }
      })

      console.log('Auto actualizado exitosamente:', car.id)
      res.json(car)

    } catch (error: any) {
      console.error('Error detallado al actualizar auto:', error)
      res.status(500).json({ 
        error: 'Error updating car',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  } 
  else if (req.method === 'DELETE') {
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    try {
      await prisma.car.delete({
        where: { id: id as string }
      })

      res.status(204).end()
    } catch (error) {
      console.error('Error deleting car:', error)
      res.status(500).json({ error: 'Error deleting car' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}