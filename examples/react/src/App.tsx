import { useEffect, useState } from 'react'
import PowensWebviewElement, { PowensWebviewFlow, PowensWebviewLanguage, PowensWebviewMessage } from '@powenscompany/webview-js';
import './App.css'

const PowensWebview = () => {
  return <powens-webview/>;
};

function App() {
  const [showJson, setShowJson] = useState(false);
  const [jsonData, setJsonData] = useState('');

  useEffect(() => {
    const messageEventListener = (event: MessageEvent<PowensWebviewMessage>) => {
      if (event.origin !== window.origin) return;
      if (event.data.type !== 'powensWebviewTermination') return;

      setShowJson(true);
      const powensResult = event.data.data;
      setJsonData(JSON.stringify(powensResult, undefined, 2));
    };

    window.addEventListener('message', messageEventListener);
    return () => window.removeEventListener('message', messageEventListener);
  });

  const open = () => {
    setShowJson(false);

    const powensWebview = document.querySelector('powens-webview') as PowensWebviewElement;
    powensWebview.options = {
      flow: PowensWebviewFlow.Connect,
      domain: 'integrate.biapi.pro',
      clientId: '28105838',
      lang: PowensWebviewLanguage.English,
      redirectUri: window.location.origin,
    };
    powensWebview.openWebview();
  };

  return (
    <>
      <h1 onClick={open}>🖼️</h1>
      {showJson && <section id="json">
        <h2>Received data from Powens Webview</h2>
        <pre>{jsonData}</pre>
      </section>}
      <PowensWebview />
    </>
  )
}

export default App
