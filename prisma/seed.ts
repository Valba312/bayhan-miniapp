import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const u1 = await prisma.user.upsert({
    where: { tgId: '1001' },
    update: {},
    create: { tgId: '1001', firstName: 'Demo', lastName: 'Owner', role: 'OWNER' }
  });
  const u2 = await prisma.user.upsert({
    where: { tgId: '1002' },
    update: {},
    create: { tgId: '1002', firstName: 'Alex', lastName: 'Owner', role: 'OWNER' }
  });
  await prisma.user.upsert({
    where: { tgId: '9001' },
    update: { role: 'ADMIN' },
    create: { tgId: '9001', firstName: 'Bayhan', lastName: 'Admin', role: 'ADMIN' }
  });

  const villa = await prisma.property.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Villa FR',
      description: 'Современная вилла с видом на Средиземное море. Контакты управляющего: +33 6 00 00 00 00',
      location: "Côte d'Azur, France",
      lat: 43.552847,
      lng: 7.017369,
      images: [
        'https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1200&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1505692794403-34d4982f88aa?q=80&w=1200&auto=format&fit=crop'
      ],
      rooms: 4,
      areaM2: 240,
      fractionText: '1/8'
    }
  });

  await prisma.ownership.upsert({
    where: { userId_propertyId: { userId: u1.id, propertyId: villa.id } },
    update: {},
    create: { userId: u1.id, propertyId: villa.id, fraction: 12, queueIndex: 0, holidayQueueIndex: 0 }
  });
  await prisma.ownership.upsert({
    where: { userId_propertyId: { userId: u2.id, propertyId: villa.id } },
    update: {},
    create: { userId: u2.id, propertyId: villa.id, fraction: 12, queueIndex: 1, holidayQueueIndex: 1 }
  });

  const today = new Date();
  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + ((1 + 7 - today.getDay()) % 7));

  const actions: any[] = [];
  for (let i = 0; i < 12; i++) {
    const start = new Date(nextMonday);
    start.setDate(start.getDate() + i * 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    const isHoliday = i === 5;
    actions.push(prisma.bookingSlot.upsert({
      where: { propertyId_startDate: { propertyId: villa.id, startDate: start } },
      update: {},
      create: {
        propertyId: villa.id,
        startDate: start,
        endDate: end,
        slotType: isHoliday ? 'HOLIDAY' : 'REGULAR',
        isOpen: i !== 2
      }
    }));
  }
  await Promise.all(actions);

  await prisma.holiday.upsert({
    where: { date: new Date(new Date().getFullYear(), 11, 31) },
    update: {},
    create: { date: new Date(new Date().getFullYear(), 11, 31), name: 'Новый год' }
  });

  console.log('Seed completed');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });