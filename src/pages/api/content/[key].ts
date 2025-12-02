// pages/api/content/[key].ts
import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { prisma } from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req })
  if (!session) return res.status(401).json({ error: 'No autorizado' })

  const { key } = req.query

  if (req.method === 'GET') {
    const content = await prisma.siteContent.findUnique({ where: { key: key as string } })
    return res.status(200).json(content?.value || null)
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    const value = req.body

    const updated = await prisma.siteContent.upsert({
      where: { key: key as string },
      update: { value, updatedBy: session.user?.email || null },
      create: { key: key as string, value, updatedBy: session.user?.email || null }
    })

    return res.status(200).json({ success: true, data: updated })
  }

  res.status(405).json({ error: 'Método no permitido' })
}