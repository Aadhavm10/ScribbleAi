const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const conversations = await prisma.conversation.count();
    console.log('Conversation table exists. Count:', conversations);
  } catch (error) {
    console.error('Conversation table error:', error.message);
  }

  try {
    const messages = await prisma.conversationMessage.count();
    console.log('ConversationMessage table exists. Count:', messages);
  } catch (error) {
    console.error('ConversationMessage table error:', error.message);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
