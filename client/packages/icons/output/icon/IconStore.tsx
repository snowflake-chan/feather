import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconStore = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    ref={ref}
    {...props}
  >
    <path d="M5 20.48a1 1 0 0 1-1-1V11h-.897a.5.5 0 0 1-.5-.5V9.05l.982-4.274A1 1 0 0 1 4.559 4h14.907a1 1 0 0 1 .974.776l.982 4.274v1.45a.5.5 0 0 1-.5.5H20v8.48a1 1 0 1 1-2 0V11h-4.085v8.48a1 1 0 0 1-1 1H5Zm.988-1.98h5.947V11H5.988v7.5ZM4.587 9.05h14.851l-.69-3.07H5.278l-.691 3.07Z" />
  </svg>
);
const ForwardRef = forwardRef(IconStore);
const Memo = memo(ForwardRef);
export default Memo;
