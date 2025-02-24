// Copyright (C) 2025 Powens
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.


export enum PowensWebviewFlow {
  Connect = 'connect',
  Reconnect = 'reconnect',
  Manage = 'manage',
  Payment = 'payment',
}

export enum PowensWebviewLanguage {
  English = 'en',
  French = 'fr',
  German = 'de',
  Dutch = 'nl',
  Italian = 'it',
  Spanish = 'es',
  Portuguese = 'pt',
}

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

export interface PowensWebviewMessage {
  type: 'powensWebviewTermination';
  data: PowensWebviewResult;
}

export interface PowensWebviewResult {
  connectionId?: number;
  connectionIds?: number[];
  connectionDeleted?: boolean;
  code?: string;
  state?: string;
  error?: string;
  errorDescription?: string;
}

const powensWebviewOrigin = 'https://webview.powens.com';
const sectionElementId = 'powens-webview';
const iframeElementId = 'powens-webview-frame';

export default class PowensWebviewElement extends HTMLElement {
  options: PowensWebviewOptions;
  url: URL;
  messageListener: (event: MessageEvent<PowensWebviewMessage>) => void;

  constructor() {
    super();
  }

  static get observedAttributes(): string[] {
    return [];
  }

  attributeChangedCallback(property: string, oldValue: string, newValue: string): void {
    if (oldValue === newValue) return;
    this[property] = newValue;
  }

  listenMessageEvents(): void {
    window.addEventListener('message', this.messageListener);
  }

  unsubscribeMessageEvents(): void {
    window.removeEventListener('message', this.messageListener);
  }

  handleWebviewTermination(eventData: PowensWebviewMessage): void {
    if (eventData.type !== 'powensWebviewTermination') return;

    this.closeWebview();
    window.postMessage(eventData, window.origin);
  }

  buildWebviewUrl(): void {
    const flow = this.options.flow ?? 'connect';
    const langPath = this.options.lang ? `/${this.options.lang}` : '';
    this.url = new URL(`${powensWebviewOrigin}${langPath}/${flow}`);
  
    if (!this.options) return;
    Object.keys(this.options).forEach(key => {
      if (this.options[key] === undefined || ['flow', 'lang', 'connectorFieldValues'].includes(key)) return;
      const paramName = key.replace(/[\w]([A-Z])/g, s => `${s[0]}_${s[1]}`).toLowerCase();
      this.url.searchParams.append(paramName, this.options[key]);
    });

    if (!this.options.connectorFieldValues) return;
    const uuids = Object.keys(this.options.connectorFieldValues);
    if (uuids?.length) {
      uuids.forEach(uuid => {
        const fieldNames = Object.keys(this.options.connectorFieldValues![uuid]);
        for (const fieldName of fieldNames) {
          this.url.searchParams.append(`${uuid}.${fieldName}`, this.options.connectorFieldValues![uuid][fieldName]);
        }
      });
    }
  }

  openWebview(): void {
    if (this.shadowRoot?.getElementById(sectionElementId)) return;

    this.buildWebviewUrl();

    const sectionElement = document.createElement('section');
    sectionElement.id = sectionElementId;
    this.shadowRoot?.appendChild(sectionElement);

    const iframeElement = document.createElement('iframe');
    iframeElement.id = iframeElementId;
    iframeElement.loading = 'lazy';
    iframeElement.src = this.url.href;
    sectionElement.appendChild(iframeElement);

    this.listenMessageEvents();
  }

  closeWebview(): void {
    this.unsubscribeMessageEvents();
    this.shadowRoot?.getElementById(sectionElementId)?.remove();
  }

  connectedCallback(): void {
    this.messageListener = (event) => {
      if (event.origin !== this.url.origin) return;
      this.handleWebviewTermination(event.data);
    };

    const shadow = this.attachShadow({ mode: 'open' });
    const xPadding = '20px';
    shadow.innerHTML = `<style>
      #${sectionElementId} {
        display: flex;
        position: fixed;
        top: 0;
        left: 0;
        width: calc(100% - ${xPadding} * 2);
        height: 100%;
        padding: 0 ${xPadding};
        justify-content: center;
        background-color: rgba(0, 0, 0, .33);
      }

      #${iframeElementId} {
        width: 440px;
        height: 90vh;
        max-height: 740px;
        margin: auto;
        border: none;
        border-radius: 12px;
        box-shadow: 0 0 32px 0px rgba(0, 0, 0, .5);
      }
    </style>`;
  }
}

customElements.define('powens-webview', PowensWebviewElement);