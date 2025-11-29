import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  await prisma.user.upsert({
    where: { email: 'admin@autofacil.com' },
    update: {},
    create: {
      email: 'admin@autofacil.com',
      password: hashedPassword,
      name: 'Administrador'
    }
  })
  
  console.log('Usuario admin creado: admin@autofacil.com / admin123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())