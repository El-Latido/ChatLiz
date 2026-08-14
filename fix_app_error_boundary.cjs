const fs = require('fs');
let file = fs.readFileSync('src/App.tsx', 'utf8');

const oldBoundaryClass = `class ErrorBoundary extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    // @ts-ignore
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    // @ts-ignore
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', background: 'red', color: 'white', zIndex: 9999, position: 'relative' }}>
          <h1>Algo salió mal en la aplicación.</h1>
          {/* @ts-ignore */}
          <pre>{this.state.error?.toString()}</pre>
          {/* @ts-ignore */}
          <pre>{this.state.error?.stack}</pre>
        </div>
      );
    }
    // @ts-ignore
    return this.props.children;
  }
}`;

file = file.replace(oldBoundaryClass, '');

file = file.replace(/<ErrorBoundary>/g, '<>');
file = file.replace(/<\/ErrorBoundary>/g, '</>');

fs.writeFileSync('src/App.tsx', file);
