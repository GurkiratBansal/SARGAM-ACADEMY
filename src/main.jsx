import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/fraunces/wght.css';
import '@fontsource-variable/fraunces/wght-italic.css';
import '@fontsource-variable/instrument-sans/wght.css';
import './index.css';
import { App } from './App';
import { PreferencesProvider } from './context/PreferencesContext';
import { SoundProvider } from './context/SoundContext';
import { WaveTransitionProvider } from './context/WaveTransitionContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PreferencesProvider>
      <SoundProvider>
        <WaveTransitionProvider>
          <App />
        </WaveTransitionProvider>
      </SoundProvider>
    </PreferencesProvider>
  </StrictMode>,
);
