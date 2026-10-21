import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconDrag = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    ref={ref}
    {...props}
  >
    <g>
      <path d="M7 6a1 1 0 0 1 1-1h8a1 1 0 1 1 0 2H8a1 1 0 0 1-1-1ZM7 12a1 1 0 0 1 1-1h8a1 1 0 1 1 0 2H8a1 1 0 0 1-1-1ZM7 18a1 1 0 0 1 1-1h8a1 1 0 1 1 0 2H8a1 1 0 0 1-1-1Z" />
    </g>
  </svg>
);
const ForwardRef = forwardRef(IconDrag);
const Memo = memo(ForwardRef);
export default Memo;
