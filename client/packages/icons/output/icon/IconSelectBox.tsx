import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconSelectBox = (
  props: SVGProps<SVGSVGElement>,
  ref: Ref<SVGSVGElement>,
) => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    ref={ref}
    {...props}
  >
    <path d="M16.3 2.331a3.75 3.75 0 0 0-2.6 0L9.393 3.923A1.75 1.75 0 0 0 8.25 5.564v2.793a4.75 4.75 0 0 1 2.397.235l4.306 1.592a2.75 2.75 0 0 1 1.797 2.58v5.67c0 .322-.056.634-.16.926l4.017-1.484a1.75 1.75 0 0 0 1.143-1.642V5.564a1.75 1.75 0 0 0-1.143-1.641L16.3 2.33ZM11.77 7.21a.75.75 0 1 1 .49-1.418l2.658.92a.25.25 0 0 0 .163 0l2.65-.92a.75.75 0 1 1 .492 1.418l-2.65.919a1.75 1.75 0 0 1-1.145 0l-2.659-.919ZM7.7 9.53a3.75 3.75 0 0 1 2.6 0l4.307 1.592a1.75 1.75 0 0 1 1.143 1.641v5.67a1.75 1.75 0 0 1-1.143 1.642L10.3 21.666c-.839.31-1.761.31-2.6 0l-4.307-1.591a1.75 1.75 0 0 1-1.143-1.642v-5.67a1.75 1.75 0 0 1 1.143-1.641L7.7 9.53Zm-2.395 4.184a.75.75 0 0 0 .464.954l2.48.857v2.7a.75.75 0 1 0 1.5 0v-2.7l2.474-.857a.75.75 0 0 0-.491-1.417L9 14.198l-2.74-.948a.75.75 0 0 0-.955.464Z" />
  </svg>
);
const ForwardRef = forwardRef(IconSelectBox);
const Memo = memo(ForwardRef);
export default Memo;
