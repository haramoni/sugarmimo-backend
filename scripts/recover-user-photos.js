require('dotenv/config');

const fs = require('node:fs');
const path = require('node:path');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
const { PrismaClient } = require('@prisma/client');

const email = process.argv[2]?.trim().toLowerCase();

if (!email) {
  console.error(
    'Uso: node scripts/recover-user-photos.js <email> [pasta-de-saida]',
  );
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL nao foi encontrada no ambiente ou arquivo .env.');
  process.exit(1);
}

const databaseUrl = new URL(process.env.DATABASE_URL);
const adapter = new PrismaMariaDb({
  host: databaseUrl.hostname,
  port: Number(databaseUrl.port || 3306),
  user: decodeURIComponent(databaseUrl.username),
  password: decodeURIComponent(databaseUrl.password),
  database: databaseUrl.pathname.replace(/^\//, ''),
  connectionLimit: 1,
  allowPublicKeyRetrieval: true,
});
const prisma = new PrismaClient({ adapter });

const extensionByMimeType = {
  'image/avif': '.avif',
  'image/gif': '.gif',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/svg+xml': '.svg',
  'image/webp': '.webp',
};

function safeFilePart(value) {
  return value.replace(/[^a-zA-Z0-9._-]/g, '_');
}

function decodePhoto(photo) {
  const dataUrlMatch = photo.dataUrl.match(/^data:([^;,]+);base64,([\s\S]+)$/);

  if (dataUrlMatch) {
    return {
      mimeType: dataUrlMatch[1],
      buffer: Buffer.from(dataUrlMatch[2].replace(/\s/g, ''), 'base64'),
    };
  }

  const compactValue = photo.dataUrl.replace(/\s/g, '');
  if (/^[A-Za-z0-9+/]+={0,2}$/.test(compactValue)) {
    return {
      mimeType: photo.mimeType || 'application/octet-stream',
      buffer: Buffer.from(compactValue, 'base64'),
    };
  }

  return null;
}

async function main() {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      photos: {
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        select: {
          id: true,
          dataUrl: true,
          fileName: true,
          mimeType: true,
          sortOrder: true,
          isPrivate: true,
          createdAt: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error(`Usuario nao encontrado: ${email}`);
  }

  const requestedOutput = process.argv[3];
  const defaultOutput = path.join(
    process.cwd(),
    'recovered-photos',
    safeFilePart(email),
  );
  const outputDirectory = path.resolve(requestedOutput || defaultOutput);

  fs.mkdirSync(outputDirectory, { recursive: true, mode: 0o700 });

  const report = {
    email: user.email,
    userId: user.id,
    recordsFound: user.photos.length,
    recovered: [],
    notRecovered: [],
  };

  for (const photo of user.photos) {
    const decoded = decodePhoto(photo);

    if (!decoded || decoded.buffer.length === 0) {
      report.notRecovered.push({
        id: photo.id,
        fileName: photo.fileName,
        reason: 'Conteudo ausente ou nao armazenado como Base64',
      });
      continue;
    }

    const extension =
      extensionByMimeType[decoded.mimeType] ||
      path.extname(photo.fileName || '') ||
      '.bin';
    const originalBaseName = safeFilePart(
      path.parse(photo.fileName || `foto-${photo.id}`).name,
    );
    const outputName = `${String(photo.sortOrder).padStart(2, '0')}-${originalBaseName}-${photo.id.slice(0, 8)}${extension}`;
    const outputPath = path.join(outputDirectory, outputName);

    fs.writeFileSync(outputPath, decoded.buffer, { mode: 0o600 });
    report.recovered.push({
      id: photo.id,
      fileName: outputName,
      mimeType: decoded.mimeType,
      bytes: decoded.buffer.length,
      isPrivate: photo.isPrivate,
      createdAt: photo.createdAt,
    });
  }

  const reportPath = path.join(outputDirectory, 'recovery-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), {
    encoding: 'utf8',
    mode: 0o600,
  });

  console.log(`Registros encontrados: ${report.recordsFound}`);
  console.log(`Imagens recuperadas: ${report.recovered.length}`);
  console.log(`Nao recuperadas: ${report.notRecovered.length}`);
  console.log(`Pasta de saida: ${outputDirectory}`);
  console.log(`Relatorio: ${reportPath}`);
}

main()
  .catch((error) => {
    console.error(`Falha na recuperacao: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
