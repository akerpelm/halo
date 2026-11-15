import '@fontsource-variable/funnel-display';
import '@fontsource-variable/funnel-sans';
import '@fontsource-variable/jetbrains-mono';
import './styles.css';
import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { App } from './app';

const container = document.getElementById('root');
if (!container) throw new Error('Missing #root');
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);
if (container.firstElementChild) hydrateRoot(container, app);
else createRoot(container).render(app);
