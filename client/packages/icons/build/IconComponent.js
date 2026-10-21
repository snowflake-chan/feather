import * as React from 'react';
import { forwardRef, memo } from 'react';
const IconComponent = (props, ref) => (React.createElement("svg", Object.assign({ viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", ref: ref }, props),
    React.createElement("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M12.706 2.293a1 1 0 0 0-1.414 0L8.243 5.342a1 1 0 0 0 0 1.414L12 10.51l3.756-3.755a1 1 0 0 0 0-1.414l-3.049-3.05Zm-5.95 5.95a1 1 0 0 0-1.414 0l-3.05 3.049a1 1 0 0 0 0 1.414l3.05 3.049a1 1 0 0 0 1.414 0l3.755-3.756-3.755-3.756Zm10.486 0a1 1 0 0 1 1.415 0l3.048 3.049a1 1 0 0 1 0 1.414l-3.048 3.049a1 1 0 0 1-1.415 0l-3.755-3.756 3.755-3.756Zm-1.487 9-3.756-3.756-3.756 3.755a1 1 0 0 0 0 1.415l3.049 3.048a1 1 0 0 0 1.414 0l3.049-3.048a1 1 0 0 0 0-1.415Z" })));
const ForwardRef = forwardRef(IconComponent);
const Memo = memo(ForwardRef);
export default Memo;
//# sourceMappingURL=IconComponent.js.map