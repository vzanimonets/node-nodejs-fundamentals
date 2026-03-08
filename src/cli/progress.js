const progress = () => {
const args = process.argv.slice(2);

  const getArg = (name, defaultValue) => {
    const index = args.indexOf(name);
    if (index !== -1 && args[index + 1]) return args[index + 1];
    return defaultValue;
  };

  const duration = Number(getArg("--duration", 5000));
  const interval = Number(getArg("--interval", 100));
  const length = Number(getArg("--length", 30));
  const colorHex = getArg("--color", null);

  const steps = Math.ceil(duration / interval);

  const hexToAnsi = (hex) => {
    if (!/^#[0-9a-fA-F]{6}$/.test(hex)) return null;

    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    return `\x1b[38;2;${r};${g};${b}m`;
  };

  const colorCode = colorHex ? hexToAnsi(colorHex) : null;

  let step = 0;

  const timer = setInterval(() => {
    step++;

    const percent = Math.min(Math.round((step / steps) * 100), 100);
    const filledLength = Math.round((percent / 100) * length);
    const emptyLength = length - filledLength;

    let filled = "█".repeat(filledLength);

    if (colorCode) {
      filled = `${colorCode}${filled}\x1b[0m`;
    }

    const bar = `[${filled}${" ".repeat(emptyLength)}] ${percent}%`;

    process.stdout.write("\r" + bar);

    if (percent >= 100) {
      clearInterval(timer);
      process.stdout.write("\nDone!\n");
    }
  }, interval);
};

progress();
