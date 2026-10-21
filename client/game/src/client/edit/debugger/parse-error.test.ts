import { parseClientScriptError } from './parse-error';

describe('parseClientScriptError', () => {
  it('keeps Vite client bundle frames for CLI source-map mapping', () => {
    const error = new ReferenceError('ddd is not defined');
    error.stack = [
      'ReferenceError: ddd is not defined',
      '    at start (http://localhost:9967/scripts/main.client.js:1:47820)',
    ].join('\n');

    expect(parseClientScriptError(error)).toMatchObject({
      name: 'ReferenceError',
      message: 'ddd is not defined',
      stack: [
        expect.objectContaining({
          function: 'start',
          file: 'http://localhost:9967/scripts/main.client.js',
          line: 1,
          column: 47820,
        }),
      ],
    });
  });
});
