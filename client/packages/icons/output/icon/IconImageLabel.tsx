import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconImageLabel = (
  props: SVGProps<SVGSVGElement>,
  ref: Ref<SVGSVGElement>,
) => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    ref={ref}
    {...props}
  >
    <path d="M4.627 21.353a1.905 1.905 0 0 1-1.396-.584 1.905 1.905 0 0 1-.584-1.396v-6.468h1.98v6.468h6.468v1.98H4.627Zm8.279 0v-1.98h6.467v-6.468h1.994v6.468c0 .542-.196 1.007-.588 1.396-.392.39-.86.584-1.406.584h-6.468ZM5.74 17.3l3.134-4.14 2.325 3.176 3.3-4.275 3.859 5.239H5.74Zm-3.094-6.206V4.628c0-.546.194-1.014.584-1.406.389-.392.854-.588 1.396-.588h6.468v1.994H4.627v6.468h-1.98Zm16.726 0V4.628h-6.468V2.633h6.468a1.92 1.92 0 0 1 1.406.588c.392.392.588.86.588 1.406v6.468h-1.994ZM15.6 9.75c-.39 0-.713-.128-.967-.383-.255-.255-.383-.577-.383-.967s.127-.713.383-.968c.255-.255.577-.382.967-.382s.713.127.967.382c.256.255.383.578.383.968s-.127.712-.383.967c-.255.255-.577.383-.967.383Z" />
  </svg>
);
const ForwardRef = forwardRef(IconImageLabel);
const Memo = memo(ForwardRef);
export default Memo;
