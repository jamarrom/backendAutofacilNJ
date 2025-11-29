import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../pages/api/auth/[...nextauth]'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)

  if (req.method === 'GET') {
    try {
      const sliders = await prisma.homeSlider.findMany({
        orderBy: { order: 'asc' },
        where: { isActive: true }
      })
      res.json(sliders)
    } catch (error) {
      res.status(500).json({ error: 'Error fetching home sliders' })
    }
  } 
  else if (req.method === 'POST') {
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    try {
      const slider = await prisma.homeSlider.create({
        data: req.body
      })
      res.status(201).json(slider)
    } catch (error) {
      res.status(500).json({ error: 'Error creating home slider' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}