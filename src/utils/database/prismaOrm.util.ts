// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import "dotenv/config";
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/generated/prisma/client';

const connectionString = `${process.env.DATABASE_URL}`

// Create a connection pool with proper limits for Supabase session mode
// In session mode with connection_limit=10, we need to stay well below that limit
const pool = new Pool({ 
  connectionString,
  max: 5, // Maximum number of clients in the pool (stay below connection_limit)
  min: 0, // Minimum number of idle clients
  idleTimeoutMillis: 10000, // Close idle clients after 10 seconds
  connectionTimeoutMillis: 5000, // Return an error after 5 seconds if unable to connect
})

const adapter = new PrismaPg(pool)
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({ adapter });
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient({ adapter });
  }
  prisma = global.prisma;
}

export default prisma;
