import type { DetailedHTMLProps, HTMLAttributes, RefObject } from 'react';
import type PowensWebviewElement from '@powenscompany/webview-js';

declare module '*.css' {}

type PowensWebviewProps = DetailedHTMLProps<HTMLAttributes<PowensWebviewElement>, PowensWebviewElement> & {
  ref?: RefObject<PowensWebviewElement | null>;
};

declare global {
  namespace React.JSX {
    interface IntrinsicElements {
      'powens-webview': PowensWebviewProps;
    }
  }
}