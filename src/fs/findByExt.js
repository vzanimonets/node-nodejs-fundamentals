import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WORKSPACE_DIR = path.join(__dirname, "workspace");

const findByExt = async () => {
  try {
    const { ext = ".txt" } = (() => {
      const args = process.argv.slice(2);
      const i = args.indexOf("--ext");
      const e = i !== -1 ? args[i + 1] : ".txt";
      return { ext: e?.startsWith(".") ? e : `.${e}` };
    })();

    const stat = await fs.stat(WORKSPACE_DIR);
    if (!stat.isDirectory()) throw new Error();

    const results = [];

    const scan = async (dir) => {
      for (const item of await fs.readdir(dir, { withFileTypes: true })) {
        const abs = path.join(dir, item.name);

        if (item.isDirectory()) {
          await walk(abs);
        } else if (item.isFile() && path.extname(item.name) === ext) {
          results.push(path.relative(WORKSPACE_DIR, abs));
        }
      }
    };

    await scan(WORKSPACE_DIR);

    results.sort().forEach((f) => console.log(f));

  } catch {
    throw new Error("FS operation failed");
  }
};

await findByExt();
