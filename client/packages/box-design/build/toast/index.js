import { createRoot } from 'react-dom/client';
import { createElement } from 'react';
import { MemoizedToast } from './toast.js';
import styles from './style.module.scss.js';

const TOAST_CONTAINER = 'boxToasts';
const MAX_COUNT = 3;
let toastContainer = null;
let toastRoot = null;
let toastArray = [];
let seed = 0;
function toastFactory(type, config) {
  const id = seed++;
  const onClose = () => {
    config.onClose && config.onClose();
    removeToast(id);
  };
  const toast = /*#__PURE__*/createElement(MemoizedToast, {
    ...config,
    type: type,
    key: `TOAST-${id}`,
    onClose: onClose
  });
  addToast(id, toast);
  return id;
}
function addToast(id, toast) {
  toastArray.push([id, toast]);
  if (toastArray.length > MAX_COUNT) {
    toastArray.shift();
  }
  render();
}
function removeToast(id) {
  toastArray = toastArray.filter(toastTuple => toastTuple[0] !== id);
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
function createDefaultToast(config) {
  return toastFactory('default', config);
}
function createSuccessToast(config) {
  return toastFactory('success', config);
}
function createErrorToast(config) {
  return toastFactory('error', config);
}
function createWarningToast(config) {
  return toastFactory('warning', config);
}
function createInfoToast(config) {
  return toastFactory('info', config);
}
function createLoadingToast(config) {
  return toastFactory('loading', config);
}
const Toast = {
  default: createDefaultToast,
  success: createSuccessToast,
  error: createErrorToast,
  warning: createWarningToast,
  info: createInfoToast,
  loading: createLoadingToast,
  destroyAll: unmountContainer
};

export { Toast };
//# sourceMappingURL=index.js.map
