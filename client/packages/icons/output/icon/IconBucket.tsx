import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconBucket = (
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
      d="M11 1.6a1 1 0 0 0-1 1v.439a1.68 1.68 0 0 0-.258.211l-8.125 8.125a1.671 1.671 0 0 0 0 2.364l6.94 6.94a1.67 1.67 0 0 0 2.364 0l8.125-8.125a1.671 1.671 0 0 0 0-2.363l-6.94-6.94A1.716 1.716 0 0 0 12 3.153V2.6a1 1 0 0 0-1-1Zm-1 3.418V6.6a1 1 0 0 0 2 0V5.17l6.033 6.034a.239.239 0 0 1 0 .337l-.742.742H2.735L10 5.018Zm9.889 10.947a.694.694 0 0 1 1.222 0l1.592 2.975c.887 1.658-.318 3.66-2.203 3.66-1.885 0-3.09-2.002-2.203-3.66l1.592-2.975Z"
    />
  </svg>
);
const ForwardRef = forwardRef(IconBucket);
const Memo = memo(ForwardRef);
export default Memo;
