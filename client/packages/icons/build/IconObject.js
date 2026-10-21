import * as React from 'react';
import { forwardRef, memo } from 'react';
const IconObject = (props, ref) => (React.createElement("svg", Object.assign({ viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", ref: ref }, props),
    React.createElement("path", { d: "M10.538 3.774a4.041 4.041 0 0 1 2.924 0l6.477 2.52c.64.249 1.061.852 1.061 1.523v8.366c0 .67-.42 1.274-1.06 1.523l-6.478 2.52a4.041 4.041 0 0 1-2.924 0l-6.477-2.52A1.642 1.642 0 0 1 3 16.183V7.817c0-.67.42-1.274 1.06-1.524l6.478-2.52ZM7.166 7.67a.569.569 0 0 0-.743.277c-.126.277.002.6.286.723l4.728 2.043v5.115c0 .302.252.547.563.547.31 0 .562-.245.562-.547v-5.115l4.729-2.043a.541.541 0 0 0 .285-.723.569.569 0 0 0-.742-.277L12 9.76 7.166 7.67Z" })));
const ForwardRef = forwardRef(IconObject);
const Memo = memo(ForwardRef);
export default Memo;
//# sourceMappingURL=IconObject.js.map