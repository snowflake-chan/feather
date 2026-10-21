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
import { isUITextNode } from '@box/schema/project/ui-rda/util';
import { ItemId, MenuItemOptions, TextArea } from '@box/box-design';
import { InputPauseFlags } from '@box/schema/input/input-schema';
import {
  TextXAlignType,
  TextYAlignType,
  UITextFontFamily,
} from '@box/schema/project/ui-rda/defs';
import { useEdit } from 'src/client/edit/edit-context';
import { InputPause, useInputPause } from 'src/views/components/input-lock';
import { OnAlignmentChange, TextAlignments } from './alignment';

import { ColorGroups } from '../inputs/color-input';
import { ColorPropertyGroups, addColorGroup } from '../inputs/color-property';
import { InlineNamedSpinInput } from '../inputs/inline-named-spin-input';
import { UITreeContext } from '../../hooks';
import styles from '../input-property/style.module.scss';
import { InlineNamedCheckbox } from 'src/views/edit/components/game-ui/property/inputs/inline-named-checkbox';
import {
  isFontFamily,
  mergeBasicType,
  MergedConfig,
  useFontFamilySelections,
} from 'src/views/edit/components/game-ui/property/util';
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

export const TextProperty = memo((props: Props) => {
  const intl = useIntl();
  const { ids } = props;

  const { gameUIEditor } = useEdit();
  const uiTreeRef = useContext(UITreeContext);

  const inputGroups = useRef<InputGroups>({});

  const onTextChange = useCallback(
    (groupId: string, newText: string) => {
      const ids = inputGroups.current[groupId]?.ids;

      if (!ids || ids.length === 0) {
        return;
      }

      gameUIEditor.uiTreeController.setElementsTextContent(ids, newText);
    },
    [gameUIEditor],
  );

  const onAutoWordWrapChange = useCallback(
    (value: boolean) => {
      gameUIEditor.uiTreeController.setElementsTextAutoWordWrapChange(
        ids,
        value,
      );
    },
    [gameUIEditor, ids],
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
    strokeColorGroups,
    strokeThickness,
    fontFamily,
    richText,
  } = useMemo(() => {
    const textInputs: ReactNode[] = [];
    let xAlignment: TextXAlignType | undefined = TextXAlignType.Center;
    let yAlignment: TextYAlignType | undefined = TextYAlignType.Center;
    let fontSize: number = 0;
    let fontSizeMixed = false;
    let lineHeight: MergedConfig<number> | undefined;
    let autoWordWrap: MergedConfig<boolean> | undefined;
    let strokeThickness: MergedConfig<number> | undefined;
    let fontFamily: MergedConfig<UITextFontFamily> | undefined;
    let richText: MergedConfig<boolean> | undefined;

    const contentMapping: ContentMapping = {};

    const { uiTree } = uiTreeRef;

    const colorGroups: ColorGroups = {};

    const strokeColorGroups: ColorGroups = {};

    inputGroups.current = {};

    ids.forEach((id, index) => {
      const node = uiTree[id];

      if (!node || !node.value || !isUITextNode(node.value)) {
        return;
      }

      // 创建组
      const { textContent, textXAlignment, textYAlignment, textFontSize } =
        node.value.data.data;
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
      const { textColor, textOpacity, textStrokeColor, textStrokeOpacity } =
        node.value.data.data;

      addColorGroup(colorGroups, id, textColor, textOpacity);

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
      richText = mergeBasicType({
        out: richText,
        b: node.value.data.data.richText,
      });
    });

    return {
      textInputs,
      xAlignment,
      yAlignment,
      fontSize,
      fontSizeMixed,
      colorGroups,
      lineHeight,
      autoWordWrap,
      strokeColorGroups,
      strokeThickness,
      fontFamily,
      richText,
    };
  }, [uiTreeRef, ids, onTextChange]);

  const { inputPauseChange } = useInputPause();

  const [isFocused, setIsFocused] = useState(false);

  const onAlignmentChange = useCallback<OnAlignmentChange>(
    (spec) => {
      gameUIEditor.uiTreeController.setElementsTextAlignment(ids, spec);
    },
    [gameUIEditor, ids],
  );

  const onFontSizeChange = useCallback(
    (ids: string[], value: number) => {
      gameUIEditor.uiTreeController.setElementsTextFontSize(ids, value);
    },
    [gameUIEditor],
  );

  const onLineHeightChange = useCallback(
    (ids: string[], value: number) => {
      gameUIEditor.uiTreeController.setElementsTextLineHeight(ids, value);
    },
    [gameUIEditor],
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

  const onRichTextChange = useCallback(
    (value: boolean) => {
      gameUIEditor.uiTreeController.setTextRichText(ids, value);
    },
    [gameUIEditor, ids],
  );

  return (
    <div
      className={styles.textProperty}
      onFocus={() => {
        !isFocused && setIsFocused(true);
      }}
      onBlur={() => {
        isFocused && setIsFocused(false);
      }}
    >
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
        onColorChange={gameUIEditor.uiTreeController.setElementsTextColor}
        onOpacityChange={gameUIEditor.uiTreeController.setElementsTextOpacity}
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
      {richText && (
        <InlineNamedCheckbox
          {...richText}
          name={intl.formatMessage({
            id: 'gameUIPropTextRichText',
          })}
          onChange={onRichTextChange}
        />
      )}
    </div>
  );
});

type TextAreaInputProps = {
  groupId: string;
  text: string;
  onChange: (groupId: string, value: string) => void;
};

export const TextAreaInput = memo((props: TextAreaInputProps) => {
  const { groupId, text, onChange: propsOnChange } = props;

  const onChange = useCallback(
    (value: string) => {
      propsOnChange(groupId, value);
    },
    [groupId, propsOnChange],
  );

  return (
    <div className={styles.textAreaInput}>
      <TextArea className={styles.textArea} value={text} onBlur={onChange} />
    </div>
  );
});
