import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconDesktop = (
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
      d="M2 5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-4v3h2a1 1 0 1 1 0 2H6a1 1 0 1 1 0-2h2v-3H4a2 2 0 0 1-2-2V5Zm2 0h16v10H4V5Zm10 15v-3h-4v3h4Z"
    />
  </svg>
);
const ForwardRef = forwardRef(IconDesktop);
const Memo = memo(ForwardRef);
export default Memo;
