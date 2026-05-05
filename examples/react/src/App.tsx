import { useCallback, useEffect, useRef, useState } from 'react';
import PowensWebviewElement, { PowensWebviewFlow, PowensWebviewLanguage, PowensWebviewMessage } from '@powenscompany/webview-js';
import './App.css';

function App() {
  const webviewRef = useRef<PowensWebviewElement>(null);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent<PowensWebviewMessage>) => {
      if (event.origin !== window.origin) return;
      if (event.data.type !== 'powensWebviewTermination') return;
      setResult(JSON.stringify(event.data.data, undefined, 2));
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const open = useCallback(() => {
    setResult(null);
    if (!webviewRef.current) return;
    webviewRef.current.options = {
      flow: PowensWebviewFlow.Connect,
      domain: 'integrate.biapi.pro',
      clientId: '28105838',
      redirectUri: window.location.origin,
      lang: PowensWebviewLanguage.English,
    };
    webviewRef.current.openWebview();
  }, []);

  return (
    <main>
      <div className="card">
        <img
          className="logo"
          src="https://www.powens.com/wp-content/uploads/2024/09/powens_logo_Gradient-3.svg"
          alt="Powens"
        />
        <h1>Connect your financial data</h1>
        <p className="subtitle">
          Link your bank account in a few simple steps using the Powens Webview.
        </p>
        <button onClick={open}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Connect your bank
        </button>
        <span className="badge">React</span>
      </div>

      {result && (
        <section className="result-card">
          <div className="result-header">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Webview response
          </div>
          <pre>{result}</pre>
        </section>
      )}

      <powens-webview ref={webviewRef} />
    </main>
  );
}

export default App;
