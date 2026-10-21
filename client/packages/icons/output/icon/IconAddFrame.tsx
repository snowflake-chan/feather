import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconAddFrame = (
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
      d="m3.206 10.586 7.38-7.38a2 2 0 0 1 2.828 0l7.38 7.38a2 2 0 0 1 0 2.828l-7.38 7.38a2 2 0 0 1-2.828 0l-7.38-7.38a2 2 0 0 1 0-2.828ZM7.626 12a.73.73 0 0 1 .728-.73h2.917V8.355a.73.73 0 1 1 1.458 0v2.917h2.917a.73.73 0 1 1 0 1.458h-2.917v2.917a.73.73 0 0 1-1.458 0v-2.917H8.354A.73.73 0 0 1 7.625 12Z"
    />
  </svg>
);
const ForwardRef = forwardRef(IconAddFrame);
const Memo = memo(ForwardRef);
export default Memo;
