import * as React from 'react';
import { SVGProps, Ref, forwardRef, memo } from 'react';
const IconExtrude = (
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
      d="M12.254 2.407a.3.3 0 0 0-.508 0L7.382 9.388a.4.4 0 0 0 .34.612H11v1.333l-2.25.75 2.25.787v1.05l1 .326 1-.326v-1.05l2.25-.787-2.25-.75V10h3.278a.4.4 0 0 0 .34-.612l-4.364-6.98Zm8.461 11.498L16.8 12.6l-3.287 1.15 3.987 1.395v.022l3.215-1.072a.1.1 0 0 0 0-.19Zm-4.734 1.768L12 14.28l-3.98 1.393 3.948 1.316a.1.1 0 0 0 .064 0l3.949-1.316ZM7.2 12.6l3.285 1.15L6.5 15.145v.022l-3.215-1.072a.1.1 0 0 1 0-.19L7.2 12.6Zm9.299 3.9v4l-4.184 1.395a1 1 0 0 1-.632 0L7.5 20.5v-4L12 18l4.5-1.5Zm1 3.667v-4L21 15v3.64a.5.5 0 0 1-.342.474L17.5 20.167ZM3 15l3.5 1.167v4l-3.158-1.053A.5.5 0 0 1 3 18.64V15Z"
    />
  </svg>
);
const ForwardRef = forwardRef(IconExtrude);
const Memo = memo(ForwardRef);
export default Memo;
