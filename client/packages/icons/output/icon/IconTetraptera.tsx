import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconTetraptera = (
  props: SVGProps<SVGSVGElement>,
  ref: Ref<SVGSVGElement>,
) => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    ref={ref}
    {...props}
  >
    <path d="M10.826 2.647c.253-.863 1.475-.863 1.727 0l1.713 5.856a.9.9 0 0 0 .611.611l5.856 1.712c.863.253.863 1.475 0 1.727l-5.856 1.713a.9.9 0 0 0-.611.611l-1.713 5.856c-.252.863-1.474.863-1.727 0l-1.712-5.856a.9.9 0 0 0-.611-.611l-5.856-1.713c-.863-.252-.863-1.474 0-1.727l5.856-1.712a.9.9 0 0 0 .611-.611l1.712-5.856Z" />
  </svg>
);
const ForwardRef = forwardRef(IconTetraptera);
const Memo = memo(ForwardRef);
export default Memo;
