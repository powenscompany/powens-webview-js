# Powens Webview JS
This web component allows you to quickly and easily implement aggregation journeys and integrate the [Powens Webview](https://docs.powens.com/api-reference/overview/webview) in your JavaScript & TypeScript projects.

# Installation

## From npm
Run the following command to add this package to your `package.json`.
```
npm install --save @powenscompany/webview-js
```

## Manually
Download `powens-webview.js` & `powens-webview.d.ts` from the [`lib/` folder](https://github.com/powenscompany/powens-webview-js/tree/main/lib) and add them to your project.

# Usage

## General usage

### Load the web component
```html
<script type="module" src="powens-webview.js"></script>
```

### Use it in your HTML
```html
<powens-webview/>
```

### Open the Webview
```typescript
import PowensWebviewElement, { PowensWebviewFlow, PowensWebviewLanguage, PowensWebviewMessage } from '@powenscompany/webview-js';

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
window.addEventListener('message', (event: MessageEvent<PowensWebviewMessage>) => {
  if (event.origin !== window.origin) return;
  if (event.data.type !== 'powensWebviewTermination') return;

  const powensResult = event.data.data;
  console.log(powensResult);
  const connectionId = powensResult.connectionId;
  // Do what you must with the Webview callback data
});
```
Make sure to remove the event listener when no longer needed.

## Angular
Load the web component by importing it in `angular.json`
```json
"architect": {
  "build": {
    "options": {
      "scripts": [
        {
          "input": "./node_modules/@powenscompany/webview-js/lib/powens-webview.js",
          "inject": false,
          "bundleName": "powens-webview"
        }
      ]
    }
  }
}
```

## React
Declare the `powens-webview` custom element to be able to use it in your JSX & TSX code
```typescript
import PowensWebviewElement from '@powenscompany/webview-js';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      ['powens-webview']: CustomElement<PowensWebviewElement>;
    }
  }
}
```

# Types reference
For more information about Webview flows, parameters and callback parameters, please check [our documentation](https://docs.powens.com/api-reference/overview/webview#implementation-guidelines).

## PowensWebviewFlow
The list of available flows
```typescript
export declare enum PowensWebviewFlow {
  Connect = "connect",
  Reconnect = "reconnect",
  Manage = "manage",
  Payment = "payment"
}
```

## PowensWebviewLanguage
The list of supported languages
```typescript
export declare enum PowensWebviewLanguage {
  English = "en",
  French = "fr",
  German = "de",
  Dutch = "nl",
  Italian = "it",
  Spanish = "es",
  Portuguese = "pt"
}
```

## PowensWebviewOptions
The Webview configuration object
```typescript
export interface PowensWebviewOptions {
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

## PowensWebviewResult
Outcoming Webview parameters upon completion, closure or failure
```typescript
export interface PowensWebviewResult {
  connectionId?: number;
  connectionIds?: number[];
  connectionDeleted?: boolean;
  code?: string;
  state?: string;
  error?: string;
  errorDescription?: string;
}
```

# License
Powens Webview JS is available under the LGPLv3 license. See the [LICENSE](https://github.com/powenscompany/powens-webview-js/blob/main/LICENSE) file for more information.