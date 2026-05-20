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
const confirmDialogId = 'powens-webview-confirm';

export default class PowensWebviewElement extends HTMLElement {
  options: PowensWebviewOptions;
  #url: URL;
  #messageListener: (event: MessageEvent<PowensWebviewMessage>) => void;
  #backdropClickListener: (event: MouseEvent) => void;

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

  #listenMessageEvents(): void {
    window.addEventListener('message', this.#messageListener);
  }

  #unsubscribeMessageEvents(): void {
    window.removeEventListener('message', this.#messageListener);
  }

  #showConfirmDialog(): void {
    const existingDialog = this.shadowRoot?.getElementById(confirmDialogId);
    if (existingDialog) return;

    const dialog = document.createElement('div');
    dialog.id = confirmDialogId;
    dialog.innerHTML = `
      <div class="confirm-content">
        <div class="confirm-logo">
          <img src="https://s3.eu-west-1.amazonaws.com/irl-assets.unnax.com/logos/Powens_logo_blue.svg" alt="Powens" />
        </div>
        <h3 class="confirm-title">Close this window?</h3>
        <p class="confirm-message">If you close, your progress will be lost and you'll need to start again.</p>
        <div class="confirm-buttons">
          <button class="confirm-cancel">No, continue</button>
          <button class="confirm-close">Yes, close it</button>
        </div>
      </div>
    `;

    const cancelBtn = dialog.querySelector('.confirm-cancel') as HTMLButtonElement;
    const closeBtn = dialog.querySelector('.confirm-close') as HTMLButtonElement;

    cancelBtn.addEventListener('click', () => {
      dialog.remove();
    });

    closeBtn.addEventListener('click', () => {
      this.closeWebview();
    });

    this.shadowRoot?.appendChild(dialog);
  }

  #handleBackdropClick(event: MouseEvent): void {
    const section = this.shadowRoot?.getElementById(sectionElementId);
    const iframe = this.shadowRoot?.getElementById(iframeElementId);
    
    if (event.target === section && event.target !== iframe) {
      this.#showConfirmDialog();
    }
  }

  #handleWebviewTermination(eventData: PowensWebviewMessage): void {
    if (eventData.type !== 'powensWebviewTermination') return;

    window.postMessage(eventData, window.origin);
    this.closeWebview();
  }

  #buildWebviewUrl(): void {
    const flow = this.options.flow ?? 'connect';
    const langPath = this.options.lang ? `/${this.options.lang}` : '';
    this.#url = new URL(`${powensWebviewOrigin}${langPath}/${flow}`);
  
    if (!this.options) return;
    Object.keys(this.options).forEach(key => {
      if (this.options[key] === undefined || ['flow', 'lang', 'connectorFieldValues'].includes(key)) return;
      const paramName = key.replace(/[\w]([A-Z])/g, s => `${s[0]}_${s[1]}`).toLowerCase();
      this.#url.searchParams.append(paramName, this.options[key]);
    });

    if (!this.options.connectorFieldValues) return;
    const uuids = Object.keys(this.options.connectorFieldValues);
    if (uuids?.length) {
      uuids.forEach(uuid => {
        const fieldNames = Object.keys(this.options.connectorFieldValues![uuid]);
        for (const fieldName of fieldNames) {
          this.#url.searchParams.append(`${uuid}.${fieldName}`, this.options.connectorFieldValues![uuid][fieldName]);
        }
      });
    }
  }

  openWebview(): void {
    if (this.shadowRoot?.getElementById(sectionElementId)) return;

    this.#buildWebviewUrl();

    const sectionElement = document.createElement('section');
    sectionElement.id = sectionElementId;
    sectionElement.addEventListener('click', this.#backdropClickListener);
    this.shadowRoot?.appendChild(sectionElement);

    const iframeElement = document.createElement('iframe');
    iframeElement.id = iframeElementId;
    iframeElement.loading = 'lazy';
    iframeElement.src = this.#url.href;
    sectionElement.appendChild(iframeElement);

    this.#listenMessageEvents();
  }

  closeWebview(): void {
    this.#unsubscribeMessageEvents();
    const section = this.shadowRoot?.getElementById(sectionElementId);
    section?.removeEventListener('click', this.#backdropClickListener);
    section?.remove();
    this.shadowRoot?.getElementById(confirmDialogId)?.remove();
  }

  connectedCallback(): void {
    this.#messageListener = (event) => {
      if (event.origin !== this.#url?.origin) return;
      this.#handleWebviewTermination(event.data);
    };

    this.#backdropClickListener = (event) => {
      this.#handleBackdropClick(event);
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

      #${confirmDialogId} {
        display: flex;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        justify-content: center;
        align-items: center;
        background-color: rgba(0, 0, 0, .6);
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
        z-index: 1000;
        animation: fadeIn 0.2s ease-out;
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes slideIn {
        from { 
          opacity: 0;
          transform: scale(0.95) translateY(-10px);
        }
        to { 
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }

      .confirm-content {
        background: #ffffff;
        padding: 32px 40px;
        border-radius: 20px;
        text-align: center;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, sans-serif;
        max-width: 340px;
        animation: slideIn 0.25s ease-out;
      }

      .confirm-logo {
        margin-bottom: 20px;
      }

      .confirm-logo img {
        height: 28px;
        width: auto;
      }

      .confirm-title {
        margin: 0 0 8px;
        font-size: 20px;
        font-weight: 600;
        color: #1d1d1f;
        letter-spacing: -0.02em;
      }

      .confirm-message {
        margin: 0 0 24px;
        font-size: 15px;
        color: #86868b;
        line-height: 1.5;
      }

      .confirm-buttons {
        display: flex;
        gap: 12px;
        justify-content: center;
      }

      .confirm-buttons button {
        padding: 12px 28px;
        border: none;
        border-radius: 980px;
        font-size: 15px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1);
      }

      .confirm-cancel {
        background: #0071e3;
        color: white;
      }

      .confirm-cancel:hover {
        background: #0077ed;
        transform: scale(1.02);
      }

      .confirm-cancel:active {
        transform: scale(0.98);
      }

      .confirm-close {
        background: #f5f5f7;
        color: #1d1d1f;
      }

      .confirm-close:hover {
        background: #e8e8ed;
      }

      .confirm-close:active {
        transform: scale(0.98);
      }
    </style>`;
  }
}

customElements.define('powens-webview', PowensWebviewElement);