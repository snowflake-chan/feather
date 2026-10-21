import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconCamera = (
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
      <path d="M12 8.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9ZM9.5 13a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0Z" />
      <path d="M8.655 3a1.25 1.25 0 0 0-1.119.691L6.882 5H3.5A1.5 1.5 0 0 0 2 6.5v13A1.5 1.5 0 0 0 3.5 21h17a1.5 1.5 0 0 0 1.5-1.5v-13A1.5 1.5 0 0 0 20.5 5h-3.382l-.654-1.309A1.25 1.25 0 0 0 15.345 3H8.654ZM4 19V7h16v12H4Z" />
    </g>
  </svg>
);
const ForwardRef = forwardRef(IconCamera);
const Memo = memo(ForwardRef);
export default Memo;
