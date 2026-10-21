import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconChat = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    ref={ref}
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M2.5 12a9.5 9.5 0 1 1 19 0v.315a9.185 9.185 0 0 1-9.185 9.185H2.5V12ZM12 4.5A7.5 7.5 0 0 0 4.5 12v7.5h7.815a7.185 7.185 0 0 0 7.185-7.185V12A7.5 7.5 0 0 0 12 4.5ZM15.5 9a1 1 0 1 1 0 2h-7a1 1 0 1 1 0-2h7ZM12 14.5a1 1 0 0 1-1 1H8.5a1 1 0 1 1 0-2H11a1 1 0 0 1 1 1Z"
    />
  </svg>
);
const ForwardRef = forwardRef(IconChat);
const Memo = memo(ForwardRef);
export default Memo;
