import {
  ReactNode,
  memo,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { nanoid } from '@reduxjs/toolkit';
import { useIntl } from 'react-intl';
import { isUIInputNode } from '@box/schema/project/ui-rda/util';
import { InputPauseFlags } from '@box/schema/input/input-schema';
import {
  TextXAlignType,
  TextYAlignType,
  UITextFontFamily,
} from '@box/schema/project/ui-rda/defs';
import type { ItemId } from '@box/box-design';
import { useEdit } from 'src/client/edit/edit-context';
import { InputPause, useInputPause } from 'src/views/components/input-lock';

import { ColorGroups } from '../inputs/color-input';
import { ColorPropertyGroups, addColorGroup } from '../inputs/color-property';
import { InlineNamedSpinInput } from '../inputs/inline-named-spin-input';
import { UITreeContext } from '../../hooks';
import styles from './style.module.scss';
import {
  OnAlignmentChange,
  TextAlignments,
} from 'src/views/edit/components/game-ui/property/text-property/alignment';
import { InlineNamedCheckbox } from 'src/views/edit/components/game-ui/property/inputs/inline-named-checkbox';
import {
  isFontFamily,
  mergeBasicType,
  MergedConfig,
  useFontFamilySelections,
} from 'src/views/edit/components/game-ui/property/util';
import { TextAreaInput } from 'src/views/edit/components/game-ui/property/text-property';
import {
  TEXT_FONT_SIZE_RANGE,
  TEXT_STROKE_THICKNESS_RANGE,
} from 'src/engine/game-ui/nodes/defs';
import { InlineSelectInput } from '../inputs/select-input';

type Props = {
  /**
   * 文本节点的id数组
   */
  ids: string[];
};

type InputGroup = {
  groupId: string;
  ids: string[];
  value: string;
};
type InputGroups = Record<string, InputGroup>;

/**
 * 文本内容 映射 组id
 */
type ContentMapping = Record<string, string>;

export const InputProperty = memo((props: Props) => {
  const intl = useIntl();
  const { ids } = props;

  const { gameUIEditor } = useEdit();
  const uiTreeRef = useContext(UITreeContext);

  const inputGroups = useRef<InputGroups>({});
  const placeholderGroups = useRef<InputGroups>({});

  const onTextChange = useCallback(
    (groupId: string, newText: string) => {
      const ids = inputGroups.current[groupId]?.ids;

      if (!ids || ids.length === 0) {
        return;
      }

      gameUIEditor.uiTreeController.setElementsInputContent(ids, newText);
    },
    [gameUIEditor],
  );

  const onPlaceholderChange = useCallback(
    (groupId: string, newText: string) => {
      const ids = placeholderGroups.current[groupId]?.ids;

      if (!ids || ids.length === 0) {
        return;
      }

      gameUIEditor.uiTreeController.setElementsInputPlaceholder(ids, newText);
    },
    [gameUIEditor],
  );

  const {
    textInputs,
    xAlignment,
    yAlignment,
    fontSize,
    fontSizeMixed,
    colorGroups,
    lineHeight,
    autoWordWrap,
    placeholders,
    placeholderColors,
    placeholderColorGroups,
    strokeColorGroups,
    strokeThickness,
    fontFamily,
  } = useMemo(() => {
    const textInputs: ReactNode[] = [];
    const placeholders: ReactNode[] = [];
    const placeholderColors: ReactNode[] = [];
    let xAlignment: TextXAlignType | undefined = TextXAlignType.Center;
    let yAlignment: TextYAlignType | undefined = TextYAlignType.Center;
    let fontSize: number = 0;
    let fontSizeMixed = false;
    let lineHeight: MergedConfig<number> | undefined;
    let autoWordWrap: MergedConfig<boolean> | undefined;
    let strokeThickness: MergedConfig<number> | undefined;
    let fontFamily: MergedConfig<UITextFontFamily> | undefined;

    const contentMapping: ContentMapping = {};
    const placeholderMapping: ContentMapping = {};

    const { uiTree } = uiTreeRef;

    const colorGroups: ColorGroups = {};
    const placeholderColorGroups: ColorGroups = {};
    const strokeColorGroups: ColorGroups = {};

    inputGroups.current = {};
    placeholderGroups.current = {};

    ids.forEach((id, index) => {
      const node = uiTree[id];

      if (!node || !node.value || !isUIInputNode(node.value)) {
        return;
      }

      // 创建组
      const {
        textContent,
        textXAlignment,
        textYAlignment,
        textFontSize,
        placeholder,
      } = node.value.data.data;
      if (!contentMapping[textContent]) {
        const groupId = nanoid();

        contentMapping[textContent] = groupId;

        inputGroups.current[groupId] = {
          groupId,
          ids: [node.id],
          value: textContent,
        };

        textInputs.push(
          <TextAreaInput
            key={groupId}
            groupId={groupId}
            text={textContent}
            onChange={onTextChange}
          />,
        );
      } else {
        inputGroups.current[contentMapping[textContent]].ids.push(node.id);
      }

      if (!placeholderMapping[placeholder]) {
        const groupId = nanoid();

        placeholderMapping[placeholder] = groupId;

        placeholderGroups.current[groupId] = {
          groupId,
          ids: [node.id],
          value: placeholder,
        };

        placeholders.push(
          <TextAreaInput
            key={groupId}
            groupId={groupId}
            text={placeholder}
            onChange={onPlaceholderChange}
          />,
        );
      } else {
        placeholderGroups.current[placeholderMapping[placeholder]].ids.push(
          node.id,
        );
      }
      const {
        textColor,
        textOpacity,
        placeholderColor,
        placeholderOpacity,
        textStrokeColor,
        textStrokeOpacity,
      } = node.value.data.data;

      addColorGroup(colorGroups, id, textColor, textOpacity);
      addColorGroup(
        placeholderColorGroups,
        id,
        placeholderColor,
        placeholderOpacity,
      );
      addColorGroup(strokeColorGroups, id, textStrokeColor, textStrokeOpacity);

      if (index === 0) {
        xAlignment = textXAlignment;
        yAlignment = textYAlignment;

        fontSize = textFontSize;
      } else {
        if (xAlignment !== undefined && xAlignment !== textXAlignment) {
          xAlignment = undefined;
        }
        if (yAlignment !== undefined && yAlignment !== textYAlignment) {
          yAlignment = undefined;
        }

        if (!fontSizeMixed) {
          fontSizeMixed = fontSize !== textFontSize;
        }
      }

      lineHeight = mergeBasicType({
        out: lineHeight,
        b: node.value.data.data.textLineHeight,
      });

      autoWordWrap = mergeBasicType({
        out: autoWordWrap,
        b: node.value.data.data.autoWordWrap,
      });

      strokeThickness = mergeBasicType({
        out: strokeThickness,
        b: node.value.data.data.textStrokeThickness,
      });

      fontFamily = mergeBasicType({
        out: fontFamily,
        b: node.value.data.data.textFontFamily,
      });
    });

    return {
      textInputs,
      placeholderColors,
      xAlignment,
      yAlignment,
      fontSize,
      fontSizeMixed,
      lineHeight,
      colorGroups,
      placeholderColorGroups,
      autoWordWrap,
      placeholders,
      strokeColorGroups,
      strokeThickness,
      fontFamily,
    };
  }, [uiTreeRef, ids, onTextChange, onPlaceholderChange]);

  const { inputPauseChange } = useInputPause();

  const [isFocused, setIsFocused] = useState(false);

  const onAlignmentChange = useCallback<OnAlignmentChange>(
    (spec) => {
      gameUIEditor.uiTreeController.setElementsInputAlignment(ids, spec);
    },
    [gameUIEditor, ids],
  );

  const onFontSizeChange = useCallback(
    (ids: string[], value: number) => {
      gameUIEditor.uiTreeController.setElementsInputFontSize(ids, value);
    },
    [gameUIEditor],
  );

  const onLineHeightChange = useCallback(
    (ids: string[], value: number) => {
      gameUIEditor.uiTreeController.setElementsInputLineHeight(ids, value);
    },
    [gameUIEditor],
  );

  const onAutoWordWrapChange = useCallback(
    (value: boolean) => {
      gameUIEditor.uiTreeController.setElementsInputAutoWordWrapChange(
        ids,
        value,
      );
    },
    [gameUIEditor, ids],
  );

  const fontFamilySelections = useFontFamilySelections(intl);

  const onFontFamilyChange = useCallback(
    ({ id }: { id: ItemId }) => {
      if (isFontFamily(id)) {
        gameUIEditor.setTextFontFamily(ids, id);
      }
    },
    [gameUIEditor, ids],
  );

  return (
    <div
      className={styles.inputProperty}
      onFocus={() => {
        !isFocused && setIsFocused(true);
      }}
      onBlur={() => {
        isFocused && setIsFocused(false);
      }}
    >
      <span className={styles.subTitle}>
        {intl.formatMessage({ id: 'gameUIPropSubTitleInput' })}
      </span>
      {isFocused && (
        <InputPause flags={InputPauseFlags.ALL} change={inputPauseChange} />
      )}
      {textInputs}
      <TextAlignments
        x={xAlignment}
        y={yAlignment}
        onChange={onAlignmentChange}
      />
      {fontFamily && (
        <InlineSelectInput
          name={intl.formatMessage({ id: 'gameUIPropTextFontFamily' })}
          items={fontFamilySelections}
          selection={fontFamily.value}
          mixed={fontFamily.mixed}
          onSelect={onFontFamilyChange}
        />
      )}
      <InlineNamedSpinInput
        name={intl.formatMessage({ id: 'gameUIPropFontSize' })}
        value={fontSize}
        mixed={fontSizeMixed}
        min={TEXT_FONT_SIZE_RANGE[0]}
        max={TEXT_FONT_SIZE_RANGE[1]}
        onChange={onFontSizeChange}
      />
      <ColorPropertyGroups
        groupName={intl.formatMessage({ id: 'gameUIPropTextColor' })}
        groups={colorGroups}
        onColorChange={gameUIEditor.uiTreeController.setElementsInputColor}
        onOpacityChange={gameUIEditor.uiTreeController.setElementsInputOpacity}
      />
      <ColorPropertyGroups
        groupName={intl.formatMessage({
          id: 'gameUIPropTextStrokeColor',
        })}
        groups={strokeColorGroups}
        onColorChange={gameUIEditor.uiTreeController.setTextStrokeColor}
        onOpacityChange={gameUIEditor.uiTreeController.setTextStrokeOpacity}
      />
      {strokeThickness && (
        <InlineNamedSpinInput
          {...strokeThickness}
          name={intl.formatMessage({
            id: 'gameUIPropTextStrokeThickness',
          })}
          step={1}
          precision={1}
          min={TEXT_STROKE_THICKNESS_RANGE[0]}
          max={TEXT_STROKE_THICKNESS_RANGE[1]}
          onChange={gameUIEditor.uiTreeController.setTextStrokeThickness}
        />
      )}
      {lineHeight && (
        <InlineNamedSpinInput
          {...lineHeight}
          name={intl.formatMessage({ id: 'gameUIPropTextLineHeight' })}
          onChange={onLineHeightChange}
          step={0.01}
          precision={2}
        />
      )}

      {autoWordWrap && (
        <InlineNamedCheckbox
          {...autoWordWrap}
          name={intl.formatMessage({
            id: 'gameUIPropTextAutoWordWrap',
          })}
          onChange={onAutoWordWrapChange}
        />
      )}
      <span className={styles.divider} />
      <span className={styles.subTitle}>
        {intl.formatMessage({ id: 'gameUIPropSubTitlePlaceholder' })}
      </span>
      {placeholders}
      {placeholderColors}
      <ColorPropertyGroups
        groupName={intl.formatMessage({ id: 'gameUIPropTextColor' })}
        groups={placeholderColorGroups}
        onColorChange={
          gameUIEditor.uiTreeController.setElementsInputPlaceholderColor
        }
        onOpacityChange={
          gameUIEditor.uiTreeController.setElementsInputPlaceholderOpacity
        }
      />
    </div>
  );
});
