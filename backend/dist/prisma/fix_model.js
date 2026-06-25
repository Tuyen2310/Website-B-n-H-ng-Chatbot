"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const setting = await prisma.settings.findFirst({ orderBy: { updatedAt: 'desc' } });
    if (!setting)
        return;
    console.log('Current Model in DB:', setting?.chatbotModel);
    if (setting?.chatbotModel !== 'gemma-4-26b-a4b-it') {
        await prisma.settings.update({
            where: { id: setting.id },
            data: { chatbotModel: 'gemma-4-26b-a4b-it' }
        });
        console.log('Successfully updated the DB to gemma-4-26b-a4b-it!');
    }
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=fix_model.js.map