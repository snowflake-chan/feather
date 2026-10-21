import * as React from 'react';
import { forwardRef, memo } from 'react';
const IconLayoutDefault = (props, ref) => (React.createElement("svg", Object.assign({ viewBox: "0 0 32 32", xmlns: "http://www.w3.org/2000/svg", ref: ref }, props),
    React.createElement("circle", { cx: 16, cy: 16, r: 3 })));
const ForwardRef = forwardRef(IconLayoutDefault);
const Memo = memo(ForwardRef);
export default Memo;
//# sourceMappingURL=IconLayoutDefault.js.map