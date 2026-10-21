import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconBlockFont = (
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
      d="m7 7.539-2.34 5.46H9.34l-2.34-5.46ZM7 4c.4 0 .762.238.92.606l6 14a1 1 0 0 1-1.839.788L10.198 15H3.802L1.92 19.394a1 1 0 1 1-1.838-.788l6-14A.998.998 0 0 1 7.001 4Zm9 11.858c0 .693.26 1.856 2 1.856 1.268 0 3.055-.535 4-.851V14h-4c-1.252 0-2 .694-2 1.858Zm-1.838-6.203C15.227 8.018 17.19 7 19.287 7 21.244 7 24 8.2 24 10.873V19a.999.999 0 1 1-2 0v-.037c-1.117.342-2.717.75-4 .75-2.393 0-4-1.55-4-3.855C14 13.586 15.645 12 18 12h4v-1.127C22 9.472 20.137 9 19.287 9c-1.427 0-2.749.669-3.449 1.745a.999.999 0 1 1-1.676-1.09Z"
    />
  </svg>
);
const ForwardRef = forwardRef(IconBlockFont);
const Memo = memo(ForwardRef);
export default Memo;
