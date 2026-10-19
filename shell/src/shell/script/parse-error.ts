import {
  MuUTF8,
  MuUint32,
  MuStruct,
  MuArray,
  MuBoolean,
} from '@box/mudb/schema';

const CHROME_IE_STACK_REGEXP = /^\s*at .*(\S+\:\d+|\(native\))/m;

/**
 * 错误信息中，初始化脚本用的文件名
 */
export const BOILERPLATE_FILENAME = '<boilerplate>';

export const StackFrameSchema = new MuStruct({
  function: new MuUTF8(),
  file: new MuUTF8(),
  line: new MuUint32(),
  column: new MuUint32(),
  source: new MuUTF8(),
  isolate: new MuBoolean(false),
});

export const ParsedErrorSchema = new MuStruct({
  name: new MuUTF8('Error'),
  message: new MuUTF8(),
  stack: new MuArray(StackFrameSchema, Infinity),
});
export type ParsedError = typeof ParsedErrorSchema.identity;

export function formatError(error: ParsedError) {
  return `${error.name}:${error.message}\n${error.stack
    .map(
      (frame) =>
        `\tat ${frame.function} (${frame.file}:${frame.line}:${frame.column})`,
    )
    .join('\n')}`;
}

export function parseError(error: Error | string, boundaryPattern?: string) {
  const _err = error instanceof Error ? error : new Error(error);
  if (_err.stack) {
    return parseV8(_err, boundaryPattern);
  } else {
    const result = ParsedErrorSchema.clone(ParsedErrorSchema.identity);
    result.name = 'Unknown';
    result.message = '' + _err;
    return result;
  }
}

// Separate line and column numbers from a string of the form: (URI:Line:Column)
function extractLocation(urlLike: string) {
  // Fail-fast but return locations like "(native)"
  if (urlLike.indexOf(':') === -1) {
    return [urlLike];
  }

  const regExp = /(.+?)(?:\:(\d+))?(?:\:(\d+))?$/;
  const parts = regExp.exec(urlLike.replace(/[\(\)]/g, ''));
  if (parts) {
    return [parts[1], parts[2] || '', parts[3] || ''];
  } else {
    return ['', '', ''];
  }
}

/**
 * 处理了 eval 的情况
 * @param line
 * @returns
 */
function sanitizeEvalV8(line: string) {
  if (line.indexOf('(eval ') < 0) {
    return line;
  }
  // Throw away eval information until we implement stacktrace.js/stackframe#8
  return line
    .replace(/eval code/g, 'eval')
    .replace(/(\(eval at [^\()]*)|(\)\,.*$)/g, '');
}

/**
 * 处理 Function.apply 带来的额外行数
 * https://github.com/nodejs/node/issues/43047#issuecomment-1564068099
 * @param n
 * @returns
 */
function correctLineNum(n: number) {
  return n - 2;
}

function parseV8(error: Error, boundaryPattern?: string) {
  const result = ParsedErrorSchema.alloc();
  result.name = error.name;
  result.message = error.message;
  if (!error.stack) {
    return result;
  }

  const lines = error.stack.split('\n');
  for (let i = 0; i < lines.length; ++i) {
    const line = lines[i];

    if (boundaryPattern && line.includes(boundaryPattern)) {
      break;
    } else if (
      !line.match(CHROME_IE_STACK_REGEXP) ||
      line.includes(BOILERPLATE_FILENAME)
    ) {
      continue;
    }

    let sanitizedLine = sanitizeEvalV8(line)
      .replace(/^\s+/, '')
      .replace(/\(eval code/g, '(');

    // capture and preseve the parenthesized location "(/foo/my bar.js:12:87)" in
    // case it has spaces in it, as the string is split on \s+ later on
    const location = sanitizedLine.match(/ (\((.+):(\d+):(\d+)\)$)/);

    // remove the parenthesized location from the line, if it was matched
    if (location) {
      sanitizedLine = sanitizedLine.replace(location[0], '');
    }

    const tokens = sanitizedLine.split(/\s+/).slice(1);
    // if a location was matched, pass it to extractLocation() otherwise pop the last token
    const locationParts = extractLocation(
      location ? location[1] : tokens.pop() || '',
    );
    const functionName = tokens.join(' ') || undefined;
    const fileName =
      ['eval', '<anonymous>'].indexOf(locationParts[0] || '') > -1
        ? undefined
        : locationParts[0];

    const frame = StackFrameSchema.clone(StackFrameSchema.identity);
    frame.function = functionName || '';
    frame.file = fileName || '';
    frame.line = correctLineNum(parseInt(locationParts[1]) | 0);
    frame.column = parseInt(locationParts[2]) | 0;
    frame.source = line;
    result.stack.push(frame);
  }

  return result;
}
