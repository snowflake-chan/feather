import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconAdd2 = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    ref={ref}
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M13 4a1 1 0 1 0-2 0v7H4a1 1 0 1 0 0 2h7v7a1 1 0 1 0 2 0v-7h7a1 1 0 1 0 0-2h-7V4Z"
    />
  </svg>
);
const ForwardRef = forwardRef(IconAdd2);
const Memo = memo(ForwardRef);
export default Memo;
