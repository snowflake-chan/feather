import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconRotateLeft = (
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
      d="M4.081 5.839V2.303a1 1 0 0 1 1-1c.306 0 .506.205.835.54l.165.167.865.865a9.003 9.003 0 0 1 13.751 8.479 1 1 0 0 1-1.99-.19A7.003 7.003 0 0 0 8.407 4.337l.502.502c.353.353.707.707.707 1a1 1 0 0 1-.875.992l-.125.008H5.08a1 1 0 0 1-.992-.875l-.008-.125Zm6.89 4.303-4.243 4.243 6.364 6.364 4.242-4.243-6.364-6.364Zm1.414-1.414a2 2 0 0 0-2.829 0l-4.242 4.243a2 2 0 0 0 0 2.828l6.364 6.364a2 2 0 0 0 2.828 0l4.243-4.243a2 2 0 0 0 0-2.828l-6.364-6.364Z"
    />
  </svg>
);
const ForwardRef = forwardRef(IconRotateLeft);
const Memo = memo(ForwardRef);
export default Memo;
