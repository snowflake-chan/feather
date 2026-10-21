import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconEditUndo = (
  props: SVGProps<SVGSVGElement>,
  ref: Ref<SVGSVGElement>,
) => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    ref={ref}
    {...props}
  >
    <path d="m2.358 8 4.596-4.595 1.414 1.414L6.188 7h8.562a6.75 6.75 0 0 1 0 13.5H8.5v-2h6.25a4.75 4.75 0 0 0 0-9.5H6.185l2.183 2.183-1.414 1.414-4.596-4.596Z" />
  </svg>
);
const ForwardRef = forwardRef(IconEditUndo);
const Memo = memo(ForwardRef);
export default Memo;
