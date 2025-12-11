// api/cars/index.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../pages/api/auth/[...nextauth]'
import { prisma } from '../../../lib/prisma'
import { CarBrand, CarType, FuelType, TransmissionType, CarCategory, MediaType } from '@prisma/client'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { 
        category, 
        type, 
        brand, 
        minPrice, 
        maxPrice, 
        minYear, 
        maxYear, 
        fuelType,
        transmission,
        isFeatured 
      } = req.query
      
      const where: any = {}
      
      // Filtros exactos (enums)
      if (category) where.category = category
      if (type) where.type = type
      if (brand) where.brand = brand
      if (fuelType) where.fuelType = fuelType
      if (transmission) where.transmission = transmission
      if (isFeatured !== undefined) where.isFeatured = isFeatured === 'true'
      
      // Filtros de rango
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
            orderBy: [{ isPrimary: 'desc' }, { order: 'asc' }]
          },
          features: true
        },
        orderBy: { createdAt: 'desc' }
      })

      res.json(cars)
    } catch (error) {
      console.error('Error fetching cars:', error)
      res.status(500).json({ error: 'Error fetching cars' })
    }
  } 
  else if (req.method === 'POST') {
    const session = await getServerSession(req, res, authOptions)
    
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    try {
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
      
      // ========== CREACIÓN DEL VEHÍCULO ==========
      const car = await prisma.car.create({
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

      res.status(201).json(car)
    } catch (error: any) {
      console.error('Error creating car:', error)
      
      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'Error de duplicación en la base de datos' })
      }
      
      res.status(500).json({ 
        error: 'Error al crear el vehículo',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}