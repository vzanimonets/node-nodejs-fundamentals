import { parentPort } from 'worker_threads';

parentPort.on('message', (data) => {
  const numbers = Array.isArray(data) ? data : [];
  const sorted = [...numbers].sort((a, b) => a - b);
  parentPort.postMessage(sorted);
});
