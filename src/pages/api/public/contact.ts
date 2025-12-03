// pages/api/public/contact.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

type ContactRaw = {
  address?: string
  phones?: string
  emails?: string
  hours?: string
  lat?: number
  lng?: number
  locationName?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).end()

  try {
    const content = await prisma.siteContent.findUnique({
      where: { key: 'contact_info' }
    })

    const defaultData: ContactRaw = {
      address: "Av. Principal 123\nCiudad de México, CDMX 01234\nMéxico",
      phones: "+52 (55) 1234-5678\n+52 (55) 9876-5432",
      emails: "info@autofacil.com.mx\nventas@autofacil.com.mx",
      hours: "Lunes - Viernes: 9:00 AM - 7:00 PM\nSábado: 10:00 AM - 6:00 PM\nDomingo: Cerrado",
      lat: 19.4326,
      lng: -99.1332,
      locationName: "AutoFácil - Crédito Inmediato"
    }

    const raw = { ...defaultData, ...(content?.value as ContactRaw || {}) }

    const data = {
      address: (raw.address || '').split('\n').map(s => s.trim()).filter(Boolean),
      phones: (raw.phones || '').split('\n').map(s => s.trim()).filter(Boolean),
      emails: (raw.emails || '').split('\n').map(s => s.trim()).filter(Boolean),
      hours: (raw.hours || '').split('\n').map(s => s.trim()).filter(Boolean),
      location: {
        lat: raw.lat || 19.4326,
        lng: raw.lng || -99.1332,
        name: raw.locationName || "AutoFácil - Crédito Inmediato"
      }
    }

    res.status(200).json(data)
  } catch (error) {
    console.error('Error /api/public/contact:', error)
    res.status(500).json({ error: 'Error interno' })
  }
}