import { spawn } from 'child_process';

const execCommand = () => {
  const commandString = process.argv[2];
  if (!commandString) {
    console.error('Provide a command, e.g. node execCommand.js "ls -la"');
    process.exit(1);
  }

  const [command, ...args] = commandString.split(' ');

  const child = spawn(command, args, {
    env: process.env,
    stdio: ['inherit', 'pipe', 'pipe'],
  });

  child.stdout?.pipe(process.stdout);
  child.stderr?.pipe(process.stderr);

  child.on('close', (code) => process.exit(code ?? 0));

  child.on('error', (err) => {
    console.error('Failed to start command:', err.message);
    process.exit(1);
  });
};

execCommand();
