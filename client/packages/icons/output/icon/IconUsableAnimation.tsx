import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconUsableAnimation = (
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
      d="M20 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm2 0a6 6 0 1 1-12 0 6 6 0 0 1 12 0ZM11.332 6.037a6 6 0 0 0 0 11.926A6.996 6.996 0 0 1 8 12a6.996 6.996 0 0 1 3.332-5.963ZM6.502 17.81A7.977 7.977 0 0 1 4 12c0-2.289.961-4.353 2.502-5.812a6.003 6.003 0 0 0 0 11.623Z"
    />
  </svg>
);
const ForwardRef = forwardRef(IconUsableAnimation);
const Memo = memo(ForwardRef);
export default Memo;
