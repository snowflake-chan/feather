import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconSharing = (
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
      d="M5.75 4.5a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5ZM2.5 5.75a3.25 3.25 0 1 1 6.47.436l6.925 3.324a3.25 3.25 0 1 1 .073 4.553l-7.015 3.649C9.25 19.582 7.818 21.5 5.75 21.5a3.25 3.25 0 1 1 2.282-5.564l7.013-3.646a3.268 3.268 0 0 1-.016-.977L8.105 7.99A3.25 3.25 0 0 1 2.5 5.75Zm15.75 4.75a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5ZM5.75 17a1.25 1.25 0 1 0 0 2.5c.906 0 1.523-1.034 1.11-1.826A1.25 1.25 0 0 0 5.75 17Z"
    />
  </svg>
);
const ForwardRef = forwardRef(IconSharing);
const Memo = memo(ForwardRef);
export default Memo;
