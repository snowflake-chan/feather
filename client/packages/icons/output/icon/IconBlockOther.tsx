import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconBlockOther = (
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
      <path d="M4 16v4h4v-4H4Zm-1-2a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1H3ZM16 4v4h4V4h-4Zm-1-2a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1h-6ZM4 4v4h4V4H4ZM3 2a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H3ZM16 18a2 2 0 1 0 4 0 2 2 0 0 0-4 0Zm2-4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />
    </g>
  </svg>
);
const ForwardRef = forwardRef(IconBlockOther);
const Memo = memo(ForwardRef);
export default Memo;
