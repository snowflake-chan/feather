import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconHorizontal = (
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
      d="m13.735 5.278 5.99 6.05a.957.957 0 0 1 0 1.344l-5.99 6.05a.935.935 0 0 1-1.331 0 .957.957 0 0 1 0-1.345l4.383-4.426H4v-1.902h12.787l-4.383-4.426a.957.957 0 0 1 0-1.345.935.935 0 0 1 1.33 0Z"
    />
  </svg>
);
const ForwardRef = forwardRef(IconHorizontal);
const Memo = memo(ForwardRef);
export default Memo;
