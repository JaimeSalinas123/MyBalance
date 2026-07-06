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

  const cardStyle: React.CSSProperties = {
    background: '#FFFFFF',
    borderRadius: '20px',
    border: '1px solid rgba(0,0,0,0.07)',
    padding: '32px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    display: 'flex',
    flexDirection: 'column'
  };

return (
    <>
      <Header vistaActual={vistaActual} cambiarVista={setVistaActual} />
      
      {vistaActual === 'inicio' && (
        <div style={{ 
          width: '100%', /* 💡 NUEVO: Fuerza a ocupar todo el espacio */
          maxWidth: '900px', 
          margin: '0 auto', 
          padding: '40px 24px 80px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '20px' 
        }}>

          {/* ── Hero: Tarjeta de Balance ── */}
          <div style={{ 
            width: '100%', /* 💡 NUEVO */
            background: '#0A0F1E', 
            borderRadius: '24px', 
            padding: '40px', 
            position: 'relative', 
            overflow: 'hidden', 
            minHeight: '200px' 
          }}>
            <div style={{ position: 'absolute', top: '-60px', right: '-40px', width: '280px', height: '280px', background: 'radial-gradient(circle, rgba(29,107,243,0.35) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '-40px', left: '80px', width: '180px', height: '180px', background: 'radial-gradient(circle, rgba(99,179,237,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Balance Actual</span>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22D3EE', display: 'inline-block' }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', marginBottom: '32px' }}>
                <span style={{ fontSize: '64px', fontWeight: '800', color: '#FFFFFF', lineHeight: '1', letterSpacing: '-2px' }}>
                  ${Math.trunc(totales.balance).toLocaleString('en-US')}
                </span>
                <span style={{ fontSize: '32px', fontWeight: '400', color: 'rgba(255,255,255,0.35)', lineHeight: '1', marginBottom: '6px' }}>
                  .{Math.abs(totales.balance).toFixed(2).split('.')[1] || '00'}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '24px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Ingresos</div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#4ADE80' }}>+${formatearDinero(totales.ingresos)}</div>
                </div>
                <div style={{ width: '1px', background: 'rgba(255,255,255,0.08)' }} />
                <div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Gastos</div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#F87171' }}>-${formatearDinero(totales.gastos)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Grid Principal ── */}
          <div style={{ 
            width: '100%', /* 💡 NUEVO: Asegura que el grid tenga espacio para expandirse */
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '16px' 
          }}>

            {/* ── Izquierda: Añadir Ingreso ── */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#1D6BF3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 4V14M4 9H14" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', margin: 0 }}>Añadir Ingreso</h3>
                  <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0 }}>Suma a tu balance</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flexGrow: 1 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Monto</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '15px', fontWeight: '600', color: '#94A3B8' }}>$</span>
                    <input type="number" placeholder="0.00" value={ingreso.monto} onChange={(e) => setIngreso({ ...ingreso, monto: e.target.value })} style={{ width: '100%', paddingLeft: '32px', paddingRight: '16px', paddingTop: '13px', paddingBottom: '13px', background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: '12px', fontSize: '16px', fontWeight: '600', color: '#0F172A', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Concepto</label>
                  <input type="text" placeholder="Ej. Pago de proyecto" value={ingreso.concepto} onChange={(e) => setIngreso({ ...ingreso, concepto: e.target.value })} style={{ width: '100%', padding: '13px 16px', background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: '12px', fontSize: '15px', color: '#0F172A', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                
                <div style={{ flexGrow: 1 }}></div>

                <button type="button" onClick={guardarIngreso} style={{ width: '100%', padding: '14px', background: '#1D6BF3', color: '#FFFFFF', fontSize: '15px', fontWeight: '700', borderRadius: '12px', border: 'none', cursor: 'pointer', marginTop: '4px' }}>Guardar Ingreso</button>
              </div>
            </div>

            {/* ── Derecha: Movimientos Recientes ── */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', margin: 0 }}>Movimientos Recientes</h3>
                  <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0 }}>Tus últimas transacciones</p>
                </div>
                <button 
                  onClick={() => setMostrarModal(true)} 
                  style={{ background: '#EFF6FF', color: '#1D6BF3', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Ver todos
                </button>
              </div>

              {movimientos.length === 0 ? (
                <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <p style={{ fontSize: '14px', color: '#94A3B8', textAlign: 'center' }}>No hay movimientos aún.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {movimientos.slice(0, 5).map(mov => (
                    <div key={mov.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: mov.tipo === 'ingreso' ? '#4ADE80' : '#F87171' }} />
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: '#0F172A', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '120px' }}>{mov.concepto}</div>
                          <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>{mov.fecha}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: mov.tipo === 'ingreso' ? '#4ADE80' : '#0F172A' }}>
                          {mov.tipo === 'ingreso' ? '+' : '-'}${formatearDinero(mov.monto)}
                        </div>
                        <button onClick={() => iniciarEliminacion(mov.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }} title="Eliminar registro">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/></svg>
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
            <div style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
              zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px'
            }}>
              <div style={{
                background: '#FFFFFF', borderRadius: '24px', width: '100%', maxWidth: '600px',
                maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
              }}>
                <div style={{ padding: '24px 32px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', margin: 0 }}>Historial Completo</h2>
                    <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0' }}>Todos tus ingresos y gastos registrados</p>
                  </div>
                  <button onClick={() => setMostrarModal(false)} style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', color: '#64748B' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </div>

                <div style={{ padding: '24px 32px', overflowY: 'auto', flexGrow: 1 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {movimientos.map(mov => (
                      <div key={mov.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: mov.tipo === 'ingreso' ? '#4ADE80' : '#F87171' }} />
                          <div>
                            <div style={{ fontSize: '15px', fontWeight: '600', color: '#0F172A' }}>{mov.concepto}</div>
                            <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>{mov.fecha}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                          <div style={{ fontSize: '15px', fontWeight: '700', color: mov.tipo === 'ingreso' ? '#4ADE80' : '#0F172A' }}>
                            {mov.tipo === 'ingreso' ? '+' : '-'}${formatearDinero(mov.monto)}
                          </div>
                          <button onClick={() => iniciarEliminacion(mov.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/></svg>
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
            <div style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(3px)',
              zIndex: 200, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px'
            }}>
              <div style={{
                background: '#FFFFFF', borderRadius: '20px', width: '100%', maxWidth: '400px',
                padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                textAlign: 'center'
              }}>
                
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                </div>

                <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', margin: '0 0 8px' }}>¿Eliminar movimiento?</h3>
                <p style={{ fontSize: '14px', color: '#64748B', margin: '0 0 24px', lineHeight: '1.5' }}>
                  Esta acción no se puede deshacer. Se restará del balance general de tus finanzas.
                </p>

                <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                  <button 
                    onClick={cancelarEliminacion}
                    style={{ flex: 1, padding: '12px', background: '#F1F5F9', color: '#475569', fontSize: '14px', fontWeight: '700', borderRadius: '12px', border: 'none', cursor: 'pointer' }}
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={confirmarEliminacion}
                    style={{ flex: 1, padding: '12px', background: '#EF4444', color: '#FFFFFF', fontSize: '14px', fontWeight: '700', borderRadius: '12px', border: 'none', cursor: 'pointer' }}
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
    </>
  );
}