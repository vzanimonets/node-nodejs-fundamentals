import os from 'os';
import { promises as fs } from 'fs';
import { Worker } from 'worker_threads';

const runWorker = (chunk) => {
  const workerUrl = new URL('./worker.js', import.meta.url);

  return new Promise((resolve, reject) => {
    const worker = new Worker(workerUrl);

    worker.once('message', (sortedChunk) => {
      resolve(sortedChunk);
    });

    worker.once('error', (error) => {
      reject(error);
    });

    worker.postMessage(chunk);
  });
};

const kWayMerge = (arrays) => {
  const heap = [];

  const push = (node) => {
    heap.push(node);
    let index = heap.length - 1;

    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);

      if (heap[parentIndex].value <= heap[index].value) {
        break;
      }

      [heap[parentIndex], heap[index]] = [heap[index], heap[parentIndex]];
      index = parentIndex;
    }
  };

  const pop = () => {
    if (heap.length === 0) {
      return null;
    }

    const smallest = heap[0];
    const last = heap.pop();

    if (heap.length > 0 && last) {
      heap[0] = last;
      let index = 0;
      const length = heap.length;

      // Heapify down
      while (true) {
        const left = index * 2 + 1;
        const right = index * 2 + 2;
        let smallestIndex = index;

        if (left < length && heap[left].value < heap[smallestIndex].value) {
          smallestIndex = left;
        }

        if (right < length && heap[right].value < heap[smallestIndex].value) {
          smallestIndex = right;
        }

        if (smallestIndex === index) {
          break;
        }

        [heap[index], heap[smallestIndex]] = [heap[smallestIndex], heap[index]];
        index = smallestIndex;
      }
    }

    return smallest;
  };

  for (let arrayIndex = 0; arrayIndex < arrays.length; arrayIndex += 1) {
    const array = arrays[arrayIndex];

    if (array && array.length > 0) {
      push({ value: array[0], arrayIndex, elementIndex: 0 });
    }
  }

  const result = [];

  while (heap.length > 0) {
    const node = pop();

    if (!node) {
      break;
    }

    result.push(node.value);

    const { arrayIndex, elementIndex } = node;
    const nextIndex = elementIndex + 1;
    const array = arrays[arrayIndex];

    if (array && nextIndex < array.length) {
      push({ value: array[nextIndex], arrayIndex, elementIndex: nextIndex });
    }
  }

  return result;
};

const main = async () => {
  const dataUrl = new URL('./data.json', import.meta.url);
  const fileContents = await fs.readFile(dataUrl, 'utf8');
  const numbers = JSON.parse(fileContents);

  if (!Array.isArray(numbers)) {
    throw new Error('data.json must contain an array of numbers');
  }

  const cores = os.cpus().length || 1;
  const chunks = [];
  const chunkSize = Math.ceil(numbers.length / cores) || 1;

  for (let i = 0; i < cores; i += 1) {
    const start = i * chunkSize;
    const end = start + chunkSize;
    chunks.push(numbers.slice(start, end));
  }

  const sortedChunks = await Promise.all(chunks.map((chunk) => runWorker(chunk)));

  const finalSorted = kWayMerge(sortedChunks);

  console.log(finalSorted);
};

await main();
