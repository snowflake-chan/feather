import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconTerrain = (
  props: SVGProps<SVGSVGElement>,
  ref: Ref<SVGSVGElement>,
) => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    ref={ref}
    {...props}
  >
    <path d="M11.066 18.31v-3.367l-6.439-3.721v3.366l6.44 3.722Zm1.882 0 6.425-3.722v-3.391l-6.425 3.742v3.37ZM12 13.338l6.34-3.691L12 5.98 5.65 9.647 12 13.338Zm-8.363 2.98a1.923 1.923 0 0 1-.737-.743 2.006 2.006 0 0 1-.253-.981v-4.36c0-.347.084-.674.253-.981.17-.307.415-.555.737-.742l7.373-4.254A2.05 2.05 0 0 1 12.004 4c.349 0 .678.086.986.257l7.373 4.254a1.976 1.976 0 0 1 1.004 1.724v4.359a1.976 1.976 0 0 1-1.004 1.724l-7.373 4.24c-.314.18-.645.27-.994.27s-.678-.09-.986-.27l-7.373-4.24Z" />
  </svg>
);
const ForwardRef = forwardRef(IconTerrain);
const Memo = memo(ForwardRef);
export default Memo;
