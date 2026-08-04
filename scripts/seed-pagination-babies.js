require('dotenv/config');

const bcrypt = require('bcrypt');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
const { PrismaClient } = require('@prisma/client');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL nao foi encontrada no ambiente ou arquivo .env.');
}

const databaseUrl = new URL(process.env.DATABASE_URL);
const adapter = new PrismaMariaDb({
  host: databaseUrl.hostname,
  port: Number(databaseUrl.port || 3306),
  user: decodeURIComponent(databaseUrl.username),
  password: decodeURIComponent(databaseUrl.password),
  database: databaseUrl.pathname.replace(/^\//, ''),
  connectionLimit: 2,
  allowPublicKeyRetrieval: true,
});
const prisma = new PrismaClient({ adapter });

const TEST_USER_PREFIX = 'pagination_baby_';
const TEST_EMAIL_DOMAIN = 'pagination-test.sugarmimo.invalid';
const TEST_PASSWORD = 'Teste123!';
const TEST_PHOTO =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

async function main() {
  const passwordHash = await bcrypt.hash(TEST_PASSWORD, 10);
  const baseCreatedAt = Date.now() - 20 * 60 * 1000;

  for (let index = 1; index <= 20; index += 1) {
    const suffix = String(index).padStart(2, '0');
    const username = `${TEST_USER_PREFIX}${suffix}`;
    const email = `${username}@${TEST_EMAIL_DOMAIN}`;
    const createdAt = new Date(baseCreatedAt + index * 60 * 1000);
    const commonData = {
      email,
      passwordHash,
      role: 'SUGAR_BABY',
      gender: 'sugar-baby-woman',
      lookingFor: 'sugar-daddy',
      birthDate: new Date('1998-01-15T00:00:00.000Z'),
      country: 'Brasil',
      state: 'SP',
      city: 'Sao Paulo',
      whatsapp: `+55119999${String(index).padStart(4, '0')}`,
      instagram: `@${username}`,
      approvalStatus: 'PENDING',
      reviewedAt: null,
      createdAt,
    };

    await prisma.user.upsert({
      where: { username },
      create: {
        username,
        ...commonData,
        photos: {
          create: {
            dataUrl: TEST_PHOTO,
            fileName: `${username}.png`,
            mimeType: 'image/png',
            sortOrder: 1,
          },
        },
      },
      update: {
        ...commonData,
        photos: {
          deleteMany: {},
          create: {
            dataUrl: TEST_PHOTO,
            fileName: `${username}.png`,
            mimeType: 'image/png',
            sortOrder: 1,
          },
        },
      },
    });
  }

  const createdUsers = await prisma.user.count({
    where: {
      username: { startsWith: TEST_USER_PREFIX },
      role: 'SUGAR_BABY',
      approvalStatus: 'PENDING',
    },
  });
  const allPendingBabies = await prisma.user.count({
    where: {
      role: 'SUGAR_BABY',
      approvalStatus: 'PENDING',
    },
  });

  console.log(
    JSON.stringify({
      testUsersReady: createdUsers,
      totalPendingBabies: allPendingBabies,
      expectedPagesAtSixPerPage: Math.ceil(allPendingBabies / 6),
    }),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
