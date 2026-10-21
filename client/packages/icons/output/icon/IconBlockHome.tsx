import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconBlockHome = (
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
      d="M21 21a1 1 0 0 1-1 1h-4v-9a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v9H4a1 1 0 0 1-1-1V10c0-.301.134-.583.359-.768l8-6.416.007-.005a1.012 1.012 0 0 1 1.275.005l7.992 6.41A.998.998 0 0 1 21 10v11Zm-11 1h4v-8h-4v8ZM21.893 7.672l-7.994-6.41a3.015 3.015 0 0 0-3.795-.003L2.1 7.679C1.4 8.251 1 9.097 1 10v11c0 1.654 1.346 3 3 3h16c1.654 0 3-1.346 3-3V10c0-.903-.4-1.749-1.107-2.328Z"
    />
  </svg>
);
const ForwardRef = forwardRef(IconBlockHome);
const Memo = memo(ForwardRef);
export default Memo;
