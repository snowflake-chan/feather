import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconDropUp2 = (
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
      d="M7 5h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2ZM3 7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7Zm9.312 2.39a.4.4 0 0 0-.624 0L8.52 13.35a.4.4 0 0 0 .312.65h6.336a.4.4 0 0 0 .312-.65l-3.168-3.96Z"
    />
  </svg>
);
const ForwardRef = forwardRef(IconDropUp2);
const Memo = memo(ForwardRef);
export default Memo;
