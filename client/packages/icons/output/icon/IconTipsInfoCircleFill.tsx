import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconTipsInfoCircleFill = (
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
      d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2Zm1 7V7h-2v2h2Zm-2 1v7h2v-7h-2Z"
    />
  </svg>
);
const ForwardRef = forwardRef(IconTipsInfoCircleFill);
const Memo = memo(ForwardRef);
export default Memo;
