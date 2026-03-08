import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WORKSPACE_DIR = path.join(__dirname, "workspace");
const SNAPSHOT_FILE = path.join(__dirname, "snapshot.json");

const snapshot = async () => {
  try {
    const stat = await fs.stat(WORKSPACE_DIR);

    if (!stat.isDirectory()) {
      throw new Error();
    }

    const entries = [];

    const scan = async (dir) => {
      const items = await fs.readdir(dir, { withFileTypes: true });

      for (const item of items) {
        const absPath = path.join(dir, item.name);
        const relPath = path.relative(WORKSPACE_DIR, absPath);

        if (item.isDirectory()) {
          entries.push({
            path: relPath,
            type: "directory",
          });

          await scan(absPath);
        } else if (item.isFile()) {
          const fileBuffer = await fs.readFile(absPath);

          entries.push({
            path: relPath,
            type: "file",
            size: fileBuffer.length,
            content: fileBuffer.toString("base64"),
          });
        }
      }
    };

    await scan(WORKSPACE_DIR);

    const snapshotData = {
      rootPath: WORKSPACE_DIR,
      entries,
    };

    await fs.writeFile(SNAPSHOT_FILE, JSON.stringify(snapshotData, null, 2));
  } catch {
    throw new Error("FS operation failed");
  }
};

await snapshot();


