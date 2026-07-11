// src/components/Header.tsx
"use client"; // Importante: como usamos localStorage, esto debe ser client component
import React from 'react';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  vistaActual: string;
  cambiarVista: (id: string) => void;
}

const NAV_ITEMS = [
  {
    id: 'inicio',
    label: 'Inicio',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 11.5 12 4l9 7.5" />
        <path d="M5.5 10v9a1 1 0 0 0 1 1H9a1 1 0 0 0 1-1v-3.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V19a1 1 0 0 0 1 1h2.5a1 1 0 0 0 1-1v-9" />
      </svg>
    ),
  },
  {
    id: 'facturas',
    label: 'Facturas',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6.5 3h11a1 1 0 0 1 1 1v16.2c0 .8-.85 1.3-1.55.9L14 19.4l-2 1.6-2-1.6-2.95 1.7c-.7.4-1.55-.1-1.55-.9V4a1 1 0 0 1 1-1Z" />
        <path d="M9 8.5h6M9 12h6" />
      </svg>
    ),
  },
  {
    id: 'resumen',
    label: 'Resumen',
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 20V10M12 20V4M20 20v-7" />
      </svg>
    ),
  },
];

export default function Header({ vistaActual, cambiarVista }: HeaderProps) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token'); // Borramos la llave digital
    router.push('/login'); // Mandamos al usuario al Login
  };

  return (
    <header className="sticky top-0 z-20 bg-white/75 backdrop-blur-xl border-b border-white/60 shadow-[0_6px_20px_-8px_rgba(26,37,48,0.18)]">
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 h-[64px] flex items-center justify-between gap-2 sm:gap-4">

        {/* Logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-10 h-10 rounded-[14px] bg-[#48BB78] flex items-center justify-center shadow-[4px_4px_10px_rgba(47,133,90,0.4),-2px_-2px_6px_rgba(255,255,255,0.5),inset_0_1px_1px_rgba(255,255,255,0.5)]">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#1A2530" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v18M16.5 6.5H10a3 3 0 1 0 0 6h4a3 3 0 1 1 0 6H6.5" />
            </svg>
          </div>
          <span className="hidden sm:block text-[17px] font-extrabold text-[#1A2530] tracking-tight">
            MyBalance
          </span>
        </div>

        {/* Nav */}
        <nav
          aria-label="Navegación principal"
          className="flex items-center gap-1 bg-[#EAF0ED] rounded-2xl p-1.5 shadow-[inset_3px_3px_7px_rgba(26,37,48,0.09),inset_-3px_-3px_7px_rgba(255,255,255,0.85)]"
        >
          {NAV_ITEMS.map(({ id, label, icon }) => {
            const isActive = vistaActual === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => cambiarVista(id)}
                aria-current={isActive ? 'page' : undefined}
                className={
                  isActive
                    ? 'flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-[13px] font-bold bg-[#48BB78] text-[#1A2530] shadow-[3px_3px_9px_rgba(47,133,90,0.4),inset_0_1px_1px_rgba(255,255,255,0.4)] transition-all duration-150 active:scale-95 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F855A] focus-visible:ring-offset-1'
                    : 'flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-[13px] font-semibold text-[#5B6B78] hover:text-[#1A2530] transition-colors duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F855A] focus-visible:ring-offset-1'
                }
              >
                {icon}
                <span className="hidden sm:inline">{label}</span>
              </button>
            );
          })}
        </nav>

        {/* Botón de Cerrar Sesión */}
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
          className="shrink-0 flex items-center justify-center gap-1.5 w-10 h-10 sm:w-auto sm:h-auto sm:px-4 sm:py-2.5 rounded-[14px] sm:rounded-2xl bg-[#FEF2F2] text-[#DC2626] font-bold text-[12px] shadow-[3px_3px_9px_rgba(220,38,38,0.15),-2px_-2px_6px_rgba(255,255,255,0.8)] transition-all duration-150 active:scale-95 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626] focus-visible:ring-offset-1"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5.5a1.5 1.5 0 0 1-1.5-1.5v-15A1.5 1.5 0 0 1 5.5 3H9M16 16.5 21 12l-5-4.5M21 12H9" />
          </svg>
          <span className="hidden sm:inline">Salir</span>
        </button>

      </div>
    </header>
  );
}