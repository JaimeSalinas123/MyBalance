// src/app/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios'; 
import Header from '@/components/Header'; 

import Facturas from '@/components/Facturas'; 
import Resumen from '@/components/Resumen';

interface Movimiento {
  id: number;
  tipo: string;
  concepto: string;
  monto: number;
  fecha: string;
}

interface Totales {
  balance: number;
  ingresos: number;
  gastos: number;
}

// Clases Claymorphism reutilizadas en esta pantalla
const CLAY_CARD =
  'bg-white rounded-[28px] p-6 sm:p-8 flex flex-col shadow-[8px_8px_20px_rgba(26,37,48,0.10),-8px_-8px_20px_rgba(255,255,255,0.9)]';
const CLAY_ROW =
  'flex items-center justify-between gap-3 px-4 py-3.5 bg-[#F5F8F6] rounded-[16px] shadow-[3px_3px_8px_rgba(26,37,48,0.05),-3px_-3px_8px_rgba(255,255,255,0.7)]';
const CLAY_INPUT =
  'w-full px-4 py-3.5 bg-[#F3F6F5] rounded-[16px] text-[15px] text-[#1A2530] outline-none shadow-[inset_4px_4px_9px_rgba(26,37,48,0.08),inset_-4px_-4px_9px_rgba(255,255,255,0.8)] focus:shadow-[inset_4px_4px_9px_rgba(26,37,48,0.12),inset_-4px_-4px_9px_rgba(255,255,255,0.8),0_0_0_3px_rgba(47,133,90,0.22)] transition-shadow duration-200 placeholder:text-[#B0BAC2]';
const CLAY_BUTTON_PRIMARY =
  'bg-[#48BB78] text-[#1A2530] shadow-[5px_5px_12px_rgba(47,133,90,0.35),inset_0_1px_1px_rgba(255,255,255,0.4)] hover:brightness-[1.03] active:scale-[0.98] active:shadow-[inset_3px_3px_7px_rgba(0,0,0,0.15)] transition-all duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F855A] focus-visible:ring-offset-2';

export default function Dashboard() {
  const router = useRouter();
  
  const [vistaActual, setVistaActual] = useState('inicio');
  const [ingreso, setIngreso] = useState({ monto: '', concepto: '' });
  const [totales, setTotales] = useState<Totales>({ balance: 0, ingresos: 0, gastos: 0 });
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [transaccionAEliminar, setTransaccionAEliminar] = useState<number | null>(null);

  const cargarBalance = async () => {
    try {
      const res = await api.get('/transacciones');
      const data: Movimiento[] = res.data;

      let sumIngresos = 0;
      let sumGastos = 0;

      data.forEach(t => {
        if (t.tipo === 'ingreso') sumIngresos += t.monto;
        if (t.tipo === 'gasto') sumGastos += t.monto;
      });

      setTotales({
        ingresos: sumIngresos,
        gastos: sumGastos,
        balance: sumIngresos - sumGastos
      });

      setMovimientos(data);
    } catch (error) {
      console.error("Error al cargar balance", error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      cargarBalance();
    }
  }, [router]);

  const guardarIngreso = async () => {
    if (!ingreso.monto || !ingreso.concepto.trim()) {
      alert('Por favor, completa el monto y el concepto.');
      return;
    }

    const dateObj = new Date();
    const fechaActual = dateObj.toLocaleDateString('es-SV', { day: '2-digit', month: 'short', year: 'numeric' });

    const payload = {
      tipo: 'ingreso',
      concepto: ingreso.concepto.trim(),
      monto: parseFloat(ingreso.monto),
      fecha: fechaActual
    };

    try {
      await api.post('/transacciones', payload);
      setIngreso({ monto: '', concepto: '' }); 
      cargarBalance(); 
    } catch (error) {
      alert('Error al guardar el ingreso.');
    }
  };

  const iniciarEliminacion = (id: number) => {
    setTransaccionAEliminar(id);
  };

  const cancelarEliminacion = () => {
    setTransaccionAEliminar(null);
  };

  const confirmarEliminacion = async () => {
    if (!transaccionAEliminar) return;

    try {
      await api.delete(`/transacciones/${transaccionAEliminar}`);
      cargarBalance(); 
      setTransaccionAEliminar(null); 
    } catch (error) {
      alert("Hubo un problema al eliminar el registro.");
    }
  };

  const formatearDinero = (cantidad: number) => {
    return cantidad.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

return (
    <div className="min-h-screen bg-[#EEF3F1]" style={{ fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, -apple-system, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');`}</style>

      <Header vistaActual={vistaActual} cambiarVista={setVistaActual} />
      
      {vistaActual === 'inicio' && (
        <div className="w-full max-w-[900px] mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-16 sm:pb-20 flex flex-col gap-5">

          {/* ── Hero: Tarjeta de Balance ── */}
          <div className="relative w-full overflow-hidden bg-[#1A2530] rounded-[28px] sm:rounded-[32px] p-7 sm:p-10 min-h-[190px] sm:min-h-[200px] shadow-[10px_10px_26px_rgba(0,0,0,0.35),-8px_-8px_20px_rgba(255,255,255,0.03)]">
            <div className="pointer-events-none absolute -top-14 -right-8 w-56 h-56 sm:w-72 sm:h-72 rounded-full bg-[radial-gradient(circle,rgba(72,187,120,0.35)_0%,transparent_70%)]" />
            <div className="pointer-events-none absolute -bottom-10 left-16 w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.06)_0%,transparent_70%)]" />

            <div className="relative z-[1]">
              <div className="flex items-center gap-2 mb-5">
                <span className="text-[11px] sm:text-[12px] font-semibold text-white/45 tracking-[0.08em] uppercase">Balance Actual</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#48BB78] inline-block animate-pulse motion-reduce:animate-none" />
              </div>

              <div className="flex items-end gap-1 mb-7 sm:mb-8">
                <span className="text-[42px] sm:text-[52px] md:text-[64px] font-extrabold text-white leading-none tracking-tight tabular-nums">
                  ${Math.trunc(totales.balance).toLocaleString('en-US')}
                </span>
                <span className="text-[20px] sm:text-[26px] md:text-[32px] font-normal text-white/35 leading-none mb-[2px] sm:mb-[6px] tabular-nums">
                  .{Math.abs(totales.balance).toFixed(2).split('.')[1] || '00'}
                </span>
              </div>

              <div className="flex items-center gap-5 sm:gap-6">
                <div>
                  <div className="text-[10px] sm:text-[11px] font-semibold text-white/40 mb-[3px] uppercase tracking-[0.06em]">Ingresos</div>
                  <div className="text-[15px] sm:text-[16px] font-bold text-[#48BB78] tabular-nums">+${formatearDinero(totales.ingresos)}</div>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div>
                  <div className="text-[10px] sm:text-[11px] font-semibold text-white/40 mb-[3px] uppercase tracking-[0.06em]">Gastos</div>
                  <div className="text-[15px] sm:text-[16px] font-bold text-[#F87171] tabular-nums">-${formatearDinero(totales.gastos)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Grid Principal ── */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">

            {/* ── Izquierda: Añadir Ingreso ── */}
            <div className={CLAY_CARD}>
              <div className="flex items-center gap-3 mb-7">
                <div className="w-10 h-10 rounded-[14px] bg-[#48BB78] flex items-center justify-center shrink-0 shadow-[3px_3px_8px_rgba(47,133,90,0.35),inset_0_1px_1px_rgba(255,255,255,0.4)]">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 4V14M4 9H14" stroke="#1A2530" strokeWidth="2.2" strokeLinecap="round"/></svg>
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-[#1A2530] m-0">Añadir Ingreso</h3>
                  <p className="text-[13px] text-[#8A97A3] m-0">Suma a tu balance</p>
                </div>
              </div>

              <div className="flex flex-col gap-4 flex-grow">
                <div>
                  <label className="block text-[12px] font-semibold text-[#5B6B78] mb-2 uppercase tracking-[0.06em]">Monto</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[15px] font-semibold text-[#94A3AF]">$</span>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={ingreso.monto}
                      onChange={(e) => setIngreso({ ...ingreso, monto: e.target.value })}
                      className={`${CLAY_INPUT} pl-8 font-semibold`}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-[#5B6B78] mb-2 uppercase tracking-[0.06em]">Concepto</label>
                  <input
                    type="text"
                    placeholder="Ej. Pago de proyecto"
                    value={ingreso.concepto}
                    onChange={(e) => setIngreso({ ...ingreso, concepto: e.target.value })}
                    className={CLAY_INPUT}
                  />
                </div>

                <div className="flex-grow" />

                <button type="button" onClick={guardarIngreso} className={`w-full py-3.5 rounded-[16px] text-[15px] font-bold mt-1 ${CLAY_BUTTON_PRIMARY}`}>
                  Guardar Ingreso
                </button>
              </div>
            </div>

            {/* ── Derecha: Movimientos Recientes ── */}
            <div className={CLAY_CARD}>
              <div className="flex items-center justify-between mb-7">
                <div>
                  <h3 className="text-[16px] font-bold text-[#1A2530] m-0">Movimientos Recientes</h3>
                  <p className="text-[13px] text-[#8A97A3] m-0">Tus últimas transacciones</p>
                </div>
                <button
                  type="button"
                  onClick={() => setMostrarModal(true)}
                  className="shrink-0 bg-[#DCF6E7] text-[#2F855A] text-[12px] font-bold px-3.5 py-2 rounded-full hover:brightness-95 active:scale-95 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F855A] focus-visible:ring-offset-1"
                >
                  Ver todos
                </button>
              </div>

              {movimientos.length === 0 ? (
                <div className="flex-grow flex flex-col items-center justify-center gap-3 py-6 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-[#F3F6F5] flex items-center justify-center shadow-[inset_3px_3px_7px_rgba(26,37,48,0.07),inset_-3px_-3px_7px_rgba(255,255,255,0.8)]">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B0BAC2" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7h18M3 7v12a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V7M3 7l2-4h14l2 4M9 11h6"/></svg>
                  </div>
                  <p className="text-[14px] text-[#94A3AF] font-medium">No hay movimientos aún.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {movimientos.slice(0, 5).map(mov => (
                    <div key={mov.id} className={CLAY_ROW}>
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${mov.tipo === 'ingreso' ? 'bg-[#48BB78]' : 'bg-[#FCA5A5]'}`} />
                        <div className="min-w-0">
                          <div className="text-[14px] font-semibold text-[#1A2530] truncate max-w-[110px] sm:max-w-[170px]">{mov.concepto}</div>
                          <div className="text-[11px] text-[#94A3AF] mt-[2px]">{mov.fecha}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5 shrink-0">
                        <div className={`text-[14px] font-bold tabular-nums ${mov.tipo === 'ingreso' ? 'text-[#2F855A]' : 'text-[#1A2530]'}`}>
                          {mov.tipo === 'ingreso' ? '+' : '-'}${formatearDinero(mov.monto)}
                        </div>
                        <button
                          type="button"
                          onClick={() => iniciarEliminacion(mov.id)}
                          aria-label="Eliminar registro"
                          title="Eliminar registro"
                          className="p-1.5 rounded-lg hover:bg-[#FEF2F2] active:scale-90 transition-all duration-150"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* ── MODALES ── */}
          {mostrarModal && (
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="historial-titulo"
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-[#1A2530]/60 backdrop-blur-sm"
            >
              <div className="w-full max-w-[600px] max-h-[85vh] flex flex-col bg-white rounded-[28px] sm:rounded-[32px] overflow-hidden shadow-[0_25px_60px_rgba(26,37,48,0.35)]">
                <div className="flex items-center justify-between gap-4 px-6 sm:px-8 py-5 sm:py-6 border-b border-[#EDF1EF] shrink-0">
                  <div>
                    <h2 id="historial-titulo" className="text-[19px] sm:text-[20px] font-extrabold text-[#1A2530] m-0">Historial Completo</h2>
                    <p className="text-[13px] text-[#5B6B78] m-0 mt-1">Todos tus ingresos y gastos registrados</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMostrarModal(false)}
                    aria-label="Cerrar historial"
                    className="shrink-0 w-9 h-9 rounded-full bg-[#F3F6F5] flex items-center justify-center text-[#5B6B78] shadow-[2px_2px_6px_rgba(26,37,48,0.08)] active:scale-90 transition-transform duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F855A]"
                  >
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </div>

                <div className="px-6 sm:px-8 py-5 sm:py-6 overflow-y-auto flex-grow">
                  <div className="flex flex-col gap-2.5">
                    {movimientos.map(mov => (
                      <div key={mov.id} className={CLAY_ROW}>
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${mov.tipo === 'ingreso' ? 'bg-[#48BB78]' : 'bg-[#FCA5A5]'}`} />
                          <div className="min-w-0">
                            <div className="text-[14px] sm:text-[15px] font-semibold text-[#1A2530] truncate max-w-[160px] sm:max-w-[320px]">{mov.concepto}</div>
                            <div className="text-[12px] text-[#94A3AF] mt-[2px]">{mov.fecha}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          <div className={`text-[14px] sm:text-[15px] font-bold tabular-nums ${mov.tipo === 'ingreso' ? 'text-[#2F855A]' : 'text-[#1A2530]'}`}>
                            {mov.tipo === 'ingreso' ? '+' : '-'}${formatearDinero(mov.monto)}
                          </div>
                          <button
                            type="button"
                            onClick={() => iniciarEliminacion(mov.id)}
                            aria-label="Eliminar registro"
                            className="p-1.5 rounded-lg hover:bg-[#FEF2F2] active:scale-90 transition-all duration-150"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/></svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {transaccionAEliminar !== null && (
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="confirmar-titulo"
              className="fixed inset-0 z-[200] flex items-center justify-center p-5 bg-[#1A2530]/50 backdrop-blur-[3px]"
            >
              <div className="w-full max-w-[400px] bg-white rounded-[24px] p-7 sm:p-8 flex flex-col items-center text-center shadow-[0_20px_45px_-5px_rgba(26,37,48,0.3),0_10px_20px_-6px_rgba(26,37,48,0.12)]">

                <div className="w-14 h-14 rounded-full bg-[#FEF2F2] flex items-center justify-center mb-5">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                </div>

                <h3 id="confirmar-titulo" className="text-[20px] font-extrabold text-[#1A2530] m-0 mb-2">¿Eliminar movimiento?</h3>
                <p className="text-[14px] text-[#5B6B78] m-0 mb-6 leading-relaxed">
                  Esta acción no se puede deshacer. Se restará del balance general de tus finanzas.
                </p>

                <div className="flex gap-3 w-full">
                  <button
                    type="button"
                    onClick={cancelarEliminacion}
                    className="flex-1 py-3 rounded-[14px] bg-[#F1F5F3] text-[#475569] text-[14px] font-bold shadow-[inset_2px_2px_5px_rgba(26,37,48,0.06)] active:scale-[0.97] transition-transform duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B6B78] focus-visible:ring-offset-2"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={confirmarEliminacion}
                    className="flex-1 py-3 rounded-[14px] bg-[#DC2626] text-white text-[14px] font-bold shadow-[4px_4px_10px_rgba(220,38,38,0.35),inset_0_1px_1px_rgba(255,255,255,0.25)] active:scale-[0.97] transition-transform duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626] focus-visible:ring-offset-2"
                  >
                    Sí, eliminar
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>
      )}

      {/* ── AQUÍ VAN TUS NUEVAS PANTALLAS ── */}
      {vistaActual === 'facturas' && <Facturas />}
      {vistaActual === 'resumen' && <Resumen />}
    </div>
  );
}