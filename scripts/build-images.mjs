import { mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const PUBLIC_DIR = path.resolve('public');
const MEDIA_DIR = path.join(PUBLIC_DIR, 'media');
const OUTPUT_DIR = path.join(PUBLIC_DIR, 'generated', 'media');
const SOURCE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png']);
const WIDTHS = [640, 960, 1280, 1600, 1920];

async function listImages(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const filePath = path.join(directory, entry.name);

    if (entry.isDirectory()) return listImages(filePath);
    if (!SOURCE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) return [];

    return [filePath];
  }));

  return files.flat();
}

async function convertImage(sourcePath) {
  const relativePath = path.relative(MEDIA_DIR, sourcePath);
  const parsed = path.parse(relativePath);
  const targetDir = path.join(OUTPUT_DIR, parsed.dir);

  await mkdir(targetDir, { recursive: true });

  await Promise.all(WIDTHS.flatMap((width) => {
    const basePipeline = sharp(sourcePath).rotate().resize({ width, withoutEnlargement: true });
    const baseName = `${parsed.name}-${width}`;

    return [
      basePipeline.clone().avif({ quality: 58, effort: 6 }).toFile(path.join(targetDir, `${baseName}.avif`)),
      basePipeline.clone().webp({ quality: 76 }).toFile(path.join(targetDir, `${baseName}.webp`)),
    ];
  }));
}

const images = await listImages(MEDIA_DIR);
await Promise.all(images.map(convertImage));

console.log(`Generated AVIF/WebP variants for ${images.length} images.`);
