import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconAlignRight = (
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
      d="M11 11v2h9v-2h-9ZM4 5v2h16V5H4Zm0 12v2h16v-2H4Z"
    />
  </svg>
);
const ForwardRef = forwardRef(IconAlignRight);
const Memo = memo(ForwardRef);
export default Memo;
