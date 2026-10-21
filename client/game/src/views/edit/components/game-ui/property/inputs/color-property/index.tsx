import type { vec3 } from 'gl-matrix';
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ColorGroups, ColorInput, ColorInputProps } from '../color-input';
import {
  ColorPicker,
  ColorPickerInfo,
  ColorPickerProps,
} from '../color-input/color-picker';
import { isEqual } from 'src/engine/utils/array';

import styles from './style.module.scss';

type ColorPropertyProps = {
  groupId: string;
  ids: string[];
  title: string;
  rgb: vec3;
  opacity: number;
  onColorChange: (ids: string[], bgColor: vec3) => void;
  onOpacityChange: (ids: string[], bgOpacity: number) => void;
  updateColorPicker: (groupId: string, rect: DOMRect) => void;
};

export const ColorProperty = memo((props: ColorPropertyProps) => {
  const {
    ids,
    groupId,
    title,
    rgb,
    opacity,
    onColorChange: propsOnColorChange,
    onOpacityChange: propsOnOpacityChange,
    updateColorPicker: propsUpdateColorPicker,
  } = props;

  const { onColorChange, onOpacityChange, updateColorPicker } = useMemo(() => {
    const onColorChange: ColorInputProps['changeRGB'] = (
      ids: string[],
      rgb: vec3,
    ) => {
      propsOnColorChange(ids, rgb);
    };

    const onOpacityChange: ColorInputProps['changeOpacity'] = (
      ids: string[],
      opacity: number,
    ) => {
      propsOnOpacityChange(ids, opacity);
    };

    const updateColorPicker: ColorInputProps['setColorPicker'] = (
      rect: DOMRect,
    ) => {
      propsUpdateColorPicker(groupId, rect);
    };

    return {
      onColorChange,
      onOpacityChange,
      updateColorPicker,
    };
  }, [
    groupId,
    propsOnColorChange,
    propsOnOpacityChange,
    propsUpdateColorPicker,
  ]);

  return (
    <div className={styles.colorProperty}>
      <div className={styles.title}>{title}</div>
      <div className={styles.inlineInput}>
        <ColorInput
          ids={ids}
          groupId={groupId}
          rgb={rgb}
          opacity={opacity}
          setColorPicker={updateColorPicker}
          changeRGB={onColorChange}
          changeOpacity={onOpacityChange}
        />
      </div>
    </div>
  );
});

export function addColorGroup(
  out: ColorGroups,
  nodeId: string,
  rgb: vec3,
  opacity: number,
) {
  const groupId = `${rgb}-${opacity}-text`;

  if (!out[groupId]) {
    out[groupId] = {
      groupId,
      ids: [nodeId],
      color: rgb,
      opacity,
    };
  } else {
    out[groupId].ids.push(nodeId);
  }
}

/**
 * 使用属性面板 - 颜色的钩子
 */
function ColorPropertyGroupsView(props: {
  /**
   * 组的名字，每个组都用同个名字
   */
  groupName: string;
  /**
   * 分组数据
   */
  groups: ColorGroups;
  onColorChange: ColorPickerProps['onColorChange'];
  onOpacityChange: (ids: string[], opacity: number, commit?: boolean) => void;
}) {
  const { groupName, groups, onColorChange, onOpacityChange } = props;

  /**
   * 另外用ref缓存颜色分组数据，给打开的调色板使用。
   * 调色板在打开后不应受到分组变化影响而产生视觉变化，只需要在回调函数中返回正确的分组成员id即可。
   */
  const colorGroups = useRef<ColorGroups>({});
  colorGroups.current = groups;

  const [colorPickerInfo, setColorPickerInfo] = useState<ColorPickerInfo>();

  const previewRef = useRef<HTMLDivElement>(null);

  const colorPicker = useMemo(() => {
    if (!colorPickerInfo) {
      return;
    }

    return (
      <div
        ref={previewRef}
        style={{
          position: 'fixed',
          zIndex: '11',
          top:
            // TODO 神秘数字，盲猜是为了计算定位在色块的上方，右对齐
            colorPickerInfo.rect.top + 32 > window.innerHeight - 267
              ? colorPickerInfo.rect.top - 275
              : colorPickerInfo.rect.top + 32,
          left: colorPickerInfo.rect.left - 224,
        }}
      >
        <ColorPicker
          rgb={colorPickerInfo.rgb}
          ids={colorPickerInfo.ids}
          onClose={() => {
            setColorPickerInfo(undefined);
          }}
          onColorChange={onColorChange}
        />
      </div>
    );
  }, [colorPickerInfo, onColorChange]);

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (
        !(e.target instanceof Node) ||
        !previewRef.current?.contains(e.target)
      ) {
        setColorPickerInfo(undefined);
      }
    };

    document.addEventListener('mousedown', onMouseDown);

    return () => {
      document.removeEventListener('mousedown', onMouseDown);
    };
  }, []);

  const onGroupColorChange = useCallback(
    (ids: string[], rgb: vec3) => {
      onColorChange(ids, rgb, true);
    },
    [onColorChange],
  );

  const onGroupOpacityChange = useCallback(
    (ids: string[], opacity: number) => {
      onOpacityChange(ids, opacity, true);
    },
    [onOpacityChange],
  );

  const updateColorPicker = useCallback((groupId: string, rect: DOMRect) => {
    setColorPickerInfo({
      ids: colorGroups.current[groupId].ids,
      rgb: colorGroups.current[groupId].color,
      rect: rect,
    });
  }, []);

  const items = useMemo(
    () =>
      Object.keys(groups).map((groupId) => {
        const group = groups[groupId];

        if (!group) {
          return;
        }

        return (
          <ColorProperty
            title={groupName}
            key={groupId}
            ids={group.ids}
            groupId={groupId}
            rgb={group.color}
            opacity={group.opacity}
            onColorChange={onGroupColorChange}
            onOpacityChange={onGroupOpacityChange}
            updateColorPicker={updateColorPicker}
          />
        );
      }),
    [
      groups,
      groupName,
      onGroupColorChange,
      onGroupOpacityChange,
      updateColorPicker,
    ],
  );

  return (
    <>
      {items}
      {colorPicker}
    </>
  );
}

export const ColorPropertyGroups = memo(ColorPropertyGroupsView);
