import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconListRight = (
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
      d="M21.28 19.3a.99.99 0 0 1-.99.99H4.397a.99.99 0 0 1 0-1.98H20.29a.99.99 0 0 1 .99.99ZM14.275 12a.99.99 0 0 1-.99.99H4.398a.99.99 0 0 1 0-1.98h8.887a.99.99 0 0 1 .99.99Zm7.005-7.325a.99.99 0 0 1-.99.99H4.397a.99.99 0 0 1 0-1.98H20.29a.99.99 0 0 1 .99.99Zm-.137 7.742a.5.5 0 0 0 0-.834L17.3 9.048a.5.5 0 0 0-.776.417v5.07a.5.5 0 0 0 .776.418l3.842-2.536Z"
    />
  </svg>
);
const ForwardRef = forwardRef(IconListRight);
const Memo = memo(ForwardRef);
export default Memo;
