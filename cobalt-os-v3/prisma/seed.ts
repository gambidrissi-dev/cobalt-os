import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('cobalt123', 10);

  // Création de la structure Micro-Entreprise (Exemple Gambi)
  const myCompany = await prisma.company.create({
    data: {
      name: "Micro Gambi",
      type: "MICRO"
    }
  });

  // Création de l'utilisateur Admin
  await prisma.user.upsert({
    where: { email: 'admin@cobalt.com' },
    update: {},
    create: {
      email: 'admin@cobalt.com',
      name: 'Gambi Admin',
      password: password,
      role: 'ADMIN',
      companyId: myCompany.id
    },
  });

  console.log('🌱 Base de données initialisée avec succès !');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });