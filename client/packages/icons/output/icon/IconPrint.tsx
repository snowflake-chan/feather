import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconPrint = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    ref={ref}
    {...props}
  >
    <path d="M18.714 10.488a1.173 1.173 0 0 1 0-2.345 1.173 1.173 0 0 1 0 2.345Zm-1.198 9.404c0 .43-.347.777-.777.777h-9.48a.776.776 0 0 1-.777-.777v-7.815h11.034v7.815ZM6.477 4.095c0-.43.348-.777.777-.777h9.628a.6.6 0 0 1 .6.6V6.5H6.477V4.095Zm13.941 2.403H19.11V3.273a1.5 1.5 0 0 0-1.5-1.5H6.726a1.822 1.822 0 0 0-1.821 1.821v2.904H3.58A1.822 1.822 0 0 0 1.76 8.319v5.853c0 1.006.816 1.822 1.821 1.822h1.324v4.437c0 1.006.816 1.822 1.821 1.822h10.561a1.822 1.822 0 0 0 1.822-1.822v-4.435h1.31a1.822 1.822 0 0 0 1.821-1.821V8.319a1.822 1.822 0 0 0-1.822-1.821ZM8.056 17.194h5.527v1.577H8.056v-1.577Zm0-3.194h7.88v1.577h-7.88V14Z" />
  </svg>
);
const ForwardRef = forwardRef(IconPrint);
const Memo = memo(ForwardRef);
export default Memo;
