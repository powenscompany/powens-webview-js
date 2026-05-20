# Powens Webview – React Example

A minimal React 19 + Vite + TypeScript example showing how to integrate the Powens Webview SDK.

## Setup

```bash
npm install
npm run dev
```

## How it works

The `powens-webview` custom element is declared for JSX/TSX in [`src/vite-env.d.ts`](src/vite-env.d.ts). This is the standard Vite place for global type declarations.

```tsx
// src/vite-env.d.ts
/// <reference types="vite/client" />

import type { DetailedHTMLProps, HTMLAttributes, RefObject } from 'react';
import type PowensWebviewElement from '@powenscompany/webview-js';

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
```

Then use the component with a `ref` to call `openWebview()`:

```tsx
import { useRef } from 'react';
import PowensWebviewElement, { PowensWebviewFlow } from '@powenscompany/webview-js';

function App() {
  const webviewRef = useRef<PowensWebviewElement>(null);

  const open = () => {
    if (!webviewRef.current) return;
    webviewRef.current.options = {
      flow: PowensWebviewFlow.Connect,
      domain: 'domain.biapi.pro',
      clientId: '12345678',
    };
    webviewRef.current.openWebview();
  };

  return (
    <>
      <button onClick={open}>Open Webview</button>
      <powens-webview ref={webviewRef} />
    </>
  );
}
```

For the full working example see [`src/App.tsx`](src/App.tsx).
