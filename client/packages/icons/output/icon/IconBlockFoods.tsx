import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconBlockFoods = (
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
      d="M17.894 1.553a1 1 0 0 1-.447 1.341l-1.556.778L15.642 5H20a1 1 0 1 1 0 2h-1.064l-.814 12.2A3 3 0 0 1 15.13 22H8.87a3 3 0 0 1-2.993-2.8L5.064 7H4a1 1 0 0 1 0-2h9.608l.318-1.696a2 2 0 0 1 1.07-1.42l1.557-.778a1 1 0 0 1 1.341.447ZM12.741 9.62 13.233 7H7.069l.175 2.628.81.54a1.704 1.704 0 0 0 1.891 0 3.704 3.704 0 0 1 2.796-.547Zm.19 2.202a3.704 3.704 0 0 0 3.66.272l-.464 6.972a1 1 0 0 1-.998.933H8.87a1 1 0 0 1-.998-.933l-.464-6.972a3.705 3.705 0 0 0 3.646-.263 1.704 1.704 0 0 1 1.877-.009Zm3.825-2.195-.81.54a1.704 1.704 0 0 1-1.319.245L15.268 7h1.664l-.175 2.628ZM15 17a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm-5-1a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
    />
  </svg>
);
const ForwardRef = forwardRef(IconBlockFoods);
const Memo = memo(ForwardRef);
export default Memo;
