import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconOpacity = (
  props: SVGProps<SVGSVGElement>,
  ref: Ref<SVGSVGElement>,
) => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    ref={ref}
    {...props}
  >
    <g>
      <path d="M5.5 2.5h-3v3h3v-3ZM9.5 6.5h-3v3h3v-3ZM13.5 2.5h-3v3h3v-3ZM21.5 2.5h-3v3h3v-3ZM5.5 10.5h-3v3h3v-3ZM13.5 10.5h-3v3h3v-3ZM21.5 10.5h-3v3h3v-3ZM5.5 18.5h-3v3h3v-3ZM13.5 18.5h-3v3h3v-3ZM21.5 18.5h-3v3h3v-3ZM17.5 6.5h-3v3h3v-3ZM9.5 14.5h-3v3h3v-3ZM17.5 14.5h-3v3h3v-3Z" />
    </g>
  </svg>
);
const ForwardRef = forwardRef(IconOpacity);
const Memo = memo(ForwardRef);
export default Memo;
