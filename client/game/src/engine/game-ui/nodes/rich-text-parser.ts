import type { vec3 } from 'gl-matrix';
import { hexToRGB } from 'src/utils/color';
import { TextStream } from '../../utils/text-stream';

export type RichTextNode = {
  /**
   * 节点名字
   * 如果是特殊节点，会用特殊命名。比如文本节点，会用“#text”。
   */
  nodeName: string;
  /**
   * 节点属性
   */
  attributes: RichTextNodeAttributes;
  /**
   * 子节点
   */
  children: RichTextNode[];
  /**
   * 文本内容，仅文本节点会有
   */
  textContent?: string;
};

/**
 * 富文本属性，key必定是字符串，value如果有对应的parser则不是
 */
export type RichTextNodeAttributes = Record<string, any>;

/**
 * 纯文本节点的名字
 * 用户无法输入特殊字符“#”作为节点名字，因此可以对内部定义的特殊节点做特殊命名
 */
export const TEXT_NODE_NAME = '#text';

interface SpecialAttributeParser {
  (key: string, value: string):
    | any
    | {
        value: any;
        key: string;
      };
}

const parseNumber: SpecialAttributeParser = (key, value) => {
  const num = Number(value);

  if (Number.isNaN(num)) {
    throw new Error(`Failed to parse number ${value} of key ${key}`);
  }

  return num;
};

const parseHexToRGB: SpecialAttributeParser = (key, value) => {
  if (!value.startsWith('#')) {
    throw new Error(`Failed to parse hex ${value} of key ${key}`);
  }

  const rgb = hexToRGB(value);

  if (!rgb) {
    throw new Error(`Failed to parse hex ${value} of key ${key}`);
  }

  return rgb;
};

export type FontStyle = {
  color: vec3;
  size: number;
};

export type StrokeStyle = {
  color: vec3;
  thickness: number;
  opacity: number;
};

export class RichTextParser {
  private textStream = new TextStream();

  public attributeParsers: {
    [attr: string]: SpecialAttributeParser;
  } = {
    color: parseHexToRGB,
    size: parseNumber,
    opacity: parseNumber,
    thickness: parseNumber,
  };

  public parse(out: RichTextNode[], input: string) {
    this.textStream.load(input);

    while (!this.textStream.isEOF()) {
      this.parseNode(out);
    }

    return out;
  }

  /**
   * 解析节点
   * @param out 存储节点的数组
   * @param isSearchingCloseTag 是否在查找闭合标签
   */
  private parseNode(out: RichTextNode[]) {
    this.parseTextNode(out);

    if (this.textStream.isEOF()) {
      return;
    }

    this.parseTagNode(out);
  }

  /**
   * 解析文本节点
   */
  private parseTextNode(out: RichTextNode[]) {
    const begin = this.textStream.pos;

    this.textStream.skipWhitespace();

    while (!this.textStream.isEOF()) {
      const char = this.textStream.getChar();

      if (char === '<') {
        break;
      }

      this.textStream.forward();
    }

    const plainText = this.textStream.backCut(begin);

    if (!plainText) {
      return;
    }

    // 转义字符
    const textContent = escapeText(plainText);

    const textNode: RichTextNode = {
      nodeName: TEXT_NODE_NAME,
      children: [],
      attributes: {},
      textContent,
    };

    out.push(textNode);
  }

  /**
   * 解析标签节点
   */
  private parseTagNode(out: RichTextNode[]) {
    this.textStream.assertChar('<');

    this.textStream.forward();

    const tagName = this.textStream.readKey();

    this.textStream.assertChar();

    const attributes = this.parseAttributes();

    const children: RichTextNode[] = [];

    // 自闭合标签
    if (this.textStream.getChar() === '/') {
      this.textStream.forward();

      this.textStream.eatChar('>');
      return;
    }

    // 开标签结束
    this.textStream.eatChar('>');

    // 查找成对的闭合标签，但开标签与闭合标签之间可以有其他节点
    while (true) {
      // 标签之间可以包含文本节点
      this.parseTextNode(children);

      // 如果查到这个说明匹配到闭合标签
      if (
        this.textStream.getChar() === '<' &&
        this.textStream.getChar(1) === '/'
      ) {
        this.textStream.forward(2);
        this.textStream.eatString(tagName);
        this.textStream.eatChar('>');
        break;
      }

      // 否则可能存在嵌套的标签，尝试解析节点
      this.parseTagNode(children);
    }

    out.push({
      nodeName: tagName,
      attributes,
      children,
    });
  }

  private parseAttributes() {
    const attributes: RichTextNodeAttributes = {};

    while (this.parseAttribute(attributes)) {}

    return attributes;
  }

  private parseAttribute(out: RichTextNodeAttributes) {
    const key = this.textStream.readKey();

    if (!key) {
      return false;
    }

    this.textStream.skipWhitespace();
    this.textStream.eatChar('=');

    const value = this.textStream.readValue();

    this.assignAttribute(out, key, value);

    return true;
  }

  private assignAttribute(out: RichTextNodeAttributes, key: string, v: string) {
    if (key in this.attributeParsers) {
      const val = this.attributeParsers[key](key, v);

      out[key] = val;
    } else {
      out[key] = v;
    }
  }
}

interface TextNode extends RichTextNode {
  nodeName: typeof TEXT_NODE_NAME;
  textContent: string;
}

export function isTextNode(node: RichTextNode): node is TextNode {
  return node.nodeName === TEXT_NODE_NAME;
}

/**
 * 处理文本中的转义字符
 * @param input
 */
export function escapeText(input: string) {
  return input.replace(/&lt;|&gt;|&quot;|&apos;|&amp;/g, (match) => {
    return (
      {
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&apos;': `'`,
        '&amp;': '&',
      }[match] || match
    );
  });
}
