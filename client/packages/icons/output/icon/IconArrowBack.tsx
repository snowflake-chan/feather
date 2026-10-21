import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconArrowBack = (
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
      d="m9.657 19.071-6.364-6.364a1 1 0 0 1 0-1.414l6.364-6.364a1 1 0 0 1 1.414 1.414L6.414 11H20a1 1 0 1 1 0 2H6.414l4.657 4.657a1 1 0 0 1-1.414 1.414Z"
    />
  </svg>
);
const ForwardRef = forwardRef(IconArrowBack);
const Memo = memo(ForwardRef);
export default Memo;
