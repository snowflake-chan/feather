import { GUIElement, GUIData } from '../element';
import { GUISelector } from '../selector';
import { GUIButton } from './button';
import { GUICheckBox } from './checkbox';
import { GUICheckBoxGroup } from './checkbox-group';
import { GUIGroup } from './group';
import { GUIImage } from './image';
import { GUIImageButton } from './image-button';
import { GUILabel } from './label';

export const components = {
  group: GUIGroup,
  button: GUIButton,
  checkbox: GUICheckBox,
  checkboxgroup: GUICheckBoxGroup,
  image: GUIImage,
  label: GUILabel,
  imagebutton: GUIImageButton,
};

export class GUIStage extends GUIElement {
  public ui: {
    [name in keyof typeof components]: (
      attributes: Partial<InstanceType<typeof components[name]>>,
      children?: GUIData[],
    ) => GUIData;
  };
  public clicked = false;
  constructor(name: string, width: number, height: number) {
    super(name);
    this.width = width;
    this.height = height;
    this.ui = new Proxy({} as any, {
      get(target, prop, reciver) {
        return function (attributes: any, children?: any[]) {
          return { name: prop, attributes, children };
        };
      },
    });
  }

  public createElement(tagName: string) {
    const constructor = components[tagName] || GUIElement;
    return new constructor(tagName, this, this);
  }

  public load(data: GUIData) {
    const el = this.createElement(data.name);
    Object.assign(el.attributes, data.attributes);
    if (data.children) {
      for (const c of data.children) {
        el.append(this.load(c));
      }
    }
    return el;
  }

  public draw(ctx: CanvasRenderingContext2D) {
    super.draw(ctx, 0, 0);
  }

  private dfsQuery(selectors: string, all: boolean) {
    const result: GUIElement[] = [];
    const selector = new GUISelector(selectors);
    const stack: GUIElement[] = [this];
    while (stack.length > 0) {
      const node = stack.pop()!;
      selector.match(result, node, all);
      if (!all && result.length > 0) {
        break;
      }
      for (const child of node.children) {
        stack.push(child);
      }
    }
    return result;
  }

  public querySelector(selectors: string) {
    return this.dfsQuery(selectors, false)[0] || null;
  }

  public querySelectorAll(selectors: string) {
    return this.dfsQuery(selectors, true);
  }
}
