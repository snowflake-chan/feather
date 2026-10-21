import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconTitle = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    ref={ref}
    {...props}
  >
    <path d="M11.997 20.325c-.415 0-.766-.145-1.055-.435a1.44 1.44 0 0 1-.432-1.055V6.655H6.25c-.414 0-.766-.145-1.056-.435a1.441 1.441 0 0 1-.434-1.058c0-.415.145-.766.434-1.054a1.44 1.44 0 0 1 1.056-.433h11.5c.414 0 .766.145 1.056.435.29.29.434.643.434 1.058 0 .415-.145.766-.434 1.055a1.44 1.44 0 0 1-1.056.432h-4.26v12.18c0 .414-.145.766-.435 1.055-.29.29-.643.435-1.058.435Z" />
  </svg>
);
const ForwardRef = forwardRef(IconTitle);
const Memo = memo(ForwardRef);
export default Memo;
