import React from 'https://esm.sh/react@^19.1.1';
import { createRoot } from 'https://esm.sh/react-dom@^19.1.1/client';
import App from './App.js';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);