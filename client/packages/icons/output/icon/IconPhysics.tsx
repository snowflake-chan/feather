import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconPhysics = (
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
      d="M12 19.5c-4.136 0-7.5-3.364-7.5-7.5v-.833h5V12c0 1.378 1.122 2.5 2.5 2.5s2.5-1.122 2.5-2.5v-.833h5V12c0 4.136-3.364 7.5-7.5 7.5Zm2.5-10h5v-5h-5v5Zm5-6.667h-5c-.92 0-1.667.748-1.667 1.667V12a.834.834 0 0 1-1.666 0V4.5c0-.92-.748-1.667-1.667-1.667h-5c-.92 0-1.667.748-1.667 1.667V12c0 5.054 4.113 9.167 9.167 9.167 5.054 0 9.167-4.113 9.167-9.167V4.5c0-.92-.748-1.667-1.667-1.667Z"
    />
  </svg>
);
const ForwardRef = forwardRef(IconPhysics);
const Memo = memo(ForwardRef);
export default Memo;
