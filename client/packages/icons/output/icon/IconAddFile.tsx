import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconAddFile = (
  props: SVGProps<SVGSVGElement>,
  ref: Ref<SVGSVGElement>,
) => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    ref={ref}
    {...props}
  >
    <path d="M19.5 20a.5.5 0 0 1-.5.5h-5.732A6.518 6.518 0 0 1 12.19 22H19a2 2 0 0 0 2-2V9.828a2 2 0 0 0-.586-1.414l-5.829-5.828a.491.491 0 0 0-.049-.04.63.63 0 0 1-.036-.03 2.072 2.072 0 0 0-.219-.18.652.652 0 0 0-.08-.044l-.048-.024-.05-.029c-.054-.031-.109-.063-.166-.087a1.977 1.977 0 0 0-.624-.138c-.02-.001-.04-.004-.059-.007A.605.605 0 0 0 13.172 2H7a2 2 0 0 0-2 2v7.498a6.451 6.451 0 0 1 1.5-.422V4a.5.5 0 0 1 .5-.5h6V8a2 2 0 0 0 2 2h4.5v10Zm-5-15.379L18.378 8.5H15a.5.5 0 0 1-.5-.5V4.621ZM13 17.5a5.5 5.5 0 1 0-11 0 5.5 5.5 0 0 0 11 0ZM8 18l.001 2.503a.5.5 0 1 1-1 0V18H4.496a.5.5 0 0 1 0-1H7v-2.5a.5.5 0 1 1 1 0V17h2.497a.5.5 0 0 1 0 1H8Z" />
  </svg>
);
const ForwardRef = forwardRef(IconAddFile);
const Memo = memo(ForwardRef);
export default Memo;
