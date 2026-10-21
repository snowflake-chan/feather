import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconSetup = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    ref={ref}
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 7a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm3 1.508 2.69 4.44a1 1 0 0 1-.4 1.35.93.93 0 0 1-.48.12 1 1 0 0 1-.88-.52L14.24 11v2.238l1.42 6.38a1.09 1.09 0 0 1-.77 1.31 1.001 1.001 0 0 1-1.24-.82l-1.24-5.66h-1l-1.26 5.66a1 1 0 0 1-1.24.82 1.09 1.09 0 0 1-.77-1.31l1.42-6.38V11l-1.68 2.898a1 1 0 0 1-.88.52.93.93 0 0 1-.48-.12 1 1 0 0 1-.4-1.35L9 8.508a1 1 0 0 1 1-.5h4a1 1 0 0 1 1 .5Z"
    />
  </svg>
);
const ForwardRef = forwardRef(IconSetup);
const Memo = memo(ForwardRef);
export default Memo;
