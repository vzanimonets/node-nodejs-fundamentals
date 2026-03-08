import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const SNAPSHOT_FILE = path.join(__dirname, "snapshot.json");
const RESTORE_DIR = path.join(__dirname, "workspace_restored");

const restore = async () => {
  try {
    const snapshot = JSON.parse(await fs.readFile(SNAPSHOT_FILE, "utf8"));

    const exists = await fs.access(RESTORE_DIR).then(() => true).catch(() => false);
    if (exists) {
      throw new Error();
    }

    await fs.mkdir(RESTORE_DIR);

    for (const { path: entryPath, type, content } of snapshot.entries) {
      const target = path.join(RESTORE_DIR, entryPath);

      if (type === "directory") {
        await fs.mkdir(target, { recursive: true });
      } else {
        await fs.mkdir(path.dirname(target), { recursive: true });
        await fs.writeFile(target, Buffer.from(content, "base64"));
      }
    }

  } catch {
    throw new Error("FS operation failed");
  }
};

await restore();
