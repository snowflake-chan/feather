import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconGrid = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    ref={ref}
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M4 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H4Zm12 2h4v4h-4V4Zm-2 0h-4v4h4V4ZM8 4H4v4h4V4Zm-4 6v4h4v-4H4Zm0 6v4h4v-4H4Zm6 4h4v-4h-4v4Zm6 0h4v-4h-4v4Zm4-6v-4h-4v4h4Zm-6-4v4h-4v-4h4Z"
    />
  </svg>
);
const ForwardRef = forwardRef(IconGrid);
const Memo = memo(ForwardRef);
export default Memo;
