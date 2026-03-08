import { promises as fs } from "fs";
import { createReadStream } from "fs";
import { createHash } from "crypto";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const verify = async () => {
  try {
    const checksumsPath = path.join(__dirname, "checksums.json");

    const data = await fs.readFile(checksumsPath, "utf8");
    const checksums = JSON.parse(data);

    for (const [filename, expectedHash] of Object.entries(checksums)) {
      const hash = createHash("sha256");
      const filePath = path.join(__dirname, filename);
      const stream = createReadStream(filePath);

      await new Promise((resolve, reject) => {
        stream.on("data", (chunk) => hash.update(chunk));
        stream.on("end", resolve);
        stream.on("error", reject);
      });

      const actualHash = hash.digest("hex");

      if (actualHash === expectedHash) {
        console.log(`${filename} — OK`);
      } else {
        console.log(`${filename} — FAIL`);
      }
    }
  } catch (err) {
    console.error(err);
    throw new Error("FS operation failed");
  }
};

await verify();
