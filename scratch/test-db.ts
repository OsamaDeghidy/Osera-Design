import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Attempting to connect to MongoDB...');
  try {
    // Try a simple operation
    const userCount = await prisma.user.count();
    console.log('✅ Connection Successful! User count:', userCount);
  } catch (error: any) {
    console.error('❌ Connection Failed!');
    console.error('Error Message:', error.message);
    if (error.message.includes('timeout')) {
      console.log('\n💡 Tip: This looks like a Network/IP Whitelist issue.');
      console.log('1. Go to MongoDB Atlas -> Network Access.');
      console.log('2. Add "Allow Access From Anywhere" (0.0.0.0/0) just to test.');
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
