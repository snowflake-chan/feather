import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconCloudFileFill = (
  props: SVGProps<SVGSVGElement>,
  ref: Ref<SVGSVGElement>,
) => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    ref={ref}
    {...props}
  >
    <path d="M1.937 18.144C1.096 17.14.675 15.958.675 14.596a5.63 5.63 0 0 1 1.264-3.616A5.1 5.1 0 0 1 5.2 9.07c.37-1.644 1.193-2.984 2.465-4.018C8.937 4.017 10.4 3.5 12.054 3.5c1.902 0 3.518.684 4.848 2.052 1.33 1.367 2.034 3.015 2.109 4.944v.6c1.228.051 2.254.505 3.078 1.363.824.857 1.236 1.92 1.236 3.187 0 1.252-.445 2.324-1.335 3.214-.123.123-.25.234-.38.333-.852.677-1.976.807-3.11.807H6.027c-1.184 0-2.155-.268-3.036-.886a4.725 4.725 0 0 1-.621-.506 3.836 3.836 0 0 1-.433-.464Z" />
  </svg>
);
const ForwardRef = forwardRef(IconCloudFileFill);
const Memo = memo(ForwardRef);
export default Memo;
