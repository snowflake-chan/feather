import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconListLeft = (
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
      d="M3.496 19.3c0 .547.443.99.99.99h15.891a.99.99 0 0 0 0-1.98H4.486a.99.99 0 0 0-.99.99ZM10.5 12c0 .547.443.99.99.99h8.887a.99.99 0 0 0 0-1.98H11.49a.99.99 0 0 0-.99.99ZM3.496 4.675c0 .547.443.99.99.99h15.891a.99.99 0 1 0 0-1.98H4.486a.99.99 0 0 0-.99.99Zm.136 7.742a.5.5 0 0 1 0-.834l3.843-2.535a.5.5 0 0 1 .775.417v5.07a.5.5 0 0 1-.775.418l-3.842-2.536Z"
    />
  </svg>
);
const ForwardRef = forwardRef(IconListLeft);
const Memo = memo(ForwardRef);
export default Memo;
