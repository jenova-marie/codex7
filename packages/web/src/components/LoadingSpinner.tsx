/**
 * Loading spinner component
 *
 * Displays an animated spinner for loading states.
 * Uses inline styles for simplicity in Phase 0.
 */
export function LoadingSpinner() {
  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <div style={{
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #8b5cf6',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        animation: 'spin 1s linear infinite',
        margin: '0 auto'
      }} />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
