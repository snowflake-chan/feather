import React, { useState } from 'react';
import {
  BaseModalOptions,
  ModalOptions,
  ModalView,
} from '@box/box-design/build/modal';

type StackFnsType = {
  handleBack: () => void;
  handleNext: () => void;
};
const stackFns: StackFnsType = {
  handleBack: () => {},
  handleNext: () => {},
};

export interface StackModalOptions extends BaseModalOptions {
  /**
   * 层级模态框 存储栈
   */
  modalStack: ModalOptions[];
}

export const StackModalView = (props: StackModalOptions) => {
  const { modalStack } = props;
  const [curModalIndex, setCurModalIndex] = useState<number>(0);

  if (modalStack.length === 0) return null;

  stackFns.handleBack = () => {
    if (curModalIndex > 0) {
      setCurModalIndex(curModalIndex - 1);
    }
  };
  stackFns.handleNext = () => {
    if (curModalIndex < modalStack.length - 1) {
      setCurModalIndex(curModalIndex + 1);
    }
  };
  return <ModalView {...modalStack[curModalIndex]} />;
};

export const StackModal = {
  stackFns,
};
