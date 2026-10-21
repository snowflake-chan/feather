import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconTipsExclamationCircleFill = (
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
      d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-5v7h-2V7h2Zm-2 8v2h2v-2h-2Z"
    />
  </svg>
);
const ForwardRef = forwardRef(IconTipsExclamationCircleFill);
const Memo = memo(ForwardRef);
export default Memo;
