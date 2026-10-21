import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconLoop1 = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    ref={ref}
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M17.695 3.796a3.458 3.458 0 1 0 0 6.916 3.458 3.458 0 0 0 0-6.916Zm-5.054 3.458c0-.09.002-.178.007-.266h-4.53a4.522 4.522 0 0 0-3.537 7.34.798.798 0 1 1-1.247.996 6.119 6.119 0 0 1 4.785-9.933h4.876a5.056 5.056 0 0 1 9.755 1.863c0 1.702-.84 3.207-2.13 4.123l.002.133c0 3.38-2.74 6.119-6.119 6.119h-3.192v1.533a.5.5 0 0 1-.748.434l-3.849-2.2a.5.5 0 0 1-.018-.857l3.849-2.419a.5.5 0 0 1 .766.423v1.49h3.192a4.523 4.523 0 0 0 4.479-3.89 5.054 5.054 0 0 1-6.34-4.89Zm5.054-2.128a.798.798 0 0 0-.798.798v2.66a.798.798 0 0 0 1.597 0v-2.66a.798.798 0 0 0-.799-.798Z"
    />
  </svg>
);
const ForwardRef = forwardRef(IconLoop1);
const Memo = memo(ForwardRef);
export default Memo;
