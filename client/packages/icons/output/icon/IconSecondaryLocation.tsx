import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconSecondaryLocation = (
  props: SVGProps<SVGSVGElement>,
  ref: Ref<SVGSVGElement>,
) => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    ref={ref}
    {...props}
  >
    <g>
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13 2h-2v2.062A8.004 8.004 0 0 0 4.062 11H2v2h2.062A8.004 8.004 0 0 0 11 19.938V22h2v-2.062A8.004 8.004 0 0 0 19.938 13H22v-2h-2.062A8.004 8.004 0 0 0 13 4.062V2Zm-1 16a6 6 0 1 1 0-12 6 6 0 0 1 0 12Z"
      />
    </g>
  </svg>
);
const ForwardRef = forwardRef(IconSecondaryLocation);
const Memo = memo(ForwardRef);
export default Memo;
