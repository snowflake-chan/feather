let ticks = 0;
let skips = 0;
let first = 0;
let last = 0;

world.onTick((event) => {
  if (ticks === 0) first = Date.now();
  last = Date.now();
  ticks++;
  if (event.skip) skips++;
});

setTimeout(() => {
  const elapsed = Math.max(1, last - first);
  const rate = (ticks / elapsed) * 1000;
  throw new Error(
    `[bench] ticks=${ticks} skips=${skips} elapsed=${elapsed}ms rate=${rate.toFixed(1)}Hz`,
  );
}, 5000);
