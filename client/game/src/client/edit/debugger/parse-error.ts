import {
  ParsedErrorSchema,
  StackFrameSchema,
} from '@box/schema/debugger-console/schema';

const CHROME_IE_STACK_REGEXP = /^\s*at .*(\S+\:\d+|\(native\))/m;
const SAFARI_NATIVE_CODE_REGEXP = /^(eval@)?(\[native code\])?$/;

/**
 * 将前端脚本产生的错误对象转换为可被 DebuggerConsole 接收的格式
 * @param error
 * @param options
 * @returns
 */
export function parseClientScriptError(error: Error) {
  if (error.stack) {
    if (error.stack.match(CHROME_IE_STACK_REGEXP)) {
      return parseClientV8(error);
    } else {
      return parseFFOrSafari(error);
    }
  } else {
    const result = ParsedErrorSchema.clone(ParsedErrorSchema.identity);
    result.name = 'Unknown';
    result.message = '' + error;
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

function parseClientV8(error: Error) {
  const result = ParsedErrorSchema.alloc();
  result.name = error.name;
  result.message = error.message;
  if (!error.stack) {
    return result;
  }

  const lines = error.stack.split('\n');
  for (let i = 0; i < lines.length; ++i) {
    const line = lines[i];

    // The legacy editor emitted clientIndex.js, while Creator Vite projects
    // emit names such as main.client.js.  Filtering for the old filename here
    // discarded every useful frame before the CLI had a chance to map it via
    // the generated source map.
    if (!line.match(CHROME_IE_STACK_REGEXP)) {
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
    frame.line = parseInt(locationParts[1]) | 0;
    frame.column = parseInt(locationParts[2]) | 0;
    frame.source = line;
    result.stack.push(frame);
  }

  return result;
}

function parseFFOrSafari(error: Error) {
  const result = ParsedErrorSchema.alloc();
  result.name = error.name;
  result.message = error.message;
  if (!error.stack) {
    return result;
  }

  const lines = error.stack.split('\n');
  for (let i = 0; i < lines.length; ++i) {
    if (lines[i].match(SAFARI_NATIVE_CODE_REGEXP)) {
      continue;
    }
    const line = sanitizeEvalV8(lines[i]);

    const frame = StackFrameSchema.clone(StackFrameSchema.identity);
    if (line.indexOf('@') === -1 && line.indexOf(':') === -1) {
      frame.function = frame.source = line;
    } else {
      const functionNameRegex = /((.*".+"[^@]*)?[^@]*)(?:@)/;
      const matches = line.match(functionNameRegex);
      const functionName = matches && matches[1] ? matches[1] : undefined;
      const locationParts = extractLocation(
        line.replace(functionNameRegex, ''),
      );

      frame.function = functionName || '';
      frame.file = locationParts[0];
      const lineNum = parseInt(locationParts[1]) | 0;
      frame.line = lineNum;
      frame.column = parseInt(locationParts[2]) | 0;
      frame.source = line;
    }
    result.stack.push(frame);
  }
  return result;
}
