// apps/frontend/src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';
import { registerServiceWorker } from './pwa/registerServiceWorker';
import { APP_NAME } from './config/env';
import { queryClient } from './shared/query/queryClient';
import { AppErrorBoundary } from './components/errors/AppErrorBoundary';
import { ThemeProvider } from './shared/theme/ThemeProvider';

document.title = APP_NAME;
registerServiceWorker();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <App />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3500,
                style: {
                  background: '#101b32',
                  color: '#f2f6ff',
                  border: '1px solid #2b4473',
                  borderRadius: '14px',
                  boxShadow: '0 12px 30px rgba(7,13,29,0.35)',
                },
              }}
            />
          </BrowserRouter>
        </QueryClientProvider>
      </ThemeProvider>
    </AppErrorBoundary>
  </React.StrictMode>
);
