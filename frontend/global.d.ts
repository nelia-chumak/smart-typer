import 'react-router';
import 'react-router-dom';

import type { To, NavigateOptions } from 'react-router';

declare module 'react-router' {
  interface NavigateFunction {
    (to: To, options?: NavigateOptions): void;
    (delta: number): void;
  }
}

declare module 'react-router-dom' {
  interface NavigateFunction {
    (to: To, options?: NavigateOptions): void;
    (delta: number): void;
  }
}
