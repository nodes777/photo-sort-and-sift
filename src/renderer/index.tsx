import { createRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}

// Listen for messages from the main process
if (window.electron) {
  window.electron.ipcBridge.sendMessage('folder-selection', ['change-folder']);

  window.electron.ipcBridge.on('processed-images', (images) => {
    console.log('Received images:', images);
  });
} else {
  console.error('window.electron is undefined. Check your preload script.');
}
