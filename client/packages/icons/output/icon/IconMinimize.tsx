import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconMinimize = (
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
      <path d="M21.835 2.149a1 1 0 0 0-1.406.008l-2.919 2.92-.81-.792a1.002 1.002 0 0 0-1.668.468l-.99 3.876a1 1 0 0 0 1.238 1.21l3.852-1.081a1 1 0 0 0 .428-1.68l-.62-.604 2.903-2.903a1 1 0 0 0-.008-1.422ZM4 5v7a1 1 0 1 1-2 0V5c0-1.654 1.346-3 3-3h7a1 1 0 1 1 0 2H5c-.552 0-1 .449-1 1ZM12 22h7c1.654 0 3-1.346 3-3v-7a1 1 0 1 0-2 0v7a1 1 0 0 1-1 1h-7a1 1 0 1 0 0 2ZM5.139 20.177a1 1 0 1 1-1.414-1.414l2.903-2.903-.62-.605a1.001 1.001 0 0 1 .428-1.68l3.852-1.08a1.003 1.003 0 0 1 .97.247 1 1 0 0 1 .269.963l-.99 3.876a1.002 1.002 0 0 1-.698.716.993.993 0 0 1-.97-.248l-.811-.792-2.92 2.92Z" />
    </g>
  </svg>
);
const ForwardRef = forwardRef(IconMinimize);
const Memo = memo(ForwardRef);
export default Memo;
