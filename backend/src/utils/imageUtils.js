import sharp from 'sharp';
import crypto from 'node:crypto';

export function generateUniqueFilename(ext) {
    return crypto.randomBytes(32).toString('hex') + ext;
}

export async function makeVariants(image) {
    const variants = {
        small: {
            filename: generateUniqueFilename('.jpg'),
            mimetype: 'image/jpeg',
            encoding: '7bit',
            size: 0
        },
        medium: {
            filename: generateUniqueFilename('.jpg'),
            mimetype: 'image/jpeg',
            encoding: '7bit',
            size: 0
        },
        large: {
            filename: generateUniqueFilename('.jpg'),
            mimetype: 'image/jpeg',
            encoding: '7bit',
            size: 0
        },
        extraLarge: {
            filename: generateUniqueFilename('.jpg'),
            mimetype: 'image/jpeg',
            encoding: '7bit',
            size: 0
        }
    };

    const data100 = await sharp(image.buffer)
        .resize(100, 100)
        .jpeg({ quality: 80 })
        .toBuffer();
    variants.small.size = data100.length;
    variants.small.buffer = data100;

    const data400 = await sharp(image.buffer)
        .resize(400, 400)
        .jpeg({ quality: 80 })
        .toBuffer();
    variants.medium.size = data400.length;
    variants.medium.buffer = data400;

    const data800 = await sharp(image.buffer)
        .resize(800, 800)
        .jpeg({ quality: 80 })
        .toBuffer();
    variants.large.size = data800.length;
    variants.large.buffer = data800;

    const data1200 = await sharp(image.buffer)
        .resize(1200, 1200)
        .jpeg({ quality: 80 })
        .toBuffer();
    variants.extraLarge.size = data1200.length;
    variants.extraLarge.buffer = data1200;
    
    return variants;
}