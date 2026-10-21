import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconLocation = (
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
      d="M18.79 6.71 12 4.03 5.415 6.629l6.596 2.756 6.779-2.676ZM4 8.231v8.581l7 2.763v-8.419L4 8.232Zm9 11.344 7-2.763V8.41l-7 2.763v8.404ZM11.275 2.138a1.973 1.973 0 0 1 1.45 0l8 3.157A2.03 2.03 0 0 1 22 7.187v9.626a2.03 2.03 0 0 1-1.275 1.892l-8 3.157a1.973 1.973 0 0 1-1.45 0l-8-3.157A2.03 2.03 0 0 1 2 16.813V7.187a2.03 2.03 0 0 1 1.275-1.892l8-3.157Z"
    />
  </svg>
);
const ForwardRef = forwardRef(IconLocation);
const Memo = memo(ForwardRef);
export default Memo;
