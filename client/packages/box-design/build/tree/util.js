const getRealDropData = (dropTarget, treeNodeDataMap) => {
  var _a;
  let realData = treeNodeDataMap.get(dropTarget.dropId);
  for (let i = 0; i > dropTarget.levelOffset; i--) {
    if (!realData) {
      return;
    }
    const parentId = (_a = treeNodeDataMap.get(realData.id)) === null || _a === void 0 ? void 0 : _a.parentId;
    if (!parentId) {
      break;
    }
    realData = treeNodeDataMap.get(parentId);
  }
  return realData;
};
const getBreadcrumbs = (treeNodeDataMap, id) => {
  var _a, _b;
  const breadcrumbs = [];
  let parentId = (_a = treeNodeDataMap.get(id)) === null || _a === void 0 ? void 0 : _a.parentId;
  while (parentId) {
    breadcrumbs.push(parentId);
    parentId = (_b = treeNodeDataMap.get(parentId)) === null || _b === void 0 ? void 0 : _b.parentId;
  }
  return breadcrumbs;
};

export { getBreadcrumbs, getRealDropData };
//# sourceMappingURL=util.js.map
