import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconBlockArithmetic = (
  props: SVGProps<SVGSVGElement>,
  ref: Ref<SVGSVGElement>,
) => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    ref={ref}
    {...props}
  >
    <g>
      <path d="M21 1H3c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2Zm0 20H3V3h18v18Z" />
      <path d="M10.25 6.72h-5v1.5h5v-1.5ZM19 16.75h-5v1.5h5v-1.5ZM19 14.25h-5v1.5h5v-1.5ZM7 19h1.5v-2h2v-1.5h-2v-2H7v2H5V17h2v2ZM15.09 9.95l1.41-1.41 1.41 1.41 1.06-1.06-1.41-1.42 1.41-1.41L17.91 5 16.5 6.41 15.09 5l-1.06 1.06 1.41 1.41-1.41 1.42 1.06 1.06Z" />
    </g>
  </svg>
);
const ForwardRef = forwardRef(IconBlockArithmetic);
const Memo = memo(ForwardRef);
export default Memo;
