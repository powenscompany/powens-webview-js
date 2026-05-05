import { useCallback, useEffect, useRef, useState } from 'react';
import PowensWebviewElement, { PowensWebviewFlow, PowensWebviewLanguage, PowensWebviewMessage } from '@powenscompany/webview-js';
import './App.css';

function App() {
  const webviewRef = useRef<PowensWebviewElement>(null);
  const [showJson, setShowJson] = useState(false);
  const [jsonData, setJsonData] = useState('');

  useEffect(() => {
    const handleMessage = (event: MessageEvent<PowensWebviewMessage>) => {
      if (event.origin !== window.origin) return;
      if (event.data.type !== 'powensWebviewTermination') return;

      setShowJson(true);
      const powensResult = event.data.data;
      setJsonData(JSON.stringify(powensResult, undefined, 2));
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const open = useCallback(() => {
    setShowJson(false);

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
    <>
      <h1 onClick={open}>🖼️</h1>
      {showJson && (
        <section id="json">
          <h2>Received data from Powens Webview</h2>
          <pre>{jsonData}</pre>
        </section>
      )}
      <powens-webview ref={webviewRef} />
    </>
  );
}

export default App;
