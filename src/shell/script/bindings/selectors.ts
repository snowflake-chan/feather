import { ScriptEntityWrapper } from './entity-synchronizer';

function testComponent(wrapper: ScriptEntityWrapper, component: string) {
  switch (component) {
    case 'entity':
      return true;
    case 'player':
      return wrapper.isPlayer;
  }
  return false;
}

export class ParsedSelector {
  public matchAll: boolean = false;
  public matchPlayer: boolean = false;
  public tags: string[] = [];
  public names: string[] = [];
  public component: string[] = [];

  constructor(public selector: string) {
    const parts = selector.split(',');
    for (let i = 0; i < parts.length; ++i) {
      const p = parts[i].trim();
      if (p.length === 0) {
        continue;
      }
      switch (p.charAt(0)) {
        case '*':
          this.matchAll = true;
          break;
        case '#':
          this.names.push(p.substr(1));
          break;
        case '.':
          this.tags.push(p.substr(1));
          break;
        default:
          if (p === 'entity') {
            this.matchAll = true;
          }
          this.component.push(p);
          break;
      }
    }
    if (this.matchAll) {
      this.component.length = this.names.length = this.tags.length = 0;
    }
    this.component.sort();
    this.names.sort();
    this.tags.sort();

    // check if selector matches players
    this.matchPlayer = this.matchAll || this.component.indexOf('player') >= 0;
  }

  public testEntity(wrapper: ScriptEntityWrapper) {
    if (wrapper.destroyed) {
      return false;
    }
    if (this.matchAll) {
      return true;
    }
    for (let i = 0; i < this.tags.length; ++i) {
      if (wrapper.hasTag(this.tags[i])) {
        return true;
      }
    }
    for (let i = 0; i < this.names.length; ++i) {
      if (wrapper.entity.id === this.names[i]) {
        return true;
      }
    }
    for (let i = 0; i < this.component.length; ++i) {
      if (testComponent(wrapper, this.component[i])) {
        return true;
      }
    }
    return false;
  }

  public toNormalizedSelector() {
    if (this.matchAll) {
      return '*';
    }
    const result: string[] = [];
    for (let i = 0; i < this.tags.length; ++i) {
      result.push('.' + this.tags[i]);
    }
    for (let i = 0; i < this.names.length; ++i) {
      result.push('#' + this.names[i]);
    }
    for (let i = 0; i < this.component.length; ++i) {
      result.push(this.component[i]);
    }
    return result.join();
  }
}
