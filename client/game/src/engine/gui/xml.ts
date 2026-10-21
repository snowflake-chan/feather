import { TextStream } from '../utils/text-stream';

export interface SpecialAttributeParser {
  (key: string, value: string):
    | any
    | {
        value: any;
        key: string;
      };
}

export class XMLParser {
  private s = new TextStream();
  public specialAttributeParsers: {
    [attr: string]: SpecialAttributeParser;
  } = {};

  public addSpecialAttributeParser(
    parsers: {
      names: string[];
      parser: SpecialAttributeParser;
    }[],
  ) {
    for (const { parser, names } of parsers) {
      for (const name of names) {
        this.specialAttributeParsers[name] = parser;
      }
    }
  }

  private assignAttribute(obj: any, originKey: string, v: string) {
    const [k, t] = originKey.split(':');
    if (t === 'number') {
      obj[k] = Number(v);
    } else if (t === 'string') {
      obj[k] = v;
    } else if (k in this.specialAttributeParsers) {
      const val = this.specialAttributeParsers[k](v, k);
      if (typeof val === 'object') {
        obj[val.key] = val.value;
      } else {
        obj[k] = val;
      }
    } else {
      obj[k] = v;
    }
  }
  private parseAttribute(obj: any) {
    const key = this.s.readKey();
    if (!key) {
      return false;
    }
    this.s.skipWhitespace();
    this.s.eatChar('=');
    const value = this.s.readValue();
    this.assignAttribute(obj, key, value);
    return true;
  }

  private parseAttributes() {
    const attributes = {};
    while (this.parseAttribute(attributes)) {}
    return attributes;
  }

  public parse(xml: string) {
    this.s.load(xml);
    const item = this.parseItem();
    this.s.skipWhitespace();
    if (!this.s.isEOF()) {
      throw new Error(
        `expected <EOF> but got '${this.s.getChar()}' at ${this.s.getPosition()}`,
      );
    }
    return item;
  }

  private parseItem() {
    this.s.skipWhitespace();
    this.s.eatChar('<');
    const name = this.s.readKey();
    this.s.assertChar();
    const attributes = this.parseAttributes();
    const children: any[] = [];
    if (this.s.getChar() === '/') {
      this.s.forward();
      this.s.eatChar('>');
    } else {
      this.s.eatChar('>');
      while (true) {
        this.s.skipWhitespace();
        this.s.assertChar('<');
        if (this.s.getChar(1) === '/') {
          this.s.forward(2);
          this.s.eatString(name);
          this.s.eatChar('>');
          break;
        }
        children.push(this.parseItem());
      }
    }
    return { name, attributes, children };
  }
}
