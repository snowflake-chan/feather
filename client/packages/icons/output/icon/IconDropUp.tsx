import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconDropUp = (
  props: SVGProps<SVGSVGElement>,
  ref: Ref<SVGSVGElement>,
) => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    ref={ref}
    {...props}
  >
    <path d="M17.674 11.156a1 1 0 0 1 0 1.688l-8.137 5.178A1 1 0 0 1 8 17.178V6.822a1 1 0 0 1 1.537-.844l8.137 5.178Z" />
  </svg>
);
const ForwardRef = forwardRef(IconDropUp);
const Memo = memo(ForwardRef);
export default Memo;
