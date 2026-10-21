import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconSizeW = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    ref={ref}
    {...props}
  >
    <path d="M7.274 18 4 7h2.402l2.258 7.732L11.02 7h2.145l2.287 7.79L17.784 7H20l-3.274 11h-2.488l-2.207-7.453L9.762 18H7.274Z" />
  </svg>
);
const ForwardRef = forwardRef(IconSizeW);
const Memo = memo(ForwardRef);
export default Memo;
