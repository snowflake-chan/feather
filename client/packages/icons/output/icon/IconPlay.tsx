import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconPlay = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    ref={ref}
    {...props}
  >
    <path d="M8.048 4.26C6.685 3.51 5 4.473 5 6.002v11.996c0 1.529 1.685 2.492 3.048 1.742l10.91-5.997a1.977 1.977 0 0 0 0-3.485L8.048 4.26Z" />
  </svg>
);
const ForwardRef = forwardRef(IconPlay);
const Memo = memo(ForwardRef);
export default Memo;
