const store = storage.getGroupStorage('validation');

(async () => {
  if (!store) throw new Error('[storage-validation] no group storage');
  await store.set('hello', { n: 1 });
  const value = await store.get('hello');
  const inc = await store.increment('counter', 2);
  setTimeout(() => {
    throw new Error(
      `[storage-validation] value=${JSON.stringify(value)} inc=${inc}`,
    );
  }, 0);
})().catch((error) => {
  setTimeout(() => {
    throw error;
  }, 0);
});
