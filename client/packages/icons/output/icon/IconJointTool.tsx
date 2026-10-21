import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconJointTool = (
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
      d="M18.5 9a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm-16 11.865a.5.5 0 0 0 .647.664l11.68-4.796a1 1 0 0 0 .617-.844l.519-6.393a1 1 0 0 0-1.043-1.08l-6.464.301a1 1 0 0 0-.87.596L2.5 20.865Z"
    />
  </svg>
);
const ForwardRef = forwardRef(IconJointTool);
const Memo = memo(ForwardRef);
export default Memo;
