import { GUIElement } from '../element';
import { GUIEvent } from '../event';
import { GUICheckBox } from './checkbox';

export class GUICheckBoxGroup extends GUIElement {
  public children: GUICheckBox[] = [];
  public selected: GUICheckBox | null = null;
  public init() {
    this.addEventListener('click', (ev) => {
      for (const c of this.children) {
        if (!ev.path.includes(c)) {
          c.checked = false;
        } else {
          if (c !== this.selected) {
            const event = new GUIEvent('change', { bubbles: true });
            (event as any).selected = c;
            (event as any).previousSelected = this.selected;
            this.dispatchEvent(event);
          }
          this.selected = c;
        }
      }
    });
  }
}
