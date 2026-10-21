import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconPositionY = (
  props: SVGProps<SVGSVGElement>,
  ref: Ref<SVGSVGElement>,
) => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    ref={ref}
    {...props}
  >
    <path d="M10.86 19v-5.55L6 5h2.457l3.625 6.324L15.738 5H18l-4.842 8.42V19H10.86Z" />
  </svg>
);
const ForwardRef = forwardRef(IconPositionY);
const Memo = memo(ForwardRef);
export default Memo;
