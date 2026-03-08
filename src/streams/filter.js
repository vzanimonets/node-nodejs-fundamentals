import { Transform } from "node:stream";

const patternIndex = process.argv.indexOf("--pattern");
if (patternIndex === -1 || !process.argv[patternIndex + 1]) {
  console.error("Usage: node filter.js --pattern <string>");
  process.exit(1);
}
const pattern = process.argv[patternIndex + 1];
const filter = () => {
  let leftover = "";

  const filterTransform = new Transform({
    transform(chunk, _, callback) {
      const data = leftover + chunk.toString();
      const lines = data.split(/\r?\n/);
      leftover = lines.pop();

      for (const line of lines) {
        if (line.includes(pattern)) {
          this.push(line + "\n");
        }
      }
      callback();
    },
    flush(callback) {
      if (leftover && leftover.includes(pattern)) {
        this.push(leftover + "\n");
      }
      callback();
    }
  });

  process.stdin.pipe(filterTransform).pipe(process.stdout);
};

filter();
