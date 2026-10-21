import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconNew = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    ref={ref}
    {...props}
  >
    <g>
      <path d="M7.556 12a1 1 0 0 1 1-1h2.333V9.111a1.111 1.111 0 1 1 2.222 0V11h2.333a1 1 0 1 1 0 2h-2.333v1.889a1.111 1.111 0 0 1-2.222 0V13H8.556a1 1 0 0 1-1-1Z" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.222 2C2.995 2 2 2.895 2 4v16c0 1.105.995 2 2.222 2h15.556C21.005 22 22 21.105 22 20V4c0-1.105-.995-2-2.222-2H4.222Zm15.556 2H4.222v16h15.556V4Z"
      />
    </g>
  </svg>
);
const ForwardRef = forwardRef(IconNew);
const Memo = memo(ForwardRef);
export default Memo;
