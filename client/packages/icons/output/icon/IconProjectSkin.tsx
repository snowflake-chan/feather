import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconProjectSkin = (
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
      d="M2 3.5A1.5 1.5 0 0 1 3.5 2h5.887l.294.299c.574.584 1.454 1.23 2.319 1.23s1.745-.646 2.319-1.23L14.613 2H20.5A1.5 1.5 0 0 1 22 3.5v8.78a1.5 1.5 0 0 1-1.5 1.5h-1V20a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 20v-6.22h-1a1.5 1.5 0 0 1-1.5-1.5V3.5ZM4 4v7.78h2.5v7.72h11v-7.72H20V4h-4.566c-.72.656-1.95 1.53-3.434 1.53-1.484 0-2.714-.874-3.434-1.53H4Z"
    />
  </svg>
);
const ForwardRef = forwardRef(IconProjectSkin);
const Memo = memo(ForwardRef);
export default Memo;
