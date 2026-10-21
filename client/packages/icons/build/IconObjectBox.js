import * as React from 'react';
import { forwardRef, memo } from 'react';
const IconObjectBox = (props, ref) => (React.createElement("svg", Object.assign({ viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", ref: ref }, props),
    React.createElement("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M4 3h16c1.103 0 2 .897 2 2v2c0 .736-.405 1.375-1 1.722V19c0 1.103-.897 2-2 2H5c-1.103 0-2-.897-2-2V8.722C2.405 8.375 2 7.736 2 7V5c0-1.103.897-2 2-2Zm16 2H4v2h16.002L20 5ZM5 9v10h14.002L19 9H5Zm11 2H8v2h8v-2Z" })));
const ForwardRef = forwardRef(IconObjectBox);
const Memo = memo(ForwardRef);
export default Memo;
//# sourceMappingURL=IconObjectBox.js.map