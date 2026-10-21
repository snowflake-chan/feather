import * as React from 'react';
import { forwardRef, memo } from 'react';
const IconRotation = (props, ref) => (React.createElement("svg", Object.assign({ viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", ref: ref }, props),
    React.createElement("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M5 2a1 1 0 0 0-2 0v17a2 2 0 0 0 2 2h17a1 1 0 1 0 0-2h-6.038C15.502 12.955 10.908 8.065 5 7.153V2Zm0 7.181V19h8.955C13.51 14.06 9.8 10.063 5 9.181Z" })));
const ForwardRef = forwardRef(IconRotation);
const Memo = memo(ForwardRef);
export default Memo;
//# sourceMappingURL=IconRotation.js.map