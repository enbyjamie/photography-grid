import * as fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const EXIF = require('exifreader');

/**
 * Extracts EXIF data from an image file.
 * @param {string} imagePath - The path to the image file.
 * @returns {Promise<object|null>} The EXIF tags or null if an error occurs.
 */
async function extractEXIFData(imagePath) {
    try {
        const imageBuffer = await fs.readFile(imagePath);
        const tags = EXIF.load(imageBuffer);
        return tags;
    } catch (error) {
        console.error(`Error processing ${imagePath}:`, error);
        return null;
    }
}

async function processImages() {
    const imageData = {};
    const photographyDir = 'src/photo';
    const outputFilePath = 'src/image-data.json';

    async function traverseDir(dir) {
        const files = await fs.readdir(dir, { withFileTypes: true });

        for (const file of files) {
            const fullPath = path.join(dir, file.name);

            if (file.isDirectory()) {
                await traverseDir(fullPath); 
            } else if (/\.(jpg|jpeg|png|gif)$/i.test(file.name)) {
                const exifData = await extractEXIFData(fullPath);
                if (exifData) {
                    imageData[fullPath] = exifData;
                }
            }
        }
    }

    await traverseDir(photographyDir);

    await fs.writeFile(outputFilePath, JSON.stringify(imageData, null, 2));
    console.log(`EXIF data written to ${outputFilePath}`);
}

processImages();