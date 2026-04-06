import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { I18nProvider } from '@procore/core-react'
import { ErrorBoundary } from './ErrorBoundary'
import './index.css'
import App from './App.tsx'

const rootEl = document.getElementById('root')
if (!rootEl) {
  throw new Error('Missing #root element in index.html')
}

createRoot(rootEl).render(
  <StrictMode>
    <ErrorBoundary>
      <I18nProvider locale="en" translations={{}} enableCDN={false}>
        <App />
      </I18nProvider>
    </ErrorBoundary>
  </StrictMode>,
)
