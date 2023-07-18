import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';
import './global.module.css';
import './var.module.css';

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
