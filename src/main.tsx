import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any, errorInfo: any}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Error crítico capturado:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '30px', fontFamily: 'monospace', background: '#ffebee', color: '#b71c1c', height: '100vh', overflow: 'auto' }}>
          <h1>💥 Error Crítico en la Aplicación</h1>
          <h3>La pantalla se puso en blanco por el siguiente fallo:</h3>
          <pre style={{ background: '#fff', padding: '15px', border: '1px solid #ef9a9a', borderRadius: '5px' }}>
            {this.state.error && this.state.error.toString()}
          </pre>
          <h4>Detalles del componente:</h4>
          <pre style={{ background: '#fff', padding: '15px', border: '1px solid #ef9a9a', borderRadius: '5px', fontSize: '12px' }}>
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
          <button onClick={() => window.location.reload()} style={{ padding: '10px 20px', background: '#d32f2f', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '15px' }}>
            🔄 Recargar Página
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
