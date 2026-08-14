import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

class SafeView extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Fallo detectado en UI:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', background: '#1a1a1a', color: '#ff5252', fontFamily: 'monospace', minHeight: '100vh' }}>
          <h2>⚠️ La aplicación se detuvo por un error de renderizado:</h2>
          <pre style={{ background: '#2d2d2d', padding: '20px', borderRadius: '8px', overflowX: 'auto' }}>
            {String(this.state.error)}
          </pre>
          <button 
            onClick={() => window.location.reload()} 
            style={{ marginTop: '20px', padding: '10px 20px', background: '#ff5252', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            Recargar aplicación
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <SafeView>
        <App />
      </SafeView>
    </React.StrictMode>
  );
}
