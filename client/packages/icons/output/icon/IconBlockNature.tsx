import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconBlockNature = (
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
      d="M20.869 16.493a.983.983 0 0 1-.872.507H13v-1.586l2.707-2.707a.999.999 0 1 0-1.414-1.414L13 12.586V10a1 1 0 1 0-2 0v4.586l-1.293-1.293a.999.999 0 1 0-1.414 1.414L10.586 17H4.003a.981.981 0 0 1-.872-.507.965.965 0 0 1 .01-.988l7.996-13.014A.987.987 0 0 1 12 2a.99.99 0 0 1 .863.491l7.992 13.006a.97.97 0 0 1 .014.996Zm1.694-2.035L14.57 1.452A2.976 2.976 0 0 0 12 0a2.975 2.975 0 0 0-2.569 1.448L1.432 14.466a2.947 2.947 0 0 0-.042 3.01A2.966 2.966 0 0 0 4.003 19H11v4a1 1 0 1 0 2 0v-4h6.997c1.098 0 2.074-.57 2.613-1.524a2.953 2.953 0 0 0-.047-3.018Z"
    />
  </svg>
);
const ForwardRef = forwardRef(IconBlockNature);
const Memo = memo(ForwardRef);
export default Memo;
