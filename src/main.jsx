import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// A corrupt saved profile/session is the most likely cause of a crash, so the
// recovery action clears that storage and reloads. The raw stack is only shown
// in dev (or behind a details toggle), not dumped at non-technical users.
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  resetAndReload = () => {
    try {
      localStorage.removeItem('osrs_fp_v5');
      localStorage.removeItem('osrs_session_v1');
    } catch (e) { /* ignore */ }
    window.location.reload();
  };
  render() {
    if (this.state.error) {
      const isDev = !!(import.meta && import.meta.env && import.meta.env.DEV);
      return (
        <div style={{ padding: 40, fontFamily: "'Crimson Text', Georgia, serif", color: '#ccc', background: '#111', minHeight: '100vh' }}>
          <div style={{ maxWidth: 560, margin: '40px auto', background: '#1a1a1a', border: '1px solid #333', borderRadius: 12, padding: 28 }}>
            <h1 style={{ color: '#e0c97f', fontSize: 22, margin: '0 0 8px' }}>🌿 Something went wrong</h1>
            <p style={{ color: '#aaa', fontSize: 14, lineHeight: 1.5 }}>
              The app hit an unexpected error. This is usually caused by an old or corrupt saved
              profile. Resetting your saved data and reloading should fix it.
            </p>
            <button onClick={this.resetAndReload} style={{ marginTop: 16, background: 'linear-gradient(135deg, #c9a84c, #8b7028)', border: 'none', color: '#1a1a1a', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>
              Reset saved data &amp; reload
            </button>
            <button onClick={() => window.location.reload()} style={{ marginTop: 16, marginLeft: 10, background: '#333', border: 'none', color: '#aaa', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>
              Just reload
            </button>
            {isDev && (
              <details style={{ marginTop: 20 }}>
                <summary style={{ color: '#888', cursor: 'pointer', fontSize: 12 }}>Technical details (dev only)</summary>
                <pre style={{ whiteSpace: 'pre-wrap', color: '#ff8a8a', fontFamily: 'monospace', fontSize: 12, marginTop: 8 }}>{this.state.error.toString()}</pre>
                <pre style={{ whiteSpace: 'pre-wrap', color: '#888', fontFamily: 'monospace', fontSize: 11, marginTop: 8 }}>{this.state.error.stack}</pre>
              </details>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
