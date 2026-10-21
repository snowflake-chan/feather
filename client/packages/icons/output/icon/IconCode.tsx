import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconCode = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    ref={ref}
    {...props}
  >
    <g fillRule="evenodd" clipRule="evenodd">
      <path d="M6.586 6A1 1 0 1 1 8 7.414l-4.232 4.232a.5.5 0 0 0 0 .708L8 16.586A1 1 0 1 1 6.586 18l-5.293-5.293a1 1 0 0 1 0-1.414L6.586 6ZM17.414 6A1 1 0 1 0 16 7.414l4.232 4.232a.5.5 0 0 1 0 .708L16 16.586A1 1 0 0 0 17.414 18l5.293-5.293a1 1 0 0 0 0-1.414L17.414 6Z" />
    </g>
  </svg>
);
const ForwardRef = forwardRef(IconCode);
const Memo = memo(ForwardRef);
export default Memo;
