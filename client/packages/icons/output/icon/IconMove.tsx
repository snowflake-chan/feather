import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconMove = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    ref={ref}
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M11 9a.5.5 0 0 0 .5.5h1A.5.5 0 0 0 13 9V6.5h1.96a.5.5 0 0 0 .39-.812l-2.96-3.7a.5.5 0 0 0-.78 0l-2.96 3.7a.5.5 0 0 0 .39.812H11V9Zm-2 2a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5H6.5v1.96a.5.5 0 0 1-.812.39l-3.7-2.96a.5.5 0 0 1 0-.78l3.7-2.96a.5.5 0 0 1 .812.39V11H9Zm6 0a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h2.5v1.96a.5.5 0 0 0 .812.39l3.7-2.96a.5.5 0 0 0 0-.78l-3.7-2.96a.5.5 0 0 0-.812.39V11H15Zm-3.5 3.5a.5.5 0 0 0-.5.5v2.5H9.04a.5.5 0 0 0-.39.812l2.96 3.7c.2.25.58.25.78 0l2.96-3.7a.5.5 0 0 0-.39-.812H13V15a.5.5 0 0 0-.5-.5h-1Z"
    />
  </svg>
);
const ForwardRef = forwardRef(IconMove);
const Memo = memo(ForwardRef);
export default Memo;
