import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconSort = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    ref={ref}
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M2.5 3.5h19v2h-19v-2Zm0 7.5h14.75v2H2.5v-2Zm0 7.5h7v2h-7v-2Z"
    />
  </svg>
);
const ForwardRef = forwardRef(IconSort);
const Memo = memo(ForwardRef);
export default Memo;
