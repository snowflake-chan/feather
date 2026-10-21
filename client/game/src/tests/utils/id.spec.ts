import { expect, test } from '@jest/globals';
import { indexEq, indexPred } from '@box/utils/id';

class Tagged {
  public id: number;
  constructor(id) {
    this.id = id;
  }
}

test('index equals', function () {
  function checkArray(arr, values) {
    const taggedArr = arr.map((id) => new Tagged(id));
    for (let i = 0; i < values.length; ++i) {
      if (arr.indexOf(values[i]) < 0) {
        expect(indexEq(taggedArr, values[i])).toBe(-1);
      } else {
        expect(arr[indexEq(taggedArr, values[i])]).toBe(values[i]);
      }
    }
  }

  checkArray([0, 1, 1, 1, 2], [-1, 0, 1, 2, 0.5, 1.5, 5]);
  checkArray([], [0, 1, 2]);
  checkArray([0], [0, 1]);
  checkArray([1], [1]);

  function randomArray() {
    const N = Math.floor(Math.random() * 16);
    const r = new Array(N);
    for (let i = 0; i < N; ++i) {
      r[i] = (Math.random() * 20) | 0;
    }
    r.sort((a, b) => a - b);
    return r;
  }

  for (let i = 0; i < 200; ++i) {
    checkArray(randomArray(), randomArray());
  }
});

test('index pred', function () {
  function checkArray(arr, values) {
    const taggedArr = arr.map((id) => new Tagged(id));
    for (let i = 0; i < values.length; ++i) {
      let predIndex = -1;
      for (let j = arr.length - 1; j >= 0; --j) {
        if (arr[j] <= values[i]) {
          predIndex = j;
          break;
        }
      }
      expect(indexPred(taggedArr, values[i])).toBe(predIndex);
    }
  }

  checkArray([0, 1, 1, 1, 2], [-1, 0, 1, 2, 0.5, 1.5, 5]);
  checkArray([], [0, 1, 2]);
  checkArray([0], [0, 1]);
  checkArray([1], [1]);

  function randomArray() {
    const N = Math.floor(Math.random() * 16);
    const r = new Array(N);
    for (let i = 0; i < N; ++i) {
      r[i] = (Math.random() * 20) | 0;
    }
    r.sort((a, b) => a - b);
    return r;
  }

  for (let i = 0; i < 200; ++i) {
    checkArray(randomArray(), randomArray());
  }
});
