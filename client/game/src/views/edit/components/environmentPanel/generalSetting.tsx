import React, { useState, useEffect } from 'react';
import {
  XYZType,
  MovementBounds,
  VoxelShape,
} from '@box/schema/project/project-rda';
import { Toast } from '@box/box-design/build';

import {
  CustomProperty,
  SwitcherProperty,
} from '../../../components/edit/property';
import { Input } from '../../../components/edit/input';
import { Button } from '../../../components/edit/button';
import { Modal } from '../../../components/edit/modal';
import { editor } from 'src/client/edit/edit-client';

import style from './index.module.css';
import { useIntl } from 'react-intl';

type Props = {
  voxelShape: VoxelShape;
  spawnPoint: XYZType;
  movementBounds: MovementBounds;
  getPlayerPosition: () => { x: number; y: number; z: number } | null;
  drawDistance: number;
};

enum SpawnPointAxis {
  x = 'x',
  y = 'y',
  z = 'z',
}

const spawnPointAxis = [SpawnPointAxis.x, SpawnPointAxis.y, SpawnPointAxis.z];

export function GeneralSetting(props: Props) {
  const intl = useIntl();
  const [axis, setAxis] = useState({
    x: props.spawnPoint[SpawnPointAxis.x],
    y: props.spawnPoint[SpawnPointAxis.y],
    z: props.spawnPoint[SpawnPointAxis.z],
  });
  const [isErrors, setIsError] = useState({
    x: false,
    y: false,
    z: false,
  });
  const [bounds, setBounds] = useState({
    x: { lo: props.movementBounds.lo.x, hi: props.movementBounds.hi.x },
    y: { lo: props.movementBounds.lo.y, hi: props.movementBounds.hi.y },
    z: { lo: props.movementBounds.lo.z, hi: props.movementBounds.hi.z },
  });
  const drawDistanceCfg = [256, 512, 1024];

  const [showResetSpawnPointModal, setShowResetSpawnPointModal] =
    useState(false);
  const [showResetPlayerBoundModal, setShowResetPlayerBoundModal] =
    useState(false);

  const setBoundsWay = {
    x: {
      lo: editor.envController.setMovementBoundLoX,
      hi: editor.envController.setMovementBoundHiX,
    },
    y: {
      lo: editor.envController.setMovementBoundLoY,
      hi: editor.envController.setMovementBoundHiY,
    },
    z: {
      lo: editor.envController.setMovementBoundLoZ,
      hi: editor.envController.setMovementBoundHiZ,
    },
  };

  const resetSpawnPoint = () => {
    const processSpawnPoint = {
      x: 0.5 * (bounds[SpawnPointAxis.x].hi + bounds[SpawnPointAxis.x].lo),
      y: bounds[SpawnPointAxis.y].hi,
      z: 0.5 * (bounds[SpawnPointAxis.z].hi + bounds[SpawnPointAxis.z].lo),
    };
    editor.envController.setSpawnPoint(processSpawnPoint);
    setAxis(processSpawnPoint);
  };

  const resetMovementBound = () => {
    const { x, y, z } = props.voxelShape;
    const {
      setMovementBoundLoX,
      setMovementBoundHiX,
      setMovementBoundLoY,
      setMovementBoundHiY,
      setMovementBoundLoZ,
      setMovementBoundHiZ,
    } = editor.envController;
    setMovementBoundLoX(-50);
    setMovementBoundLoY(-50);
    setMovementBoundLoZ(-50);
    setMovementBoundHiX(x + 50);
    setMovementBoundHiY(y + 50);
    setMovementBoundHiZ(z + 50);
  };

  const onSpawnPointChange = (value: string, nowAxis: SpawnPointAxis) => {
    let num = Number(value);
    if (isNaN(num)) {
      num = 0;
    }
    if (num >= bounds[nowAxis].lo && num < bounds[nowAxis].hi) {
      editor.envController.setSpawnPoint({
        ...axis,
        [nowAxis]: num,
      });
    } else {
      setIsError((prev) => {
        return {
          ...prev,
          [nowAxis]: true,
        };
      });
      Toast.error({ content: intl.formatMessage({ id: 'exceedBound' }) });
    }
    setAxis((prev) => {
      return {
        ...prev,
        [nowAxis]: num,
      };
    });
  };

  const onUsePlayerPosition = () => {
    const data = props.getPlayerPosition();
    if (!data) {
      return;
    }
    setAxis(data);
    editor.envController.setSpawnPoint(data);
    Toast.success({
      content: intl.formatMessage({ id: 'setSpawnPointSuccess' }),
    });
  };

  const onDrawDistanceChange = (value: number) => {
    editor.envController.setDrawDistance(drawDistanceCfg[value]);
  };

  useEffect(() => {
    setAxis({
      x: props.spawnPoint[SpawnPointAxis.x],
      y: props.spawnPoint[SpawnPointAxis.y],
      z: props.spawnPoint[SpawnPointAxis.z],
    });
  }, [JSON.stringify(props.spawnPoint)]);

  useEffect(() => {
    spawnPointAxis.forEach((pointAxis) => {
      const num = axis[pointAxis];
      setIsError((prev) => {
        return {
          ...prev,
          [pointAxis]: num < bounds[pointAxis].lo || num > bounds[pointAxis].hi,
        };
      });
    });
  }, [JSON.stringify(axis), JSON.stringify(bounds)]);

  const getAxisWhenBoundChange = (spawnPoint: SpawnPointAxis) => {
    const value = axis[spawnPoint];
    if (value > bounds[spawnPoint].hi) {
      return bounds[spawnPoint].hi;
    } else if (value < bounds[spawnPoint].lo) {
      return bounds[spawnPoint].lo;
    } else {
      return value;
    }
  };

  useEffect(() => {
    const processSpawnPoint = {
      x: getAxisWhenBoundChange(SpawnPointAxis.x),
      y: getAxisWhenBoundChange(SpawnPointAxis.y),
      z: getAxisWhenBoundChange(SpawnPointAxis.z),
    };
    editor.envController.setSpawnPoint(processSpawnPoint);
  }, [JSON.stringify(bounds)]);

  useEffect(() => {
    setBounds({
      x: { lo: props.movementBounds.lo.x, hi: props.movementBounds.hi.x },
      y: { lo: props.movementBounds.lo.y, hi: props.movementBounds.hi.y },
      z: { lo: props.movementBounds.lo.z, hi: props.movementBounds.hi.z },
    });
  }, [JSON.stringify(props.movementBounds)]);

  return (
    <>
      <div className={style.mapSize}>
        <span className={style.mapSizeName}>
          {intl.formatMessage({ id: 'mapSize' })}
        </span>
        <span>
          {spawnPointAxis
            .map((item) => {
              return props.voxelShape[item];
            })
            .join(' x ')}
        </span>
      </div>
      <CustomProperty name={intl.formatMessage({ id: 'spawnPoint' })}>
        <div
          className={style.resetIcon}
          onClick={() => setShowResetSpawnPointModal(true)}
        ></div>
      </CustomProperty>
      <div className={style.spawnPointWrapper}>
        {spawnPointAxis.map((spawnPoint) => {
          return (
            <div className={style.spawnPointItem} key={spawnPoint}>
              <Input
                containerStyle={{ width: '100%' }}
                value={axis[spawnPoint]}
                isError={isErrors[spawnPoint]}
                onChange={(value) => onSpawnPointChange(value, spawnPoint)}
                small
              />
              {spawnPoint.toUpperCase()}
            </div>
          );
        })}
      </div>
      <Button
        value={intl.formatMessage({ id: 'useCurrentPosition' })}
        style={{ margin: 0 }}
        onClick={onUsePlayerPosition}
        fullWidth
      />
      <CustomProperty name={intl.formatMessage({ id: 'playerBound' })}>
        <div
          className={style.resetIcon}
          onClick={() => setShowResetPlayerBoundModal(true)}
        ></div>
      </CustomProperty>
      {spawnPointAxis.map((spawnPoint) => {
        return (
          <CustomProperty
            key={spawnPoint}
            name={intl.formatMessage({ id: `${spawnPoint}AxisRange` })}
          >
            <div className={style.pairInputWrapper}>
              <Input
                value={bounds[spawnPoint].lo}
                onChange={(value) => {
                  let num = Number(value);
                  if (isNaN(num)) {
                    num = 0;
                  }
                  if (num >= bounds[spawnPoint].hi) {
                    setBoundsWay[spawnPoint].lo(bounds[spawnPoint].hi - 1);
                    return;
                  }
                  setBoundsWay[spawnPoint].lo(num);
                }}
                small
              />
              <span className={style.pairInputConnect}>-</span>
              <Input
                value={bounds[spawnPoint].hi}
                onChange={(value) => {
                  let num = Number(value);
                  if (isNaN(num)) {
                    num = 0;
                  }
                  if (num <= bounds[spawnPoint].lo) {
                    setBoundsWay[spawnPoint].hi(bounds[spawnPoint].lo + 1);
                    return;
                  }
                  setBoundsWay[spawnPoint].hi(num);
                }}
                small
              />
            </div>
          </CustomProperty>
        );
      })}
      <SwitcherProperty
        name={intl.formatMessage({ id: 'drawDistance' })}
        value={drawDistanceCfg.findIndex((item) => item === props.drawDistance)}
        switch={[
          {
            id: 0,
            text: intl.formatMessage({ id: 'low' }),
          },
          {
            id: 1,
            text: intl.formatMessage({ id: 'medium' }),
          },
          {
            id: 2,
            text: intl.formatMessage({ id: 'high' }),
          },
        ]}
        onChange={onDrawDistanceChange}
      />
      <Modal
        width={400}
        title={
          intl.formatMessage({ id: 'reset' }) +
          intl.formatMessage({ id: 'spawnPoint' })
        }
        visible={showResetSpawnPointModal}
        cancel={intl.formatMessage({ id: 'cancel' })}
        confirm={intl.formatMessage({ id: 'reset' })}
        handleConfirm={() => {
          resetSpawnPoint();
          setShowResetSpawnPointModal(false);
        }}
        handleCancel={() => setShowResetSpawnPointModal(false)}
      >
        {intl.formatMessage({ id: 'confirmResetSpawnPoint' })}
      </Modal>
      <Modal
        width={400}
        title={
          intl.formatMessage({ id: 'reset' }) +
          intl.formatMessage({ id: 'playerBound' })
        }
        visible={showResetPlayerBoundModal}
        cancel={intl.formatMessage({ id: 'cancel' })}
        confirm={intl.formatMessage({ id: 'reset' })}
        handleConfirm={() => {
          resetMovementBound();
          setShowResetPlayerBoundModal(false);
        }}
        handleCancel={() => setShowResetPlayerBoundModal(false)}
      >
        {intl.formatMessage({ id: 'confirmResetPlayerBound' })}
      </Modal>
    </>
  );
}
