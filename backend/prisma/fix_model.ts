import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const setting = await prisma.settings.findFirst({ orderBy: { updatedAt: 'desc' } });
  if (!setting) return;
  console.log('Current Model in DB:', (setting as any)?.chatbotModel);
  
  if ((setting as any)?.chatbotModel !== 'gemma-4-26b-a4b-it') {
    await prisma.settings.update({
      where: { id: setting.id },
      data: { chatbotModel: 'gemma-4-26b-a4b-it' } as any
    });
    console.log('Successfully updated the DB to gemma-4-26b-a4b-it!');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
