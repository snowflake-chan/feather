import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconBackgroundModel = (
  props: SVGProps<SVGSVGElement>,
  ref: Ref<SVGSVGElement>,
) => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    ref={ref}
    {...props}
  >
    <g>
      <path d="M5 21a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5Z" />
      <rect x={7.5} y={3} width={1.5} height={1.5} rx={0.75} />
      <rect x={11.5} y={3} width={1.5} height={1.5} rx={0.75} />
      <rect x={15.5} y={3} width={1.5} height={1.5} rx={0.75} />
      <rect x={19.5} y={3} width={1.5} height={1.5} rx={0.75} />
      <rect x={7.5} y={7} width={1.5} height={1.5} rx={0.75} />
      <rect x={11.5} y={7} width={1.5} height={1.5} rx={0.75} />
      <rect x={15.5} y={7} width={1.5} height={1.5} rx={0.75} />
      <rect x={15.5} y={11} width={1.5} height={1.5} rx={0.75} />
      <rect x={15.5} y={15} width={1.5} height={1.5} rx={0.75} />
      <rect x={19.5} y={7} width={1.5} height={1.5} rx={0.75} />
      <rect x={19.5} y={11} width={1.5} height={1.5} rx={0.75} />
      <rect x={19.5} y={15} width={1.5} height={1.5} rx={0.75} />
    </g>
  </svg>
);
const ForwardRef = forwardRef(IconBackgroundModel);
const Memo = memo(ForwardRef);
export default Memo;
