import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconPositionZ = (
  props: SVGProps<SVGSVGElement>,
  ref: Ref<SVGSVGElement>,
) => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    ref={ref}
    {...props}
  >
    <path d="M6.015 19v-1.757l7.812-9.803H6V5h11.985v1.757l-7.82 9.803H18V19H6.015Z" />
  </svg>
);
const ForwardRef = forwardRef(IconPositionZ);
const Memo = memo(ForwardRef);
export default Memo;
