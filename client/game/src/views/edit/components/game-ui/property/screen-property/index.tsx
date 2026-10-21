import { memo, useCallback, useContext, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { isUIScreen } from '@box/schema/project/ui-rda/util';
import { useEdit } from 'src/client/edit/edit-context';
import { InlineNamedSpinInput } from '../inputs/inline-named-spin-input';
import { UITreeContext } from '../../hooks';
import styles from './style.module.scss';
import {
  mergeBasicType,
  MergedConfig,
} from 'src/views/edit/components/game-ui/property/util';

export const ScreenProperty = memo(({ ids }: { ids: string[] }) => {
  const intl = useIntl();

  const uiTreeRef = useContext(UITreeContext);

  const editor = useEdit();
  const { gameUIEditor } = editor;

  const { zIndex } = useMemo(() => {
    let zIndex: MergedConfig<number> | undefined;

    const { uiTree } = uiTreeRef;

    ids.forEach((id) => {
      const node = uiTree[id];

      if (!node || !node.value || !node.value.data || !isUIScreen(node.value)) {
        return;
      }

      zIndex = mergeBasicType({
        out: zIndex,
        b: node.value.data.zIndex,
      });
    });

    return {
      zIndex,
    };
  }, [ids, uiTreeRef]);

  const onZIndexChange = useCallback(
    (ids: string[], zIndex: number) => {
      gameUIEditor.uiTreeController.setScreenZIndex(ids, zIndex);
    },
    [gameUIEditor.uiTreeController],
  );

  return (
    <div className={styles.inputProperty}>
      {zIndex && (
        <InlineNamedSpinInput
          name={intl.formatMessage({
            id: 'gameUIPropZIndex',
          })}
          value={zIndex.value}
          mixed={zIndex.mixed}
          onChange={onZIndexChange}
        />
      )}
    </div>
  );
});
