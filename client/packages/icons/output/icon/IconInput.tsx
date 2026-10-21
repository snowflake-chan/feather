import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconInput = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    ref={ref}
    {...props}
  >
    <g>
      <path d="M.675 23.325V17.52H2.65V6.48H.675V.676H6.48V2.65h11.04V.675h5.805v5.806H21.35V17.52h1.975v5.805H17.52V21.35H6.48v1.975H.675ZM6.48 19.37h11.04v-1.85h1.85V6.48h-1.85V4.63H6.48v1.85H4.63v11.04h1.85v1.85ZM2.345 4.825h2.48v-2.48h-2.48v2.48Zm16.83 0h2.48v-2.48h-2.48v2.48Zm0 16.83h2.48v-2.48h-2.48v2.48Zm-16.83 0h2.48v-2.48h-2.48v2.48Z" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14 9h-1v6h1v2h-4v-2h1V9h-1V7h4v2Z"
      />
    </g>
  </svg>
);
const ForwardRef = forwardRef(IconInput);
const Memo = memo(ForwardRef);
export default Memo;
