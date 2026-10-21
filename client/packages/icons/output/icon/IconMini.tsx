import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconMini = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    ref={ref}
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M6 21a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H6ZM6 5h12a2 2 0 0 1 2 2v5h-4a3 3 0 0 0-3 3v4H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm9 14h3a2 2 0 0 0 2-2v-3h-4a1 1 0 0 0-1 1v4Z"
    />
  </svg>
);
const ForwardRef = forwardRef(IconMini);
const Memo = memo(ForwardRef);
export default Memo;
