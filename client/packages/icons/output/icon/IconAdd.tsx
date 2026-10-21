import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconAdd = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    ref={ref}
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M2 12c0 5.523 4.477 10 10 10s10-4.477 10-10S17.523 2 12 2 2 6.477 2 12Zm1.818 0A8.181 8.181 0 0 1 12 3.818 8.181 8.181 0 0 1 20.182 12 8.181 8.181 0 0 1 12 20.182 8.181 8.181 0 0 1 3.818 12Zm7.273-3.636v2.727H8.364a.909.909 0 0 0-.91.909l.007.105a.908.908 0 0 0 .903.804h2.727v2.727l.006.107a.908.908 0 0 0 1.812-.107V12.91h2.727c.502 0 .91-.406.91-.909l-.007-.105a.908.908 0 0 0-.903-.804H12.91V8.364l-.006-.106a.909.909 0 0 0-1.812.106Z"
    />
  </svg>
);
const ForwardRef = forwardRef(IconAdd);
const Memo = memo(ForwardRef);
export default Memo;
