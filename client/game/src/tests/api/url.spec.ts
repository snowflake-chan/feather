import { expect, test } from '@jest/globals';
import { URLSearchParams, URL } from '@box/schema/api/js/url';

test('url basics', function () {
  const ftpUrl = new URL('ftp://abc:123@files.example.test:21/');
  // test get username password
  expect(ftpUrl.protocol).toBe('ftp:');
  expect(ftpUrl.port).toBe('21');
  expect(ftpUrl.username).toBe('abc');
  expect(ftpUrl.password).toBe('123');

  const url = new URL(
    'https://engine.example.test:8080/p/happy-farm?a=1&b=2&c=3#anchor0',
  );
  expect(url.hash).toBe('#anchor0'); // Return U+0023 (#), followed by this’s URL’s fragment.
  expect(url.host).toBe('engine.example.test:8080');
  expect(url.hostname).toBe('engine.example.test');
  expect(url.href).toBe(
    'https://engine.example.test:8080/p/happy-farm?a=1&b=2&c=3#anchor0',
  );
  expect(url.origin).toBe('https://engine.example.test:8080');
  expect(url.pathname).toBe('/p/happy-farm');
  expect(url.port).toBe('8080');
  expect(url.protocol).toBe('https:');
  expect(url.search).toBe('?a=1&b=2&c=3'); // Return U+003F (?), followed by this’s URL’s query.
  for (const [key, value] of url.searchParams) {
    console.log(key + ': ' + value);
  }

  // can append searchParams
  url.searchParams.append('d', '4');
  expect(url.toString()).toBe(
    'https://engine.example.test:8080/p/happy-farm?a=1&b=2&c=3&d=4#anchor0',
  );
  // can delete searchParams
  url.searchParams.delete('c');
  expect(url.toString()).toBe(
    'https://engine.example.test:8080/p/happy-farm?a=1&b=2&d=4#anchor0',
  );
});

test('url.href does not finish with ? if url.search is empty', function () {
  expect.assertions(1);
  const url = new URL('https://www.example.com/');
  expect(url.href).toBe('https://www.example.com/');
});

test('url base construct and setter', function () {
  const urlBase = new URL(
    'p/spaceworld',
    'https://engine.example.test/p/happy-farm',
  );
  expect(urlBase.href).toBe('https://engine.example.test/p/spaceworld');

  urlBase.pathname = '/p/newgame';
  expect(urlBase.href).toBe('https://engine.example.test/p/newgame');
  expect(urlBase.pathname).toBe('/p/newgame');
  urlBase.pathname = '';

  urlBase.hash = 'anchor1';
  expect(urlBase.href).toBe('https://engine.example.test/#anchor1');
  expect(urlBase.hash).toBe('#anchor1');
  urlBase.hash = '';

  urlBase.searchParams.append('b', '2');
  expect(urlBase.search).toBe('?b=2');

  urlBase.search = 'c=3';
  expect(urlBase.searchParams.toString()).toBe('c=3');
  urlBase.search = '';

  urlBase.username = 'abc';
  expect(urlBase.href).toBe('https://abc@engine.example.test/');
  urlBase.password = '123';
  expect(urlBase.href).toBe('https://abc:123@engine.example.test/');
  urlBase.username = urlBase.password = '';

  urlBase.host = 'www.host1.com:8080';
  expect(urlBase.href).toBe('https://www.host1.com:8080/');
  expect(urlBase.host).toBe('www.host1.com:8080');
  urlBase.host = '';

  urlBase.hostname = 'engine.example.test';
  expect(urlBase.href).toBe('https://engine.example.test/');

  urlBase.port = '80';
  expect(urlBase.href).toBe('https://engine.example.test:80/');
  expect(urlBase.port).toBe('80');
  urlBase.port = '';
  expect(urlBase.href).toBe('https://engine.example.test/');
});

test('usp can handle special char escaping', function () {
  const usp = new URLSearchParams('');
  const badString = '\x20\x21\x27\x28\x29\x7E';
  usp.append('a', badString);
  expect(usp.get('a')).toBe(badString);
  expect(usp.toString()).toBe('a=+%21%27%28%29%7E');
  usp.append(badString, badString);
  expect(usp.get(badString)).toBe(badString);
  usp.delete('a');
  expect(usp.toString()).toBe('+%21%27%28%29%7E=+%21%27%28%29%7E');
});

test('usp basics', function () {
  const url = new URL('https://engine.example.test/?a=1&b=2&c=3');
  const searchParams = url.search;

  expect(searchParams).toBe('?a=1&b=2&c=3');
  const params = new URLSearchParams(searchParams);
  expect(params.toString()).toBe('a=1&b=2&c=3');
  const uspTest = new URLSearchParams('?a=1&b=2');
  expect(uspTest.toString()).toBe('a=1&b=2');

  // constructing via Array
  let uspContruct = new URLSearchParams([
    ['a', '1'],
    ['b', '2'],
    ['c', '3'],
  ]);
  expect(uspContruct.toString()).toBe('a=1&b=2&c=3');

  // constructing via Object
  uspContruct = new URLSearchParams({
    a: '1',
    b: '2',
    c: '3',
  });
  expect(uspContruct.toString()).toBe('a=1&b=2&c=3');

  expect(params.has('a') && params.has('b') && params.has('c')).toBeTruthy();
  expect(params.get('a')).toBe('1');
  expect(params.get('b')).toBe('2');
  expect(params.get('c')).toBe('3');
  params.append('a', '4');
  expect(params.getAll('a').join(',')).toBe('1,4');
  expect(params.getAll('b').join(',')).toBe('2');
  expect(params.get('a')).toBe('1');
  params.set('a', '5');
  expect(params.getAll('a').join(',')).toBe('5');

  params.delete('a');
  expect(params.has('a')).toBe(false);
  expect(params.get('a')).toBe(null);
  expect(params.toString()).toBe('b=2&c=3');
});

test('usp construct with key without value', function () {
  expect.assertions(4);
  const a = new URLSearchParams('a&b&c');
  expect(a.get('a')).toBe('');
  expect(a.get('b')).toBe('');
  expect(a.get('c')).toBe('');
  expect(a.toString()).toBe('a=&b=&c=');
});

test('usp value with spaces', function () {
  expect.assertions(2);
  const url = new URL('https://www.example.com/');
  url.searchParams.set('a', 'one two three');
  expect(url.toString()).toBe('https://www.example.com/?a=one+two+three');
  const searchParams = url.searchParams.get('a');
  expect(searchParams).toBe('one two three');
});

test('usp sort', function () {
  let params = new URLSearchParams('?b=2&a=1&c=3');
  params.sort();
  expect(params.toString()).toBe('a=1&b=2&c=3');
  params = new URLSearchParams('?b=2&a=3&a=1');
  params.sort();
  expect(params.toString()).toBe('a=1&a=3&b=2');
  // https://url.spec.whatwg.org/#example-searchparams-sort
  params = new URLSearchParams('?q=🏳️‍🌈&key=e1f7bc78');
  params.sort();
  expect(params.toString()).toBe(
    'key=e1f7bc78&q=%F0%9F%8F%B3%EF%B8%8F%E2%80%8D%F0%9F%8C%88',
  );
});

test('usp iterator', function () {
  const params = new URLSearchParams('?b=2&a=1&c=3');

  const iteratorKeys = params.keys();
  let next = iteratorKeys.next();
  expect(next.done).toBe(false);
  expect(next.value).toBe('b');
  next = iteratorKeys.next();
  expect(next.done).toBe(false);
  expect(next.value).toBe('a');
  next = iteratorKeys.next();
  expect(next.done).toBe(false);
  expect(next.value).toBe('c');
  next = iteratorKeys.next();
  expect(next.done).toBe(true);
  expect(next.value).toBe(undefined);

  const iteratorValues = params.values();
  next = iteratorValues.next();
  expect(next.done).toBe(false);
  expect(next.value).toBe('2');
  next = iteratorValues.next();
  expect(next.done).toBe(false);
  expect(next.value).toBe('1');
  next = iteratorValues.next();
  expect(next.done).toBe(false);
  expect(next.value).toBe('3');
  next = iteratorValues.next();
  expect(next.done).toBe(true);
  expect(next.value).toBe(undefined);

  const iteratorEntries = params.entries();
  let nextEntry = iteratorEntries.next();
  expect(nextEntry.done).toBe(false);
  expect(nextEntry.value[0]).toBe('b');
  expect(nextEntry.value[1]).toBe('2');
  nextEntry = iteratorEntries.next();
  expect(nextEntry.done).toBe(false);
  expect(nextEntry.value[0]).toBe('a');
  expect(nextEntry.value[1]).toBe('1');
  nextEntry = iteratorEntries.next();
  expect(nextEntry.done).toBe(false);
  expect(nextEntry.value[0]).toBe('c');
  expect(nextEntry.value[1]).toBe('3');
  nextEntry = iteratorEntries.next();
  expect(nextEntry.done).toBe(true);
  expect(nextEntry.value).toBe(undefined);

  // forEach loop
  const results: any = [];
  params.forEach(function (value, key, url) {
    results.push({ value: value, key: key, object: url });
  });
  expect(results.length).toBe(3);
  expect(results[0].value).toBe('2');
  expect(results[0].key).toBe('b');
  expect(results[0].object).toBe(params);
  expect(results[1].value).toBe('1');
  expect(results[1].key).toBe('a');
  expect(results[1].object).toBe(params);
  expect(results[2].value).toBe('3');
  expect(results[2].key).toBe('c');
  expect(results[2].object).toBe(params);
});
