import { createRoot, Root } from 'react-dom/client';
import React, { type JSX } from 'react';
import { MemoizedToast, ToastProps, ToastType } from './toast';
import styles from './style.module.scss';

const TOAST_CONTAINER = 'boxToasts';
const MAX_COUNT = 3;

let toastContainer: HTMLDivElement | null = null;
let toastRoot: Root | null = null;
let toastArray: [number, JSX.Element][] = [];
let seed: number = 0;

type BasicToastConfig = Omit<ToastProps, 'type'>;

function toastFactory(type: ToastType, config: BasicToastConfig) {
  const id = seed++;
  const onClose = () => {
    config.onClose && config.onClose();
    removeToast(id);
  };
  const toast: JSX.Element = (
    <MemoizedToast
      {...config}
      type={type}
      key={`TOAST-${id}`}
      onClose={onClose}
    />
  );
  addToast(id, toast);
  return id;
}

function addToast(id: number, toast: JSX.Element) {
  toastArray.push([id, toast]);
  if (toastArray.length > MAX_COUNT) {
    toastArray.shift();
  }
  render();
}

function removeToast(id: number) {
  toastArray = toastArray.filter((toastTuple) => toastTuple[0] !== id);
  render();
}

function render() {
  const toastContainer = getContainer();
  if (!toastRoot) {
    toastRoot = createRoot(toastContainer);
  }
  toastRoot.render(toastArray.map(([id, toast]) => toast));
}

function getContainer() {
  toastContainer = document.querySelector(`#${TOAST_CONTAINER}`);

  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = TOAST_CONTAINER;
    toastContainer.className = styles.toastsContainer;
    document.body.appendChild(toastContainer);
  }

  return toastContainer;
}

function unmountContainer() {
  toastArray = [];
  if (toastRoot !== null) {
    toastRoot.unmount();
    toastRoot = null;
  }
  if (toastContainer !== null) {
    toastContainer.remove();
    toastContainer = null;
  }
}

function createDefaultToast(config: BasicToastConfig) {
  return toastFactory('default', config);
}

function createSuccessToast(config: BasicToastConfig) {
  return toastFactory('success', config);
}

function createErrorToast(config: BasicToastConfig) {
  return toastFactory('error', config);
}

function createWarningToast(config: BasicToastConfig) {
  return toastFactory('warning', config);
}

function createInfoToast(config: BasicToastConfig) {
  return toastFactory('info', config);
}

function createLoadingToast(config: BasicToastConfig) {
  return toastFactory('loading', config);
}

export const Toast = {
  default: createDefaultToast,
  success: createSuccessToast,
  error: createErrorToast,
  warning: createWarningToast,
  info: createInfoToast,
  loading: createLoadingToast,
  destroyAll: unmountContainer,
};
