import { GameUIText } from 'src/engine/game-ui/nodes/text';
import type { UpdateUITree } from './defs';
import type { SelectBox } from './select-box';
import type { ClientProjectTransaction } from 'src/client/edit/replica/transaction/client-project-transaction';
import { GameUIInput } from 'src/engine/game-ui/nodes/input';
import {
  InputManager,
  Spec as InputManagerSpec,
} from 'src/engine/game-ui/controls/input-manager';
import { GameUIRenderable } from 'src/engine/game-ui/nodes/renderable';

type Spec = InputManagerSpec & {
  projectTransaction: ClientProjectTransaction;
  selectBox: SelectBox;
  updateUITree: UpdateUITree;
};

export class TextInputManager extends InputManager {
  private projectTransaction: ClientProjectTransaction;
  private selectBox: SelectBox;
  private updateUITree: UpdateUITree;

  private contentBackup?: string = '';

  constructor(spec: Spec) {
    const {
      inputController,
      projectTransaction,
      selectBox,
      getTextareaContainer,
      updateUITree,
    } = spec;

    super({
      getTextareaContainer,
      inputController,
    });

    this.projectTransaction = projectTransaction;
    this.selectBox = selectBox;
    this.updateUITree = updateUITree;
  }

  public attach(node: GameUIRenderable) {
    const nodeId = node.id;

    if (!(node instanceof GameUIText) || nodeId === this.attached?.id) {
      return;
    }

    this.contentBackup = node.textContent;
    super.attach.call(this, node);

    this.selectBox.cornersVisible = false;
  }

  public detach() {
    if (!this.attached) {
      return;
    }

    let newContent: string | undefined;

    if (this.textarea) {
      newContent = this.textarea.value;
    } else if (this.rustyInput) {
      newContent = this.rustyInput.value;
    }

    if (newContent === undefined) {
      return;
    }

    const { id } = this.attached;
    const isGameUIInput = this.attached instanceof GameUIInput;

    super.detach();
    // 对比下是否有变化，如果有，再发送action，避免产生无效的撤销重做
    if (this.contentBackup !== newContent) {
      if (isGameUIInput) {
        this.projectTransaction
          .push((action) =>
            action.uiTree
              .update(id)
              .update()
              .element.update()
              .input.textContent(newContent),
          )
          .commit();
      } else {
        this.projectTransaction
          .push((action) =>
            action.uiTree
              .update(id)
              .update()
              .element.update()
              .text.textContent(newContent),
          )
          .commit();
      }

      this.updateUITree();
    }

    this.contentBackup = undefined;

    this.selectBox.cornersVisible = true;
  }
}
