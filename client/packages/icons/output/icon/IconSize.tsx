import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconSize = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    ref={ref}
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M20.7 3.285a1 1 0 0 0-.97-.248l-3.852 1.08a1 1 0 0 0-.429 1.679l.68.662-9.619 9.619-.81-.792a1.002 1.002 0 0 0-1.668.468l-.99 3.876a1 1 0 0 0 1.238 1.21l3.852-1.081a1 1 0 0 0 .428-1.68l-.62-.604 9.618-9.618.752.735a1 1 0 0 0 1.668-.468l.991-3.875a1.003 1.003 0 0 0-.27-.963Z"
    />
  </svg>
);
const ForwardRef = forwardRef(IconSize);
const Memo = memo(ForwardRef);
export default Memo;
