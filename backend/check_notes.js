const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const notes = await prisma.note.findMany({
    select: {
      id: true,
      title: true,
      content: true,
      userId: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });
  
  console.log('Total notes:', notes.length);
  console.log('Notes:', JSON.stringify(notes, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
