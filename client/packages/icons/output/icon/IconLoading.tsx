import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconLoading = (
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
      d="M12 4a8 8 0 1 0 8 8h2c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2v2Z"
    />
  </svg>
);
const ForwardRef = forwardRef(IconLoading);
const Memo = memo(ForwardRef);
export default Memo;
