# Powens Webview JS

This web component allows you to quickly and easily implement aggregation journeys and integrate the [Powens Webview](https://docs.powens.com/api-reference/overview/webview) in your JavaScript & TypeScript projects.

## Installation

### Using npm

```bash
npm install @powenscompany/webview-js
```

TypeScript types are included automatically.

### Using CDN (no build step required)

```html
<script type="module" src="https://unpkg.com/@powenscompany/webview-js"></script>
```

## Usage

### Vanilla JavaScript

```html
<!doctype html>
<html lang="en">
<head>
  <script type="module" src="https://unpkg.com/@powenscompany/webview-js"></script>
  <script type="module" src="app.js"></script>
</head>
<body>
  <button id="open-webview">Open Webview</button>
  <powens-webview></powens-webview>
</body>
</html>
```

```javascript
// app.js
const powensWebview = document.querySelector('powens-webview');

document.getElementById('open-webview').addEventListener('click', () => {
  powensWebview.options = {
    flow: 'connect',
    domain: 'domain.biapi.pro',
    clientId: '2307407',
    redirectUri: window.location.origin,
    lang: 'en',
  };
  powensWebview.openWebview();
});

window.addEventListener('message', (event) => {
  if (event.origin !== window.origin) return;
  if (event.data.type !== 'powensWebviewTermination') return;
  
  const result = event.data.data;
  console.log('Connection ID:', result.connectionId);
});
```

### TypeScript / ES Modules

```typescript
import PowensWebviewElement, { 
  PowensWebviewFlow, 
  PowensWebviewLanguage, 
  PowensWebviewMessage 
} from '@powenscompany/webview-js';

// Get `<powens-webview>` element reference
const powensWebview = document.querySelector('powens-webview') as PowensWebviewElement;

// Configure Webview and opening parameters
powensWebview.options = {
 flow: PowensWebviewFlow.Connect, // ‘connect’
  domain: 'domain.biapi.pro',
  clientId: ‘2307407’,
  redirectUri: window.location.origin,
  lang: PowensWebviewLanguage.English, // ‘en’
  code: 'COj_wSfkqm1rpS8UYFMCK481VVCv1xy8YZu...zSerIrMZyRBIQPWQlXgPuY0Z/7F0Ig6Gvuw',
  maxConnections: 3,
  connectorCapabilities: ['bank', 'bankwealth', 'document'],
  accountTypes: ['card', 'checking', 'market', 'perco'],
  // [...]
};

// Open the Webview
powensWebview.openWebview();
```
See the [types reference](#powenswebviewoptions) below for a complete example of setting parameters.

### Handle the Webview completion event

```typescript
// Handle completion
window.addEventListener('message', (event: MessageEvent<PowensWebviewMessage>) => {
  if (event.origin !== window.origin) return;
  if (event.data.type !== 'powensWebviewTermination') return;
  const powensResult = event.data.data;
  console.log(powensResult);
  // Do what you must with the Webview callback data
});
```

### Angular

```typescript
import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, ViewChild } from '@angular/core';
import PowensWebviewElement, { PowensWebviewFlow, PowensWebviewLanguage } from '@powenscompany/webview-js';

@Component({
  selector: 'app-root',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: \`
    <button (click)="open()">Open Webview</button>
    <powens-webview #webview></powens-webview>
  \`,
})
export class AppComponent {
  @ViewChild('webview') webview!: ElementRef<PowensWebviewElement>;

  open() {
    this.webview.nativeElement.options = {
      // options to open the Powens Webview
      //[...]
    };

    this.webview.nativeElement.openWebview();
  }
}
```

### React

Declare the `powens-webview` custom element to be able to use it in your JSX & TSX code
```tsx
import type { DetailedHTMLProps, HTMLAttributes, RefObject } from 'react';
import type PowensWebviewElement from '@powenscompany/webview-js';

declare global {
  namespace React.JSX {
    interface IntrinsicElements {
      'powens-webview': DetailedHTMLProps<HTMLAttributes<PowensWebviewElement>, PowensWebviewElement> & {
        ref?: RefObject<PowensWebviewElement | null>;
      };
    }
  }
}
```

```tsx
import { useCallback, useEffect, useRef } from 'react';
import PowensWebviewElement, { PowensWebviewFlow, PowensWebviewLanguage, PowensWebviewMessage } from '@powenscompany/webview-js';

function App() {
  const webviewRef = useRef<PowensWebviewElement>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent<PowensWebviewMessage>) => {
      if (event.origin !== window.origin) return;
      if (event.data.type !== 'powensWebviewTermination') return;
      console.log(event.data.data.connectionId);
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const open = useCallback(() => {
    if (!webviewRef.current) return;
    webviewRef.current.options = {
      //Powens Webview options
    };
    webviewRef.current.openWebview();
  }, []);

  return (
    <>
      <button onClick={open}>Open Webview</button>
      <powens-webview ref={webviewRef} />
    </>
  );
}
```

## Examples

Check out the [sample projects](https://github.com/powenscompany/powens-webview-js/tree/main/examples):

- [Vanilla JS](https://github.com/powenscompany/powens-webview-js/tree/main/examples/vanilla) - No build step required
- [React](https://github.com/powenscompany/powens-webview-js/tree/main/examples/react) - React 19 + TypeScript
- [Angular](https://github.com/powenscompany/powens-webview-js/tree/main/examples/angular) - Angular 19 + Standalone Components

## Running TypeScript Scripts

This project uses [tsx](https://tsx.is/) to execute TypeScript scripts locally in a Node.js environment.

### Run the example script

```bash
npm run script
```

### Run any TypeScript file directly

```bash
npx tsx scripts/my-script.ts
```

Scripts are located in the `scripts/` directory and use a separate `tsconfig.node.json` for Node-specific type-checking (no DOM types, NodeNext module resolution).

## Types Reference

For more information about Webview flows, parameters and callback parameters, please check [our documentation](https://docs.powens.com/api-reference/overview/webview#implementation-guidelines).

### PowensWebviewFlow
The list of available flows
```typescript
enum PowensWebviewFlow {
  Connect = "connect",
  Reconnect = "reconnect",
  Manage = "manage",
  Payment = "payment"
}
```

### PowensWebviewLanguage
The list of supported languages
```typescript
enum PowensWebviewLanguage {
  English = "en",
  French = "fr",
  German = "de",
  Dutch = "nl",
  Italian = "it",
  Spanish = "es",
  Portuguese = "pt"
}
```

### PowensWebviewOptions
The Webview configuration object
```typescript
interface PowensWebviewOptions {
  flow: PowensWebviewFlow;
  domain: string;
  clientId: string;
  lang?: PowensWebviewLanguage;
  code?: string;
  redirectUri?: string;
  maxConnections?: number;
  connectorUuids?: string[];
  connectorCapabilities?: string[];
  connectorCountry?: string;
  connectorFieldValues?: Record<string, Record<string, string>>;
  accountTypes?: string[];
  accountUsages?: string[];
  accountIbans?: string[];
  state?: string;
  connectionId?: number;
  resetCredentials?: true;
  sources?: string[];
  paymentId?: number;
}
```
Example
```typescript
powensWebview.options = {
  flow: PowensWebviewFlow.Connect,
  domain: 'domain.biapi.pro',
  clientId: ‘2307407’,
  redirectUri: window.location.origin,
  lang: PowensWebviewLanguage.English,
  code: 'COj_wSfkqm1rpS8UYFMCK481VVCv1xy8YZu...zSerIrMZyRBIQPWQlXgPuY0Z/7F0Ig6Gvuw',
  maxConnections: 3,
  connectorUuids: [
    '338178e6-3d01-564f-9a7b-52ca442459bf',
    '07d76adf-ae35-5b38-aca8-67aafba13169',
    '37bbb26d-d371-5333-bcea-1839b5283cec',
  ],
  connectorCapabilities: ['bank', 'bankwealth', 'document'],
  connectorCountry: 'gb',
  connectorFieldValues: {
    '338178e6-3d01-564f-9a7b-52ca442459bf': {
      openapiwebsite: 'par',
      directaccesswebsite: 'pro'
    },
    'f5c29767-1bc8-5337-9e4e-68a0fbd91c9a': {
      website: 'pro'
    },
  },
  accountTypes: ['card', 'checking', 'market', 'perco'],
  accountUsages: ['priv', 'orga'],
  accountIbans: ['FR7610107001011234567890129', 'FR7611315000011234567890138'],
  state: 'MY_STATE',
  connectionId: 46,
  resetCredentials: true,
};
```
### PowensWebviewResult
Outcoming Webview parameters upon completion, closure or failure
```typescript
interface PowensWebviewResult {
  connectionId?: number;
  connectionIds?: number[];
  connectionDeleted?: boolean;
  code?: string;
  state?: string;
  error?: string;
  errorDescription?: string;
}
```

## License

Powens Webview JS is available under the LGPLv3 license. See the [LICENSE](https://github.com/powenscompany/powens-webview-js/blob/main/LICENSE) file for more information.
