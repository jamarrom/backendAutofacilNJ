// prisma/seed-contact.ts
import {prisma} from '../src/lib/prisma'

const CONTACT_KEY = 'contact_info'

const DEFAULT_DATA = {
  address: "Av. Principal 123\nCiudad de México, CDMX 01234\nMéxico",
  phones: "+52 (55) 1234-5678\n+52 (55) 9876-5432",
  emails: "info@autofacil.com.mx\nventas@autofacil.com.mx",
  hours: "Lunes - Viernes: 9:00 AM - 7:00 PM\nSábado: 10:00 AM - 6:00 PM\nDomingo: Cerrado"
}

async function main() {
  console.log('Iniciando seeder de información de contacto...')

  const existing = await prisma.siteContent.findUnique({
    where: { key: CONTACT_KEY }
  })

  if (existing) {
    console.log('Ya existe información de contacto. Actualizando...')
    await prisma.siteContent.update({
      where: { key: CONTACT_KEY },
      data: { value: DEFAULT_DATA }
    })
    console.log('Información de contacto actualizada!')
  } else {
    console.log('No existe. Creando nuevo registro...')
    await prisma.siteContent.create({
      data: {
        key: CONTACT_KEY,
        value: DEFAULT_DATA
      }
    })
    console.log('Información de contacto creada con éxito!')
  }
}

main()
  .catch((e) => {
    console.error('Error en el seeder:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })