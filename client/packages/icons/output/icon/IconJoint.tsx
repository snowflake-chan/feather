import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconJoint = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    ref={ref}
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M22 7a5 5 0 0 1-7.885 4.084l1.443 4.744L2 22 8.172 8.442l4.744 1.443A5 5 0 1 1 22 7Zm-2 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm-7.168 7.597-6.294 2.865 2.865-6.294 2.629.8.8 2.629Z"
    />
  </svg>
);
const ForwardRef = forwardRef(IconJoint);
const Memo = memo(ForwardRef);
export default Memo;
