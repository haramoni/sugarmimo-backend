import sharp from 'sharp';

const DATA_URL_PATTERN = /^data:([^;]+);base64,(.+)$/s;

export async function createCardThumbnailDataUrl(dataUrl: string) {
  const match = dataUrl.match(DATA_URL_PATTERN);

  if (!match) {
    return undefined;
  }

  try {
    const original = Buffer.from(match[2], 'base64');
    const thumbnail = await sharp(original)
      .rotate()
      .resize({
        width: 480,
        height: 360,
        fit: 'cover',
        position: 'attention',
        withoutEnlargement: true,
      })
      .webp({ quality: 72, effort: 2 })
      .toBuffer();

    return `data:image/webp;base64,${thumbnail.toString('base64')}`;
  } catch {
    return undefined;
  }
}
