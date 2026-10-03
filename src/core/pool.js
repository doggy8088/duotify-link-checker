export async function runPool(items, worker, concurrency = 8) {
  if (!Number.isInteger(concurrency) || concurrency < 1)
    throw new Error("Invalid concurrency");
  let cursor = 0;
  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, async () => {
      while (cursor < items.length) {
        const index = cursor++;
        await worker(items[index], index);
      }
    }),
  );
}

export const yieldToPage = () =>
  new Promise((resolve) => setTimeout(resolve, 0));
