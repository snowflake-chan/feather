import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconRetry = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    ref={ref}
    {...props}
  >
    <path d="M15.485 5.396a.5.5 0 0 0 0-.792l-3.18-2.448a.5.5 0 0 0-.805.396v1.463A8 8 0 1 0 20 12a1 1 0 0 0-2 0 6 6 0 1 1-6.5-5.98v1.428a.5.5 0 0 0 .805.396l3.18-2.448Z" />
  </svg>
);
const ForwardRef = forwardRef(IconRetry);
const Memo = memo(ForwardRef);
export default Memo;
