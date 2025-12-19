// DOM elements
const openBtn = document.getElementById('open-btn');
const jsonSection = document.getElementById('json');
const resultPre = document.getElementById('result');
const powensWebview = document.querySelector('powens-webview');

// Handle webview completion
window.addEventListener('message', (event) => {
  if (event.origin !== window.origin) return;
  if (event.data.type !== 'powensWebviewTermination') return;

  jsonSection.hidden = false;
  resultPre.textContent = JSON.stringify(event.data.data, undefined, 2);
});

// Open webview on click
openBtn.addEventListener('click', () => {
  jsonSection.hidden = true;

  powensWebview.options = {
    flow: 'connect',
    domain: 'integrate.biapi.pro',
    clientId: '28105838',
    redirectUri: window.location.origin,
    lang: 'en',
  };
  
  powensWebview.openWebview();
});
