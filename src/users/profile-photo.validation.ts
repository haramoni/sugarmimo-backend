import { BadRequestException } from '@nestjs/common';

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const MAX_TOTAL_PHOTO_BYTES = 15 * 1024 * 1024;

type ProfilePhotoInput = {
  dataUrl: string;
  mimeType?: string;
};

export function validateProfilePhotos(photos: ProfilePhotoInput[]) {
  let totalBytes = 0;

  for (const photo of photos) {
    if (!photo.mimeType || !ALLOWED_IMAGE_TYPES.has(photo.mimeType)) {
      throw new BadRequestException(
        'As fotos devem estar nos formatos JPEG, PNG ou WebP.',
      );
    }

    const prefix = `data:${photo.mimeType};base64,`;
    if (!photo.dataUrl.startsWith(prefix)) {
      throw new BadRequestException('Conteúdo de foto inválido.');
    }

    const base64 = photo.dataUrl.slice(prefix.length);
    if (!base64 || !/^[A-Za-z0-9+/]+={0,2}$/.test(base64)) {
      throw new BadRequestException('Conteúdo de foto inválido.');
    }

    const decodedPhoto = Buffer.from(base64, 'base64');
    if (!hasExpectedImageSignature(decodedPhoto, photo.mimeType)) {
      throw new BadRequestException('Conteúdo de foto inválido.');
    }

    if (decodedPhoto.byteLength > MAX_PHOTO_BYTES) {
      throw new BadRequestException('Cada foto pode ter no máximo 5 MB.');
    }

    totalBytes += decodedPhoto.byteLength;
  }

  if (totalBytes > MAX_TOTAL_PHOTO_BYTES) {
    throw new BadRequestException(
      'O conjunto de fotos pode ter no máximo 15 MB.',
    );
  }
}

function hasExpectedImageSignature(data: Buffer, mimeType: string) {
  if (mimeType === 'image/jpeg') {
    return data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff;
  }

  if (mimeType === 'image/png') {
    return data
      .subarray(0, 8)
      .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  }

  if (mimeType === 'image/webp') {
    return (
      data.subarray(0, 4).toString('ascii') === 'RIFF' &&
      data.subarray(8, 12).toString('ascii') === 'WEBP'
    );
  }

  return false;
}
