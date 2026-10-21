import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconCopy = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    ref={ref}
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M11 5h8v8h-8V5ZM9 5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2V5ZM5 7h2v7a3 3 0 0 0 3 3h7v2a2 2 0 0 1-2 2H6a3 3 0 0 1-3-3V9a2 2 0 0 1 2-2Z"
    />
  </svg>
);
const ForwardRef = forwardRef(IconCopy);
const Memo = memo(ForwardRef);
export default Memo;
