import PowensWebviewElement from "@powenscompany/webview-js";

declare global {
  namespace React.JSX {
    interface IntrinsicElements {
      ['powens-webview']: CustomElement<PowensWebviewElement>;
    }
  }
}