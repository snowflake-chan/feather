import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconCopyComponent = (
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
      <path d="M8 6H6a2 2 0 0 0-2 2v9a3 3 0 0 0 3 3h9a2 2 0 0 0 2-2v-2h-7a3 3 0 0 1-3-3V6Z" />
      <path d="M15.889 3.161a.55.55 0 0 0-.778 0l-1.677 1.677a.55.55 0 0 0 0 .778L15.5 7.682l2.066-2.066a.55.55 0 0 0 0-.778l-1.677-1.677Zm-3.273 3.273a.55.55 0 0 0-.778 0l-1.677 1.677a.55.55 0 0 0 0 .778l1.677 1.677a.55.55 0 0 0 .778 0L14.682 8.5l-2.066-2.066Zm5.768 0a.55.55 0 0 1 .778 0l1.677 1.677a.55.55 0 0 1 0 .778l-1.677 1.677a.55.55 0 0 1-.778 0L16.318 8.5l2.066-2.066Zm-.818 4.95L15.5 9.318l-2.066 2.066a.55.55 0 0 0 0 .778l1.677 1.677a.55.55 0 0 0 .778 0l1.677-1.677a.55.55 0 0 0 0-.778Z" />
    </g>
  </svg>
);
const ForwardRef = forwardRef(IconCopyComponent);
const Memo = memo(ForwardRef);
export default Memo;
