import { createReadStream, createWriteStream } from "node:fs";
import { Transform } from "node:stream";
import path from "node:path";
import { fileURLToPath } from "node:url";

const split = async () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const idx = process.argv.indexOf("--lines");
  let maxLines = 10;

  if (idx !== -1) {
    const value = Number(process.argv[idx + 1]);
    if (!Number.isInteger(value) || value <= 0) {
      console.error("Usage: node split.js --lines <positive number>");
      process.exit(1);
    }
    maxLines = value;
  }

  const inputPath = path.join(__dirname, "source.txt");

  let chunkIndex = 0;
  let linesInChunk = 0;
  let currentStream = null;
  let leftover = "";

  const openChunk = () => {
    if (currentStream) currentStream.end();
    chunkIndex++;
    linesInChunk = 0;
    currentStream = createWriteStream(
      path.join(__dirname, `chunk_${chunkIndex}.txt`)
    );
  };

  const transformer = new Transform({
    transform(chunk, _, cb) {
      const data = leftover + chunk.toString();
      const lines = data.split(/\r?\n/);
      leftover = lines.pop();

      for (const line of lines) {
        if (!currentStream || linesInChunk >= maxLines) openChunk();
        currentStream.write(line + "\n");
        linesInChunk++;
      }
      cb();
    },

    flush(cb) {
      if (leftover) {
        if (!currentStream || linesInChunk >= maxLines) openChunk();
        currentStream.write(leftover + "\n");
      }
      cb();
    }
  });

  await new Promise((resolve, reject) => {
    const rs = createReadStream(inputPath);

    rs.on("error", reject);
    transformer.on("error", reject);

    transformer.on("finish", () => {
      if (currentStream) currentStream.end();
      resolve();
    });

    rs.pipe(transformer);
  });
};

await split();
