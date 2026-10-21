import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconBack = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    ref={ref}
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M19 4a1 1 0 0 0-1 1v14a1 1 0 1 0 2 0V5a1 1 0 0 0-1-1Zm-5.108 15.756c.883.626 2.107-.005 2.107-1.087V5.34c0-1.086-1.225-1.716-2.107-1.081l-9.334 6.714a1.333 1.333 0 0 0 0 2.17l9.334 6.614Z"
    />
  </svg>
);
const ForwardRef = forwardRef(IconBack);
const Memo = memo(ForwardRef);
export default Memo;
