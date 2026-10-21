import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconKeyboard = (
  props: SVGProps<SVGSVGElement>,
  ref: Ref<SVGSVGElement>,
) => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    ref={ref}
    {...props}
  >
    <path d="M2.655 21.325a1.906 1.906 0 0 1-1.396-.584 1.906 1.906 0 0 1-.584-1.396V5.655c0-.541.195-1.007.584-1.396.39-.39.855-.584 1.396-.584h18.69c.541 0 1.007.195 1.396.584.39.39.584.855.584 1.396v13.69c0 .541-.195 1.007-.584 1.396-.39.39-.855.584-1.396.584H2.655Zm0-1.98h18.69V5.655H2.655v13.69Zm5.645-1.81h7.4a.862.862 0 0 0 .885-.885.863.863 0 0 0-.885-.885H8.3a.862.862 0 0 0-.885.885.862.862 0 0 0 .885.885ZM4.465 13.91H6.81v-2.32H4.465v2.32Zm4.25 0h2.345v-2.32H8.715v2.32Zm4.225 0h2.345v-2.32H12.94v2.32Zm4.25 0h2.345v-2.32H17.19v2.32ZM4.465 9.735H6.81V7.44H4.465v2.295Zm4.25 0h2.345V7.44H8.715v2.295Zm4.225 0h2.345V7.44H12.94v2.295Zm4.25 0h2.345V7.44H17.19v2.295Z" />
  </svg>
);
const ForwardRef = forwardRef(IconKeyboard);
const Memo = memo(ForwardRef);
export default Memo;
