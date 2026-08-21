"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCardThumbnailDataUrl = createCardThumbnailDataUrl;
const sharp_1 = __importDefault(require("sharp"));
const DATA_URL_PATTERN = /^data:([^;]+);base64,(.+)$/s;
async function createCardThumbnailDataUrl(dataUrl) {
    if (typeof dataUrl !== 'string') {
        return undefined;
    }
    const match = dataUrl.match(DATA_URL_PATTERN);
    if (!match) {
        return undefined;
    }
    try {
        const original = Buffer.from(match[2], 'base64');
        const thumbnail = await (0, sharp_1.default)(original)
            .rotate()
            .resize({
            width: 480,
            height: 600,
            fit: 'inside',
            withoutEnlargement: true,
        })
            .webp({ quality: 72, effort: 2 })
            .toBuffer();
        return `data:image/webp;base64,${thumbnail.toString('base64')}`;
    }
    catch {
        return undefined;
    }
}
//# sourceMappingURL=profile-photo-thumbnail.js.map