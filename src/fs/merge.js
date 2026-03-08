import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WORKSPACE_DIR = path.join(__dirname, "workspace");
const PARTS_DIR = path.join(WORKSPACE_DIR, "parts");
const OUTPUT_FILE = path.join(WORKSPACE_DIR, "merged.txt");

const merge = async () => {
  try {
    const partsStat = await fs.stat(PARTS_DIR).catch(() => { throw new Error(); });
    if (!partsStat.isDirectory()) throw new Error();


    const args = process.argv.slice(2);
    let filesToMerge = [];

    const filesArgIndex = args.indexOf("--files");
    if (filesArgIndex !== -1) {
      if (filesArgIndex === args.length - 1) throw new Error();
      filesToMerge = args[filesArgIndex + 1].split(",");
    } else {
      const allFiles = await fs.readdir(PARTS_DIR);
      filesToMerge = allFiles.filter(f => f.endsWith(".txt")).sort();
      if (filesToMerge.length === 0) throw new Error();
    }

    let mergedContent = "";
    for (const fileName of filesToMerge) {
      const filePath = path.join(PARTS_DIR, fileName);
      const fileStat = await fs.stat(filePath).catch(() => { throw new Error(); });
      if (!fileStat.isFile()) throw new Error();

      const content = await fs.readFile(filePath, "utf-8");
      mergedContent += content;
    }


    await fs.writeFile(OUTPUT_FILE, mergedContent, "utf-8");
  } catch {
    throw new Error("FS operation failed");
  }
};

await merge();
