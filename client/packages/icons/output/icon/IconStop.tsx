import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconStop = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    ref={ref}
    {...props}
  >
    <path d="M5.556 4C4.696 4 4 4.696 4 5.556v12.888C4 19.304 4.696 20 5.556 20h12.888c.86 0 1.556-.696 1.556-1.556V5.556C20 4.696 19.304 4 18.444 4H5.556Z" />
  </svg>
);
const ForwardRef = forwardRef(IconStop);
const Memo = memo(ForwardRef);
export default Memo;
