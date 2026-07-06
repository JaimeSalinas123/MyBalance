// src/components/Header.tsx
"use client"; // Importante: como usamos localStorage, esto debe ser client component
import React from 'react';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  vistaActual: string;
  cambiarVista: (id: string) => void;
}

export default function Header({ vistaActual, cambiarVista }: HeaderProps) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token'); // Borramos la llave digital
    router.push('/login'); // Mandamos al usuario al Login
  };

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
          {/* ... tu logo igual ... */}
          <span style={{ fontSize: '17px', fontWeight: 700, color: '#0F172A' }}>MyBalance</span>
        </div>

        {/* Nav y Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <nav style={{ display: 'flex', gap: '2px' }}>
            {[
              { id: 'inicio', label: 'Inicio' },
              { id: 'facturas', label: 'Facturas' },
              { id: 'resumen', label: 'Resumen' },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => cambiarVista(id)}
                style={{
                  fontSize: '14px',
                  fontWeight: vistaActual === id ? 600 : 500,
                  color: vistaActual === id ? '#1D6BF3' : '#64748B',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  background: vistaActual === id ? '#EFF6FF' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {label}
              </button>
            ))}
          </nav>

          {/* Botón de Cerrar Sesión */}
          <button 
            onClick={handleLogout}
            style={{ 
              fontSize: '12px', fontWeight: 600, color: '#EF4444', 
              background: '#FEF2F2', padding: '6px 12px', borderRadius: '8px',
              border: 'none', cursor: 'pointer' 
            }}
          >
            Salir
          </button>
        </div>

      </div>
    </header>
  );
}