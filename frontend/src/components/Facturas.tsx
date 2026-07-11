// src/components/Facturas.tsx
"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/axios'; // Importamos Axios

interface Factura {
  id: number;
  tipo: string;
  concepto: string;
  monto: number;
  fecha: string;
}

// Clases Claymorphism reutilizadas en esta pantalla
const CLAY_CARD =
  'bg-white rounded-[28px] shadow-[8px_8px_20px_rgba(26,37,48,0.10),-8px_-8px_20px_rgba(255,255,255,0.9)]';
const CLAY_INPUT =
  'w-full px-4 py-3 bg-[#F3F6F5] rounded-[14px] text-[14px] text-[#1A2530] outline-none shadow-[inset_3px_3px_7px_rgba(26,37,48,0.08),inset_-3px_-3px_7px_rgba(255,255,255,0.8)] focus:shadow-[inset_3px_3px_7px_rgba(26,37,48,0.12),inset_-3px_-3px_7px_rgba(255,255,255,0.8),0_0_0_3px_rgba(47,133,90,0.22)] transition-shadow duration-200 placeholder:text-[#B0BAC2]';
const CLAY_LABEL = 'block text-[11px] font-semibold text-[#5B6B78] mb-2 uppercase tracking-[0.07em]';

export default function Facturas() {
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [form, setForm] = useState({ concepto: '', monto: '', fecha: '' });
  const [error, setError] = useState('');

  const cargarFacturas = async () => {
    try {
      // Usamos api.get en lugar de fetch
      const res = await api.get('/transacciones');
      const data: Factura[] = res.data;
      const soloGastos = data.filter(t => t.tipo === 'gasto');
      setFacturas(soloGastos);
    } catch (error) {
      console.error("Error al cargar la base de datos", error);
    }
  };

  useEffect(() => {
    cargarFacturas();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleAdd = async () => {
    if (!form.concepto.trim() || !form.monto || !form.fecha) {
      setError('Completa todos los campos.');
      return;
    }

    const dateObj = new Date(form.fecha + 'T00:00:00');
    const labelFecha = dateObj.toLocaleDateString('es-SV', { day: '2-digit', month: 'short', year: 'numeric' });

    const payload = {
      tipo: 'gasto',
      concepto: form.concepto.trim(),
      monto: parseFloat(form.monto),
      fecha: labelFecha
    };

    try {
      await api.post('/transacciones', payload);
      setForm({ concepto: '', monto: '', fecha: '' });
      cargarFacturas(); 
    } catch (error) {
      setError('Asegúrate de que el backend esté encendido.');
    }
  };

  const total = facturas.reduce((acc, f) => acc + f.monto, 0);

  return (
    <div className="w-full max-w-[900px] mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-16 sm:pb-20 flex flex-col gap-5">
      
      {/* Hero */}
      <div className="relative w-full overflow-hidden bg-[#1A2530] rounded-[24px] sm:rounded-[28px] p-7 sm:p-9 shadow-[10px_10px_26px_rgba(0,0,0,0.35),-8px_-8px_20px_rgba(255,255,255,0.03)]">
        <div className="pointer-events-none absolute -top-12 -right-6 w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-[radial-gradient(circle,rgba(72,187,120,0.35)_0%,transparent_68%)]" />
        <div className="relative z-[1] flex items-end justify-between flex-wrap gap-5">
          <div>
            <div className="flex items-center gap-[7px] mb-2.5">
              <span className="text-[11px] font-semibold text-white/40 tracking-[0.08em] uppercase">Historial</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#48BB78] inline-block animate-pulse motion-reduce:animate-none" />
            </div>
            <h2 className="text-[30px] sm:text-[36px] font-extrabold text-white m-0 tracking-tight leading-none">Mis Facturas</h2>
            <p className="text-[14px] text-white/40 m-0 mt-2">Registros y recibos de tus movimientos</p>
          </div>
          <div className="flex items-center gap-5">
            <div>
              <div className="text-[10px] text-white/40 mb-[3px] uppercase tracking-[0.06em]">Registros</div>
              <div className="text-[20px] sm:text-[22px] font-bold text-white tabular-nums">{facturas.length}</div>
            </div>
            <div className="w-px h-7 bg-white/10" />
            <div>
              <div className="text-[10px] text-white/40 mb-[3px] uppercase tracking-[0.06em]">Total</div>
              <div className="text-[20px] sm:text-[22px] font-bold text-[#F87171] tabular-nums">$-{total.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className={`${CLAY_CARD} p-6 sm:p-8`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-[14px] bg-[#48BB78] flex items-center justify-center shrink-0 shadow-[3px_3px_8px_rgba(47,133,90,0.35),inset_0_1px_1px_rgba(255,255,255,0.4)]">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 4V14M4 9H14" stroke="#1A2530" strokeWidth="2.2" strokeLinecap="round"/></svg>
          </div>
          <div>
            <h3 className="text-[16px] font-bold text-[#1A2530] m-0">Agregar Factura</h3>
            <p className="text-[13px] text-[#8A97A3] m-0">Registra un nuevo gasto</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div>
            <label className={CLAY_LABEL}>Nombre</label>
            <input name="concepto" type="text" placeholder="Ej. Factura de luz" value={form.concepto} onChange={handleChange} className={CLAY_INPUT} />
          </div>
          <div>
            <label className={CLAY_LABEL}>Costo ($)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] font-semibold text-[#94A3AF]">$</span>
              <input name="monto" type="number" placeholder="0.00" value={form.monto} onChange={handleChange} className={`${CLAY_INPUT} pl-8 font-semibold`} />
            </div>
          </div>
          <div>
            <label className={CLAY_LABEL}>Fecha</label>
            <input name="fecha" type="date" value={form.fecha} onChange={handleChange} className={CLAY_INPUT} />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 mt-4 px-4 py-2.5 rounded-[12px] bg-[#FEF2F2] text-[#DC2626] text-[13px] font-semibold">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16h.01" /></svg>
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleAdd}
          className="mt-5 px-7 py-3.5 rounded-[14px] bg-[#48BB78] text-[#1A2530] text-[14px] font-bold shadow-[5px_5px_12px_rgba(47,133,90,0.35),inset_0_1px_1px_rgba(255,255,255,0.4)] hover:brightness-[1.03] active:scale-[0.97] active:shadow-[inset_3px_3px_7px_rgba(0,0,0,0.15)] transition-all duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F855A] focus-visible:ring-offset-2"
        >
          Guardar Factura
        </button>
      </div>

      {/* Lista de facturas */}
      <div className={`${CLAY_CARD} p-3 sm:p-4`}>
        {facturas.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#F3F6F5] flex items-center justify-center shadow-[inset_3px_3px_7px_rgba(26,37,48,0.07),inset_-3px_-3px_7px_rgba(255,255,255,0.8)]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B0BAC2" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M7 3h10a1 1 0 0 1 1 1v16l-3-2-2 2-2-2-2 2-3-2V4a1 1 0 0 1 1-1Z" /><path d="M9 8h6M9 12h6" /></svg>
            </div>
            <p className="text-[14px] text-[#94A3AF] font-medium">No hay facturas aún. ¡Agrega la primera!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {facturas.map((f) => (
              <div key={f.id} className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 sm:py-4 bg-[#F5F8F6] rounded-[16px] shadow-[3px_3px_8px_rgba(26,37,48,0.05),-3px_-3px_8px_rgba(255,255,255,0.7)]">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-[#FCA5A5] shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[14px] sm:text-[15px] font-semibold text-[#1A2530] truncate max-w-[140px] sm:max-w-[300px]">{f.concepto}</div>
                    <div className="text-[11px] text-[#94A3AF] mt-[2px]">{f.fecha}</div>
                  </div>
                </div>
                <div className="text-[14px] sm:text-[15px] font-bold text-[#DC2626] tabular-nums shrink-0">−${f.monto.toFixed(2)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}