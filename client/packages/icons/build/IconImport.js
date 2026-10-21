import * as React from 'react';
import { forwardRef, memo } from 'react';
const IconImport = (props, ref) => (React.createElement("svg", Object.assign({ viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", ref: ref }, props),
    React.createElement("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M11 4v9.25H9.221a.3.3 0 0 0-.22.504l2.632 2.848a.5.5 0 0 0 .734 0L15 13.754a.3.3 0 0 0-.22-.504H13V4a1 1 0 1 0-2 0Zm9 8h-3a1 1 0 1 1 0-2h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3a1 1 0 1 1 0 2H4v7h16v-7Z" })));
const ForwardRef = forwardRef(IconImport);
const Memo = memo(ForwardRef);
export default Memo;
//# sourceMappingURL=IconImport.js.map