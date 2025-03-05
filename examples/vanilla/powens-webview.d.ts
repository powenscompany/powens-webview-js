export declare enum PowensWebviewFlow {
    Connect = "connect",
    Reconnect = "reconnect",
    Manage = "manage",
    Payment = "payment"
}
export declare enum PowensWebviewLanguage {
    English = "en",
    French = "fr",
    German = "de",
    Dutch = "nl",
    Italian = "it",
    Spanish = "es",
    Portuguese = "pt"
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
export default class PowensWebviewElement extends HTMLElement {
    options: PowensWebviewOptions;
    url: URL;
    messageListener: (event: MessageEvent<PowensWebviewMessage>) => void;
    constructor();
    static get observedAttributes(): string[];
    attributeChangedCallback(property: string, oldValue: string, newValue: string): void;
    listenMessageEvents(): void;
    unsubscribeMessageEvents(): void;
    handleWebviewTermination(eventData: PowensWebviewMessage): void;
    buildWebviewUrl(): void;
    openWebview(): void;
    closeWebview(): void;
    connectedCallback(): void;
}
