import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconScale = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    ref={ref}
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M2 3a1 1 0 0 1 1-1h4.793a.5.5 0 0 1 .353.854L6.414 4.586l13 13 1.732-1.732a.5.5 0 0 1 .854.353V21a1 1 0 0 1-1 1h-4.793a.5.5 0 0 1-.354-.854L18 19 5 6 2.854 8.146A.5.5 0 0 1 2 7.793V3Zm1 11a1 1 0 0 1 1 1v5h5a1 1 0 1 1 0 2H4a2 2 0 0 1-2-2v-5a1 1 0 0 1 1-1Zm17-5a1 1 0 1 0 2 0V4a2 2 0 0 0-2-2h-5a1 1 0 1 0 0 2h5v5Z"
    />
  </svg>
);
const ForwardRef = forwardRef(IconScale);
const Memo = memo(ForwardRef);
export default Memo;
