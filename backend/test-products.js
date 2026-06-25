const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

prisma.product.findMany({ take: 10, orderBy: { id: 'desc' } })
  .then(console.log)
  .finally(() => prisma.$disconnect());
