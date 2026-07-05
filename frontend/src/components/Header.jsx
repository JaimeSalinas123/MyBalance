// src/components/Header.jsx
export default function Header({ vistaActual, cambiarVista }) {
  return (
    <header style={{
      background: 'rgba(255,255,255,0.85)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(0,0,0,0.06)',
      position: 'sticky',
      top: 0,
      zIndex: 10,
    }}>
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '0 24px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '34px',
            height: '34px',
            background: '#1D6BF3',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2L14 5.5V10.5L8 14L2 10.5V5.5L8 2Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
              <circle cx="8" cy="8" r="2" fill="white"/>
            </svg>
          </div>
          <span style={{
            fontSize: '17px',
            fontWeight: '700',
            color: '#0F172A',
            letterSpacing: '-0.3px',
          }}>MyBalance</span>
        </div>

        {/* Nav */}
        <nav style={{ display: 'flex', gap: '2px' }}>
          {[
            { id: 'inicio', label: 'Inicio' },
            { id: 'facturas', label: 'Facturas' },
            { id: 'resumen', label: 'Resumen' },
          ].map(({ id, label }) => {
            // Aquí evaluamos si el botón actual es el que está seleccionado
            const active = vistaActual === id;
            
            return (
              <button
                key={id}
                onClick={() => cambiarVista(id)}
                style={{
                  fontSize: '14px',
                  fontWeight: active ? '600' : '500',
                  color: active ? '#1D6BF3' : '#64748B',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  background: active ? '#EFF6FF' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {label}
              </button>
            );
          })}
        </nav>

      </div>
    </header>
  );
}