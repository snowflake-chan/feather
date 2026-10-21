import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconBigbox = (
  props: SVGProps<SVGSVGElement>,
  ref: Ref<SVGSVGElement>,
) => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    ref={ref}
    {...props}
  >
    <g fillRule="evenodd" clipRule="evenodd">
      <path d="M2.5 8a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-12a1 1 0 0 1-1-1V8Zm2 1v10h10V9h-10Z" />
      <path d="M7.875 3.22A1 1 0 0 1 8.5 3h12a1 1 0 0 1 .625 1.78l-5 4A1 1 0 0 1 15.5 9h-12a1 1 0 0 1-.625-1.78l5-4ZM8.851 5l-2.5 2h8.798l2.5-2H8.851Z" />
      <path d="M20.933 3.099A1 1 0 0 1 21.5 4v12a1 1 0 0 1-.375.78l-5 4A1 1 0 0 1 14.5 20V8a1 1 0 0 1 .375-.78l5-4a1 1 0 0 1 1.058-.121ZM16.5 8.48v9.438l3-2.4V6.081l-3 2.4Z" />
    </g>
  </svg>
);
const ForwardRef = forwardRef(IconBigbox);
const Memo = memo(ForwardRef);
export default Memo;
