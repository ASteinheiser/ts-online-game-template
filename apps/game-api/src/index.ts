import { listen } from '@colyseus/tools';
import { setupApp } from './app.config';
import { authClient } from './auth/client';
import { PrismaClient } from './prisma-client';

const PORT = Number(process.env.PORT);
if (isNaN(PORT)) throw new Error('PORT must be a number');
if (PORT < 1024 || PORT > 49151) throw new Error('PORT must be between 1024 and 49151');

const prisma = new PrismaClient();
const app = setupApp({ authClient, prisma });

listen(app, PORT);
