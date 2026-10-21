import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconAnalytics = (
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
      d="M18.75 3.75H5.25c-.825 0-1.5.675-1.5 1.5v13.5c0 .825.675 1.5 1.5 1.5h13.5c.825 0 1.5-.675 1.5-1.5V5.25c0-.825-.675-1.5-1.5-1.5Zm0 15H5.25V5.25h13.5v13.5ZM9 12H7.5v4.5H9V12Zm6-4.5h1.5v9H15v-9Zm-2.25 6h-1.5v3h1.5v-3Zm-1.5-3h1.5V12h-1.5v-1.5Z"
    />
  </svg>
);
const ForwardRef = forwardRef(IconAnalytics);
const Memo = memo(ForwardRef);
export default Memo;
