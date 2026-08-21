import sharp from 'sharp';
import { createCardThumbnailDataUrl } from './profile-photo-thumbnail';

describe('profile card thumbnail', () => {
  it('creates a compact WebP card image without cropping the original ratio', async () => {
    const original = await sharp({
      create: {
        width: 900,
        height: 1200,
        channels: 3,
        background: '#006c58',
      },
    })
      .jpeg()
      .toBuffer();

    const result = await createCardThumbnailDataUrl(
      `data:image/jpeg;base64,${original.toString('base64')}`,
    );
    const thumbnail = Buffer.from(result!.split(',')[1], 'base64');
    const metadata = await sharp(thumbnail).metadata();

    expect(result).toMatch(/^data:image\/webp;base64,/);
    expect(metadata.width).toBe(450);
    expect(metadata.height).toBe(600);
    expect(thumbnail.byteLength).toBeLessThan(original.byteLength);
  });

  it('ignores invalid legacy image data without breaking profile loading', async () => {
    await expect(
      createCardThumbnailDataUrl('not-a-data-url'),
    ).resolves.toBeUndefined();
  });
});
