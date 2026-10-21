export class TextStream {
  public pos: number = 0;
  public length: number = 0;
  public column: number = 0;
  public line: number = 0;
  public text: string = '';

  constructor(text?: string) {
    if (typeof text === 'string') {
      this.load(text);
    }
  }

  public load(text: string) {
    this.text = text;
    this.pos = 0;
    this.length = text.length;
    this.column = 1;
    this.line = 1;
  }

  public forward(length = 1) {
    for (let i = 0; i < length; i++) {
      if (this.text[this.pos++] === '\n') {
        this.line++;
        this.column = 1;
      } else {
        this.column++;
      }
    }
  }

  public skipWhitespace() {
    for (let i = 0; !this.isEOF(); i++, this.forward()) {
      if (!/\s/.test(this.getChar())) {
        return i;
      }
    }
    return -1;
  }

  public getChar(i = 0) {
    return this.text[this.pos + i];
  }

  public isEOF() {
    return this.pos >= this.length;
  }

  public assertChar(s?: string) {
    if (this.isEOF()) {
      throw new Error(
        `expected a valid character but got <EOF> at ${this.getPosition()}`,
      );
    }
    if (s && this.getChar() !== s) {
      throw new Error(
        `expected character '${s}' but got ${this.getChar()} at ${this.getPosition()}`,
      );
    }
  }

  public eatChar(s: string) {
    this.assertChar(s);
    this.forward();
  }

  public eatString(s: string) {
    for (let i = 0; i < s.length; i++, this.forward()) {
      if (this.isEOF()) {
        throw new Error(
          `expected string '${s}' but got '${this.backCut(
            this.pos - i,
          )}<EOF>' at ${this.getPosition()}`,
        );
      }
      if (this.getChar() !== s[i]) {
        throw new Error(
          `expected string '${s}' but got '${this.text.substring(
            this.pos - i,
            this.pos + 1,
          )}' at ${this.getPosition()}`,
        );
      }
    }
  }

  public readValue() {
    this.skipWhitespace();
    const quotemark = this.getChar();
    if (quotemark !== "'" && quotemark !== '"') {
      throw new Error(
        `expected quotemark <'> or <"> but got '${quotemark}' at ${this.getPosition()}`,
      );
    }
    const begin = this.pos;
    this.forward();
    for (; !this.isEOF(); this.forward()) {
      if (this.getChar() === quotemark && this.getChar(-1) !== '\\') {
        break;
      }
      if (this.getChar() === '\n') {
        throw new Error(
          `expected a character but got <newline> at ${this.getPosition()}`,
        );
      }
    }
    this.eatChar(quotemark);
    const jsonStr = this.backCut(begin);
    try {
      return JSON.parse(jsonStr);
    } catch {
      throw new Error(`an error occurred when parse value ${jsonStr}`);
    }
  }

  public backCut(begin: number) {
    return this.text.substring(begin, this.pos);
  }

  public cut(length: number) {
    return this.text.substring(this.pos, this.pos + length);
  }

  public readKey() {
    this.skipWhitespace();

    const begin = this.pos;

    // /[\w-]/ 匹配单个字母、数字、下划线或短横线
    while (!this.isEOF() && /[\w-]/.test(this.getChar())) {
      this.forward();
    }

    return this.backCut(begin);
  }

  public getPosition() {
    return `[${this.line}:${this.column}]`;
  }
}
