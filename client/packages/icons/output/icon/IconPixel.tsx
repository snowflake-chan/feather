import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconPixel = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    ref={ref}
    {...props}
  >
    <g>
      <path d="M2 18V6h4.461c.96 0 1.781.171 2.463.514a3.693 3.693 0 0 1 1.595 1.475c.372.64.558 1.4.558 2.28 0 .88-.186 1.64-.558 2.28a3.693 3.693 0 0 1-1.595 1.474c-.682.343-1.503.514-2.463.514H4.014V18H2Zm2.014-5.349h2.354c.888 0 1.554-.205 1.998-.617.455-.423.682-1.011.682-1.765 0-.766-.227-1.355-.682-1.766-.444-.412-1.11-.617-1.998-.617H4.014v4.765ZM11.53 18l4.02-6.126L11.747 6h2.277l2.775 4.262L19.538 6h2.183l-3.793 5.793L22 18h-2.323l-2.948-4.567L13.822 18h-2.293Z" />
    </g>
  </svg>
);
const ForwardRef = forwardRef(IconPixel);
const Memo = memo(ForwardRef);
export default Memo;
