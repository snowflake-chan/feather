import * as React from 'react';
import { forwardRef, memo } from 'react';
const IconPosition = (props, ref) => (React.createElement("svg", Object.assign({ viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", ref: ref }, props),
    React.createElement("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M1.854 4.147A.5.5 0 0 0 2.207 5H4v13a2 2 0 0 0 2 2h13v1.793a.5.5 0 0 0 .854.354l2.439-2.44a1 1 0 0 0 0-1.414l-2.44-2.44a.5.5 0 0 0-.853.354V18H6V5h1.793a.5.5 0 0 0 .353-.853l-2.439-2.44a1 1 0 0 0-1.414 0l-2.44 2.44Z" })));
const ForwardRef = forwardRef(IconPosition);
const Memo = memo(ForwardRef);
export default Memo;
//# sourceMappingURL=IconPosition.js.map