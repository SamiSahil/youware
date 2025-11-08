// backend/src/utils/prisma.js

const { PrismaClient } = require('@prisma/client');
const { withAccelerate } = require('@prisma/client/extension-accelerate');

// Use a single instance of Prisma Client
let prisma;

if (process.env.NODE_ENV === 'production') {
  // In production (on Vercel), use the Accelerate-enabled Prisma Client
  prisma = new PrismaClient().$extends(withAccelerate());
} else {
  // In development, use a global instance to avoid creating too many connections
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

module.exports = prisma;