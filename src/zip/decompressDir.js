import { promises as fs } from "node:fs";
import { createReadStream } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createBrotliDecompress } from "node:zlib";
import { Writable } from "node:stream";
import { pipeline } from "node:stream/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WORKSPACE_DIR = path.join(__dirname, "workspace");
const COMPRESSED_DIR = path.join(WORKSPACE_DIR, "compressed");
const DECOMPRESSED_DIR = path.join(WORKSPACE_DIR, "decompressed");
const ARCHIVE_FILE = path.join(COMPRESSED_DIR, "archive.br");

const decompressDir = async () => {
  try {
    await fs.stat(ARCHIVE_FILE);
    await fs.mkdir(DECOMPRESSED_DIR, { recursive: true });

    let json = "";

    const collector = new Writable({
      write(chunk, _enc, cb) {
        json += chunk;
        cb();
      },
    });

    const readStream = createReadStream(ARCHIVE_FILE);
    const brotli = createBrotliDecompress();

    await pipeline(readStream, brotli, collector);

    const { entries } = JSON.parse(json);

    for (const entry of entries) {
      const target = path.join(DECOMPRESSED_DIR, entry.path);

      if (entry.type === "directory") {
        await fs.mkdir(target, { recursive: true });
      } else if (entry.type === "file") {
        await fs.mkdir(path.dirname(target), { recursive: true });
        await fs.writeFile(target, Buffer.from(entry.content, "base64"));
      }
    }
  } catch {
    throw new Error("FS operation failed");
  }

};

await decompressDir();
