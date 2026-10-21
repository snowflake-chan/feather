import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconLayoutDefault = (
  props: SVGProps<SVGSVGElement>,
  ref: Ref<SVGSVGElement>,
) => (
  <svg
    viewBox="0 0 32 32"
    xmlns="http://www.w3.org/2000/svg"
    ref={ref}
    {...props}
  >
    <circle cx={16} cy={16} r={3} />
  </svg>
);
const ForwardRef = forwardRef(IconLayoutDefault);
const Memo = memo(ForwardRef);
export default Memo;
