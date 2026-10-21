import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconSizeH = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    ref={ref}
    {...props}
  >
    <path d="M17 5h-2v5.833H9V5H7v14h2v-5.833h6V19h2V5Z" />
  </svg>
);
const ForwardRef = forwardRef(IconSizeH);
const Memo = memo(ForwardRef);
export default Memo;
