require('dotenv/config');

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const bcrypt = require('bcrypt');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
const { PrismaClient } = require('@prisma/client');

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL nao foi encontrada no ambiente ou arquivo .env.',
  );
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

const TEST_USER_PREFIX = 'teste_daddy_';
const TEST_EMAIL_DOMAIN = 'seed-test.sugarmimo.invalid';
const PHOTO_PATH = path.join(__dirname, 'assets', 'test-daddy-suit.webp');
const cities = [
  ['Sao Paulo', 'SP'],
  ['Rio de Janeiro', 'RJ'],
  ['Belo Horizonte', 'MG'],
  ['Curitiba', 'PR'],
  ['Florianopolis', 'SC'],
  ['Porto Alegre', 'RS'],
  ['Brasilia', 'DF'],
  ['Goiania', 'GO'],
  ['Salvador', 'BA'],
  ['Recife', 'PE'],
];

async function removeTestProfiles() {
  const result = await prisma.user.deleteMany({
    where: { username: { startsWith: TEST_USER_PREFIX } },
  });
  console.log(JSON.stringify({ removedTestDaddies: result.count }));
}

async function seedTestProfiles() {
  const photoDataUrl = `data:image/webp;base64,${fs.readFileSync(PHOTO_PATH).toString('base64')}`;
  const passwordHash = await bcrypt.hash(crypto.randomUUID(), 10);
  const baseActivity = Date.now() - 30 * 60 * 1000;

  for (let index = 1; index <= 20; index += 1) {
    const suffix = String(index).padStart(2, '0');
    const username = `${TEST_USER_PREFIX}${suffix}`;
    const email = `${username}@${TEST_EMAIL_DOMAIN}`;
    const [city, state] = cities[(index - 1) % cities.length];
    const isPremiere = index <= 7;
    const lastActiveAt = new Date(baseActivity + index * 60 * 1000);
    const commonData = {
      email,
      passwordHash,
      role: 'SUGAR_DADDY',
      gender: 'sugar-daddy',
      lookingFor: 'sugar-baby',
      birthDate: new Date(`${1972 + (index % 14)}-06-15T00:00:00.000Z`),
      country: 'Brasil',
      state,
      city,
      approvalStatus: 'APPROVED',
      accountStatus: 'ACTIVE',
      reviewedAt: new Date(),
      lastActiveAt,
      isPremium: false,
      isPremiere,
    };
    const profileDetails = {
      introductionPhrase: isPremiere
        ? `Perfil Premiere ficticio para teste ${suffix}`
        : `Perfil ficticio para teste ${suffix}`,
      aboutMe:
        'Perfil gerado exclusivamente para validar a busca do Sugar Mimo.',
      lookingFor: 'Testar a exibicao e a paginacao dos resultados.',
      preferences: { seedTestProfile: true },
    };
    const photo = {
      dataUrl: photoDataUrl,
      fileName: `test-daddy-suit-${suffix}.webp`,
      mimeType: 'image/webp',
      sortOrder: 1,
      isPrivate: false,
    };

    await prisma.user.upsert({
      where: { username },
      create: {
        username,
        ...commonData,
        photos: { create: photo },
        appearance: {
          create: {
            bodyType: 'Atletico',
            hairColor: 'Castanho',
            eyeColor: 'Castanho',
          },
        },
        preferences: { create: profileDetails },
      },
      update: {
        ...commonData,
        photos: { deleteMany: {}, create: photo },
        appearance: {
          upsert: {
            create: {
              bodyType: 'Atletico',
              hairColor: 'Castanho',
              eyeColor: 'Castanho',
            },
            update: {
              bodyType: 'Atletico',
              hairColor: 'Castanho',
              eyeColor: 'Castanho',
            },
          },
        },
        preferences: {
          upsert: { create: profileDetails, update: profileDetails },
        },
      },
    });
  }

  const [total, premiere, regular, photos] = await Promise.all([
    prisma.user.count({
      where: { username: { startsWith: TEST_USER_PREFIX } },
    }),
    prisma.user.count({
      where: { username: { startsWith: TEST_USER_PREFIX }, isPremiere: true },
    }),
    prisma.user.count({
      where: { username: { startsWith: TEST_USER_PREFIX }, isPremiere: false },
    }),
    prisma.userPhoto.count({
      where: { user: { username: { startsWith: TEST_USER_PREFIX } } },
    }),
  ]);

  console.log(
    JSON.stringify({ totalTestDaddies: total, premiere, regular, photos }),
  );
}

const action = process.argv[2];

(action === '--remove' ? removeTestProfiles() : seedTestProfiles())
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
