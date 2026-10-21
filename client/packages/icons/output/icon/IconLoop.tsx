import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconLoop = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    ref={ref}
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8.571 4.5a6.571 6.571 0 0 0-5.138 10.668.857.857 0 0 0 1.34-1.07 4.857 4.857 0 0 1 3.799-7.884h6.857a4.857 4.857 0 0 1 0 9.715H12v-1.667a.5.5 0 0 0-.766-.423l-4.242 2.666a.5.5 0 0 0 .018.858l4.242 2.424a.5.5 0 0 0 .748-.434v-1.71h3.429a6.571 6.571 0 0 0 0-13.143H8.57Z"
    />
  </svg>
);
const ForwardRef = forwardRef(IconLoop);
const Memo = memo(ForwardRef);
export default Memo;
