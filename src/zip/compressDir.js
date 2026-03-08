import { promises as fs } from "node:fs";
import { createWriteStream } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createBrotliCompress } from "node:zlib";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WORKSPACE_DIR = path.join(__dirname, "workspace");
const TO_COMPRESS_DIR = path.join(WORKSPACE_DIR, "toCompress");
const COMPRESSED_DIR = path.join(WORKSPACE_DIR, "compressed");
const ARCHIVE_FILE = path.join(COMPRESSED_DIR, "archive.br");

const compressDir = async () => {


  try {
    const stat = await fs.stat(TO_COMPRESS_DIR);
    if (!stat.isDirectory()) throw new Error();

    const entries = [];

    const scan = async (dir) => {
      const items = await fs.readdir(dir, { withFileTypes: true });

      for (const item of items) {
        const abs = path.join(dir, item.name);
        const rel = path.relative(TO_COMPRESS_DIR, abs);

        if (item.isDirectory()) {
          entries.push({ path: rel, type: "directory" });
          await scan(abs);
        } else if (item.isFile()) {
          const size = (await fs.stat(abs)).size;

          // Потоковое чтение → base64 без загрузки всего файла в память
          const fileStream = createReadStream(abs);
          const chunks = [];

          for await (const chunk of fileStream) {
            chunks.push(chunk);
          }

          const buffer = Buffer.concat(chunks);

          entries.push({
            path: rel,
            type: "file",
            size,
            content: buffer.toString("base64"),
          });
        }
      }
    };

    await scan(TO_COMPRESS_DIR);

    await fs.mkdir(COMPRESSED_DIR, { recursive: true });

    const archiveData = JSON.stringify({
      rootPath: TO_COMPRESS_DIR,
      entries,
    });

    const readable = Readable.from([archiveData]);
    const brotli = createBrotliCompress();
    const writeStream = createWriteStream(ARCHIVE_FILE);

    await pipeline(readable, brotli, writeStream);
  } catch {
    throw new Error("FS operation failed");
  }
};

await compressDir();
