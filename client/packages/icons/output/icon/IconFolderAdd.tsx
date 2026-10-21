import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconFolderAdd = (
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
      d="M2 4.5C2 3.618 2.74 3 3.53 3h6.767c.485 0 .96.228 1.254.642L12.516 5h7.425C21.024 5 22 5.842 22 7v10.5c0 .505-.196 1.062-.463 1.488-.236.378-.762 1.012-1.596 1.012H4.06C2.976 20 2 19.158 2 18V4.5ZM4 7v10.983c.01.007.028.017.059.017H19.79a1.22 1.22 0 0 0 .203-.453A.323.323 0 0 0 20 17.5V7.017A.094.094 0 0 0 19.941 7H4Zm7 4.5V9h2v2.5h2.5v2H13V16h-2v-2.5H8.5v-2H11Z"
    />
  </svg>
);
const ForwardRef = forwardRef(IconFolderAdd);
const Memo = memo(ForwardRef);
export default Memo;
