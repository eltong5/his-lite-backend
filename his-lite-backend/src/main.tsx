import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import './index.css'

console.log('🚀 Aplicación iniciando (Restaurando App completa)...')

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
})

// Capturador de errores globales
window.onerror = function(message, source, lineno, colno, error) {
  console.error('💥 Error global detectado:', message, source, lineno, colno, error);
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; color: red; font-family: sans-serif;">
        <h1>💥 Error Fatal al Cargar la Aplicación</h1>
        <p><strong>Mensaje:</strong> ${message}</p>
        <p><strong>Ubicación:</strong> ${source}:${lineno}:${colno}</p>
        <hr />
        <p>Por favor, revisa la consola del navegador (F12) para más detalles.</p>
      </div>
    `;
  }
};

try {
  console.log('📦 Intentando renderizar App...');
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error('❌ No se encontró #root');
  } else {
    ReactDOM.createRoot(rootElement).render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>,
    )
    console.log('✅ React inició el proceso de renderizado');
  }
} catch (error) {
  console.error('💥 Fallo crítico durante el renderizado inicial:', error);
}
