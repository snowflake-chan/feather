import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconBrush = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    ref={ref}
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="m16.307 17.529 5.586-5.586a1 1 0 0 0 0-1.415l-.936-.935-2.25 2.25-1.414-1.415 2.25-2.25-1.586-1.585-2.25 2.25-1.414-1.415 2.25-2.25-3.286-3.285a1 1 0 0 0-1.414 0L6.258 7.479l10.05 10.05ZM4.843 8.893l-1.636 1.636a1 1 0 0 0 0 1.414l2.883 2.882-3.6 3.6a1 1 0 0 0 0 1.414l1.457 1.457a1 1 0 0 0 1.414 0l3.6-3.6 2.882 2.882a1 1 0 0 0 1.414 0l1.636-1.635-10.05-10.05Z"
    />
  </svg>
);
const ForwardRef = forwardRef(IconBrush);
const Memo = memo(ForwardRef);
export default Memo;
