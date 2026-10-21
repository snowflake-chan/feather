import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconScreenUiNew = (
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
      d="M2.584 19.416c.39.39.855.584 1.396.584h9.44a7.581 7.581 0 0 1-.42-2.5 7.55 7.55 0 0 1 .853-3.5H3.98V5.995h15.025v4.137A7.34 7.34 0 0 1 21 10.025v-4.03a1.92 1.92 0 0 0-.588-1.407A1.92 1.92 0 0 0 19.005 4H3.98c-.541 0-1.007.196-1.396.588-.39.392-.584.86-.584 1.407V18.02c0 .541.195 1.007.584 1.396ZM19 13h2v3h3v2h-3v3h-2v-3h-3v-2h3v-3Z"
    />
  </svg>
);
const ForwardRef = forwardRef(IconScreenUiNew);
const Memo = memo(ForwardRef);
export default Memo;
