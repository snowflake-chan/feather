import { TextStream } from '../utils/text-stream';
import { GUIElement } from './element';

export interface ElementSelector {
  name: string;
  attributes: { [name: string]: string | null };
  child?: GUISelector;
}

export class GUISelector {
  public selectors: ElementSelector[] = [];
  constructor(selectors: string | TextStream) {
    this.parseSelectors(
      typeof selectors === 'string' ? new TextStream(selectors) : selectors,
    );
  }

  private parseSelectors(s: TextStream) {
    while (true) {
      let name = '*';
      const attributes: { [name: string]: string | null } = {};
      let child: any;
      s.skipWhitespace();
      if (s.getChar() === '*') {
        s.forward();
      } else if (s.getChar() === '#') {
        s.forward();
        attributes.id = s.readKey();
      } else if (!s.isEOF() && s.getChar() !== '[') {
        name = s.readKey();
      }
      while (s.getChar() === '[') {
        s.forward();
        s.skipWhitespace();
        const key = s.readKey();
        let value: string | null = null;
        s.skipWhitespace();
        if (s.getChar() === '=') {
          s.forward();
          s.skipWhitespace();
          if (s.getChar() === '"' || s.getChar() === "'") {
            value = s.readValue();
          } else {
            value = s.readKey();
          }
          s.skipWhitespace();
        }
        attributes[key] = value;
        s.eatChar(']');
      }
      if (s.getChar() === '>') {
        s.forward();
        child = new GUISelector(s);
      }
      this.selectors.push({ name, attributes, child });
      if (s.isEOF()) {
        break;
      } else if (s.getChar() === ',') {
        s.forward();
      } else {
        throw new Error(
          `expected ',' or <EOF> but got '${s.getChar()}' at ${s.getPosition()}`,
        );
      }
    }
  }

  public match(out: GUIElement[], el: GUIElement, matchAll = false) {
    for (const s of this.selectors) {
      if (s.name !== '*' && s.name !== el.name) {
        break;
      }
      let flag = true;
      for (const key in s.attributes) {
        const value = s.attributes[key];
        if (
          !(key in el.attributes) ||
          (value !== null && value !== el.attributes[key])
        ) {
          flag = false;
          break;
        }
      }
      if (!flag) {
        continue;
      }
      if (s.child) {
        for (const child of el.children) {
          s.child.match(out, child, matchAll);
          if (!matchAll && out.length > 0) {
            return;
          }
        }
      } else {
        out.push(el);
        if (!matchAll) {
          return;
        }
      }
    }
  }
}
