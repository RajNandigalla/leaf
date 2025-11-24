import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.scss';
import App from './App';
import { useContext, useEffect } from 'react';
// import { ThemeContext } from './context/ThemeContext';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

const StatusBarX = () => {
  // const context = useContext(ThemeContext);

  useEffect(() => {
    const setupStatusBar = async () => {
      if (Capacitor.isNativePlatform()) {
        // if (context?.theme === 'dark') {
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#1e293b' });
        await StatusBar.setOverlaysWebView({ overlay: false });
        // } else {
        //   await CapacitorStatusBar.setStyle({ style: Style.Light });
        //   await CapacitorStatusBar.setBackgroundColor({ color: '#ffffff' });
        //   await CapacitorStatusBar.setOverlaysWebView({ overlay: false });
        // }
      }
    };

    setupStatusBar();
  }, []);
  // }, [context?.theme]);

  return null;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StatusBarX />
    <App />
  </StrictMode>
);
