import { chromium } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const SVG_PATH = path.resolve(process.cwd(), "public/faculty-logo.svg");
const OUT_DIR = path.resolve(process.cwd(), "public/icons");

function createIco(images: { width: number; height: number; buffer: Buffer }[]): Buffer {
  const count = images.length;
  const headerSize = 6;
  const entrySize = 16;
  let offset = headerSize + count * entrySize;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // icon type
  header.writeUInt16LE(count, 4); // number of images

  const entries: Buffer[] = [];
  const buffers: Buffer[] = [];

  for (const img of images) {
    const entry = Buffer.alloc(entrySize);
    entry.writeUInt8(img.width >= 256 ? 0 : img.width, 0);
    entry.writeUInt8(img.height >= 256 ? 0 : img.height, 1);
    entry.writeUInt8(0, 2); // color count
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(img.buffer.length, 8); // image size
    entry.writeUInt32LE(offset, 12); // image offset

    entries.push(entry);
    buffers.push(img.buffer);
    offset += img.buffer.length;
  }

  return Buffer.concat([header, ...entries, ...buffers]);
}

async function main() {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  const svgContent = fs.readFileSync(SVG_PATH, "utf-8");

  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROME_PATH,
  });

  const sizes = [16, 32, 48, 64, 128, 192, 256, 512];
  const renderedImages: { width: number; height: number; buffer: Buffer }[] = [];

  for (const size of sizes) {
    const page = await browser.newPage({
      viewport: { width: size, height: size },
      deviceScaleFactor: 1,
    });

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { background: transparent; overflow: hidden; display: flex; justify-content: center; align-items: center; width: ${size}px; height: ${size}px; }
            svg { width: ${size}px; height: ${size}px; }
          </style>
        </head>
        <body>
          ${svgContent}
        </body>
      </html>
    `;

    await page.setContent(html);
    const buffer = await page.screenshot({ omitBackground: true, type: "png" });
    await page.close();

    renderedImages.push({ width: size, height: size, buffer });

    if (size === 192) {
      fs.writeFileSync(path.join(OUT_DIR, "icon-192.png"), buffer);
      console.log("✓ Generated icon-192.png");
    }
    if (size === 512) {
      fs.writeFileSync(path.join(OUT_DIR, "icon-512.png"), buffer);
      fs.writeFileSync(path.join(OUT_DIR, "icon.png"), buffer);
      console.log("✓ Generated icon-512.png and icon.png");
    }
  }

  await browser.close();

  // Create multi-res .ico
  const icoBuffer = createIco(renderedImages);
  fs.writeFileSync(path.join(OUT_DIR, "icon.ico"), icoBuffer);
  console.log("✓ Generated multi-resolution Windows icon.ico");
  console.log("🎉 Icons generation complete!");
}

main().catch((err) => {
  console.error("Error generating icons:", err);
  process.exit(1);
});
