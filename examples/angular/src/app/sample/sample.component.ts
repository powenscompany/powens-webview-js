import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import PowensWebviewElement, { PowensWebviewFlow, PowensWebviewLanguage, PowensWebviewMessage } from '@powenscompany/webview-js';

@Component({
  selector: 'app-sample',
  templateUrl: './sample.component.html',
  styleUrls: ['./sample.component.scss']
})
export class SampleComponent implements OnInit, OnDestroy {
  @ViewChild('webview') webview!: ElementRef<PowensWebviewElement>;

  messageEventListener = (event: MessageEvent<PowensWebviewMessage>) => this.handleWebviewTermination(event);
  shouldShowJson = false;
  jsonData?: string;

  ngOnInit(): void {
    window.addEventListener('message', this.messageEventListener);
  }

  ngOnDestroy(): void {
    window.removeEventListener('message', this.messageEventListener);
  }

  open(): void {
    this.shouldShowJson = false;

    this.webview.nativeElement.options = {
      flow: PowensWebviewFlow.Connect,
      domain: 'integrate.biapi.pro',
      clientId: '28105838',
      lang: PowensWebviewLanguage.English,
      redirectUri: window.location.origin,
    };
    this.webview.nativeElement.openWebview();
  }

  handleWebviewTermination(event: MessageEvent<PowensWebviewMessage>) {
    if (event.origin !== window.origin) return;
    if (event.data.type !== 'powensWebviewTermination') return;

    this.shouldShowJson = true;
    const powensResult = event.data.data;
    this.jsonData = JSON.stringify(powensResult, undefined, 2);
  }
}
