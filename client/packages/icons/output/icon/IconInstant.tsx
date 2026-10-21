import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconInstant = (
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
      d="M5 4h14a1 1 0 0 1 1 1v2.5h-7.724a.5.5 0 0 0-.5.5v7.5H4V5a1 1 0 0 1 1-1ZM4 16.5V19a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V8.5h-7.224V16a.5.5 0 0 1-.5.5H4ZM3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5Z"
    />
  </svg>
);
const ForwardRef = forwardRef(IconInstant);
const Memo = memo(ForwardRef);
export default Memo;
