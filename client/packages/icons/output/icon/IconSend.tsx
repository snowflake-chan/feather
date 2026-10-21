import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconSend = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    ref={ref}
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M2.5 1.882 22.736 12 2.5 22.118v-8.132L5.28 12 2.5 10.015V1.882ZM7.32 13 4.5 15.015v3.867L16.264 13H7.32Zm8.944-2H7.32L4.5 8.986V5.117L16.264 11Z"
    />
  </svg>
);
const ForwardRef = forwardRef(IconSend);
const Memo = memo(ForwardRef);
export default Memo;
