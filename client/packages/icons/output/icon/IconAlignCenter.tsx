import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconAlignCenter = (
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
      d="M8 11v2h8v-2H8ZM4 5v2h16V5H4Zm0 12v2h16v-2H4Z"
    />
  </svg>
);
const ForwardRef = forwardRef(IconAlignCenter);
const Memo = memo(ForwardRef);
export default Memo;
