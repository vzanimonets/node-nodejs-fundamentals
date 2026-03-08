import { Transform } from "node:stream";

const lineNumberer = () => {
  let lineCount = 0;
  let leftover = "";

  const lineNumberTransform = new Transform({
    transform(chunk, _, callback) {
      const data = leftover + chunk.toString();
      const lines = data.split(/\r?\n/);
      leftover = lines.pop();

      for (const line of lines) {
        lineCount++;
        this.push(`${lineCount} | ${line}\n`);
      }
      callback();
    },
    flush(callback) {
      if (leftover) {
        lineCount++;
        this.push(`${lineCount} | ${leftover}\n`);
      }
      callback();
    }
  });

  process.stdin.pipe(lineNumberTransform).pipe(process.stdout);
};

lineNumberer();
