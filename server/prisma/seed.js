const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const techs = [
    { name: 'Mike Rivera', phone: '+15550001111', specialty: 'Towing & Tire', email: 'mike@roadready.local' },
    { name: 'Sarah Chen', phone: '+15550002222', specialty: 'Electrical & Battery', email: 'sarah@roadready.local' },
    { name: 'James Okafor', phone: '+15550003333', specialty: 'General Roadside', email: 'james@roadready.local' },
  ];
  for (const tech of techs) {
    await prisma.technician.upsert({ where: { phone: tech.phone }, update: {}, create: tech });
  }
  console.log('Seeded 3 technicians');
}

main().finally(() => prisma.$disconnect());
