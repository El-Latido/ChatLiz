const fs = require('fs');
let file = fs.readFileSync('src/main.tsx', 'utf8');

const newMain = `import React, { StrictMode, Component } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

class ErrorBoundary extends Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Error capturado por la interfaz:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'red', background: '#fff', textAlign: 'center', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h2>¡Ups! Algo salió mal en la interfaz.</h2>
          <pre style={{maxWidth: '80%', overflow: 'auto', textAlign: 'left', background: '#f5f5f5', padding: '10px'}}>{this.state.error?.toString()}</pre>
          <button onClick={() => window.location.reload()} style={{ padding: '10px 20px', marginTop: '10px', background: '#333', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            Recargar Aplicación
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
);`;

fs.writeFileSync('src/main.tsx', newMain);
