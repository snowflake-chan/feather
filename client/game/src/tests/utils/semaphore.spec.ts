import { expect, test } from '@jest/globals';
import { Semaphore } from '@box/utils/semaphore';

async function sleep(ticks: number) {
  for (let i = 0; i < ticks; ++i) {
    await Promise.resolve();
  }
}

const sleepRand = () => sleep(Math.random() * 100);

test('semaphore - mutex behavior', async () => {
  const semaphore = new Semaphore();
  let counter = 0;
  let mutex = false;

  async function thread() {
    for (let i = 0; i < 10; ++i) {
      await sleepRand();
      await semaphore.p();
      expect(mutex).toBeFalsy();
      mutex = true;
      counter += 1;
      await sleepRand();
      mutex = false;
      semaphore.v();
    }
  }

  const threads: Promise<void>[] = [];
  for (let i = 0; i < 500; ++i) {
    threads.push(thread());
  }
  await Promise.all(threads);

  expect(counter).toBe(5000);
});

test('semaphore - gate', async () => {
  const semaphore = new Semaphore(0);
  let started = 0;
  let finished = 0;

  async function thread() {
    started += 1;
    await semaphore.p(5);
    finished += 1;
  }

  const threads: Promise<void>[] = [];
  for (let i = 0; i < 500; ++i) {
    threads.push(thread());
  }

  await sleepRand();
  expect(started).toBe(500);
  expect(finished).toBe(0);

  semaphore.v(10);
  await sleep(1000);
  expect(finished).toBe(2);

  for (let i = 0; i < 5; ++i) {
    semaphore.v(5);
  }
  await sleep(1000);
  expect(finished).toBe(7);

  for (let i = 0; i < 4; ++i) {
    semaphore.v(1);
  }
  await sleep(1000);
  expect(finished).toBe(7);

  semaphore.v(1);
  await sleep(1000);
  expect(finished).toBe(8);

  for (let i = 0; i < 50; ++i) {
    semaphore.v(2);
  }
  await sleep(1000);
  expect(finished).toBe(28);
});
