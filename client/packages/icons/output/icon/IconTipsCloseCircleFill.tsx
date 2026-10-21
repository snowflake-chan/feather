import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconTipsCloseCircleFill = (
  props: SVGProps<SVGSVGElement>,
  ref: Ref<SVGSVGElement>,
) => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    ref={ref}
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2ZM8.114 9.528l2.475 2.475-2.475 2.475 1.414 1.414 2.475-2.474 2.475 2.474 1.414-1.414-2.474-2.475 2.474-2.475-1.414-1.414-2.475 2.475-2.475-2.475-1.414 1.414Z"
    />
  </svg>
);
const ForwardRef = forwardRef(IconTipsCloseCircleFill);
const Memo = memo(ForwardRef);
export default Memo;
