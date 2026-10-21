import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconLayoutAlignBottomCenter = (
  props: SVGProps<SVGSVGElement>,
  ref: Ref<SVGSVGElement>,
) => (
  <svg
    viewBox="0 0 32 32"
    xmlns="http://www.w3.org/2000/svg"
    ref={ref}
    {...props}
  >
    <g>
      <rect x={10} y={6} width={12} height={4} rx={1} />
      <rect x={10} y={14} width={12} height={4} rx={1} />
      <rect x={6} y={22} width={20} height={4} rx={1} />
    </g>
  </svg>
);
const ForwardRef = forwardRef(IconLayoutAlignBottomCenter);
const Memo = memo(ForwardRef);
export default Memo;
