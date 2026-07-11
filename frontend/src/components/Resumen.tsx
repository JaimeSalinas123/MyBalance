// src/components/Resumen.tsx
"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/axios';

interface Transaccion {
  id: number;
  tipo: string;
  concepto: string;
  monto: number;
  fecha: string;
}

// Clases Claymorphism reutilizadas en esta pantalla
const CLAY_CARD =
  'bg-white rounded-[24px] shadow-[8px_8px_20px_rgba(26,37,48,0.10),-8px_-8px_20px_rgba(255,255,255,0.9)]';

export default function Resumen() {
  const [periodo, setPeriodo] = useState('Mes');
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const res = await api.get('/transacciones');
        setTransacciones(res.data);
      } catch (error) {
        console.error("Error al cargar datos para el resumen", error);
      }
    };
    cargarDatos();
  }, []);

  const parseFecha = (fechaStr: string) => {
    const meses: { [key: string]: number } = { ene: 0, feb: 1, mar: 2, abr: 3, may: 4, jun: 5, jul: 6, ago: 7, sep: 8, oct: 9, nov: 10, dic: 11 };
    const partes = String(fechaStr).replace('.', '').toLowerCase().split(' ');
    if (partes.length === 3) {
      return new Date(parseInt(partes[2]), meses[partes[1].substring(0, 3)], parseInt(partes[0]));
    }
    return new Date(); 
  };

  const calcularDatos = () => {
    const hoy = new Date();
    const hoyCero = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

    const datosFiltrados = transacciones.filter(t => {
      const fechaT = parseFecha(t.fecha);
      const diffTiempo = hoyCero.getTime() - fechaT.getTime();
      const diffDias = Math.floor(diffTiempo / (1000 * 60 * 60 * 24));

      if (periodo === 'Día') return diffDias === 0; 
      if (periodo === 'Semana') return diffDias >= 0 && diffDias <= 7; 
      if (periodo === 'Mes') return fechaT.getMonth() === hoyCero.getMonth() && fechaT.getFullYear() === hoyCero.getFullYear(); 
      return true;
    });

    let ing = 0;
    let gas = 0;
    let maxGasto = { monto: 0, concepto: 'Ninguno' };

    datosFiltrados.forEach(t => {
      if (t.tipo === 'ingreso') ing += t.monto;
      if (t.tipo === 'gasto') {
        gas += t.monto;
        if (t.monto > maxGasto.monto) {
          maxGasto = { monto: t.monto, concepto: t.concepto };
        }
      }
    });

    const ahorroNeto = ing - gas;
    let pctGas = ing > 0 ? Math.round((gas / ing) * 100) : (gas > 0 ? 100 : 0);
    if (pctGas > 100) pctGas = 100; 
    const pctAho = 100 - pctGas;

    let divisorDias = periodo === 'Día' ? 1 : (periodo === 'Semana' ? 7 : 30);
    const prom = gas / divisorDias;

    return {
      ingresos: ing.toLocaleString('en-US', { minimumFractionDigits: 2 }),
      gastos: gas.toLocaleString('en-US', { minimumFractionDigits: 2 }),
      ahorro: ahorroNeto.toLocaleString('en-US', { minimumFractionDigits: 2 }),
      pctGastos: pctGas,
      pctAhorro: pctAho,
      promedio: `$${prom.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      topGasto: maxGasto.concepto.length > 15 ? maxGasto.concepto.substring(0,15) + '...' : maxGasto.concepto
    };
  };

  const datosActuales = calcularDatos();

  return (
    <div className="w-full max-w-[900px] mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-16 sm:pb-20 flex flex-col gap-5">

      {/* ── Hero ── */}
      <div className="relative w-full overflow-hidden bg-[#1A2530] rounded-[24px] sm:rounded-[28px] p-7 sm:p-9 shadow-[10px_10px_26px_rgba(0,0,0,0.35),-8px_-8px_20px_rgba(255,255,255,0.03)]">
        <div className="pointer-events-none absolute -top-12 -right-6 w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-[radial-gradient(circle,rgba(72,187,120,0.35)_0%,transparent_68%)]" />
        <div className="pointer-events-none absolute -bottom-10 left-14 w-36 h-36 sm:w-40 sm:h-40 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.06)_0%,transparent_70%)]" />

        <div className="relative z-[1] flex items-end justify-between flex-wrap gap-5">
          <div>
            <div className="flex items-center gap-[7px] mb-2.5">
              <span className="text-[11px] font-semibold text-white/40 tracking-[0.08em] uppercase">Análisis</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#48BB78] inline-block animate-pulse motion-reduce:animate-none" />
            </div>
            <h2 className="text-[30px] sm:text-[36px] font-extrabold text-white m-0 tracking-tight leading-none">Resumen</h2>
            <p className="text-[14px] text-white/40 m-0 mt-2">Desempeño financiero por periodo</p>
          </div>

          <div className="flex items-center gap-1 bg-white/10 rounded-2xl p-1.5">
            {['Día', 'Semana', 'Mes'].map((p) => {
              const isActive = periodo === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriodo(p)}
                  className={
                    isActive
                      ? 'px-4 sm:px-5 py-2 rounded-xl text-[13px] font-bold bg-[#48BB78] text-[#1A2530] shadow-[2px_2px_7px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.4)] transition-all duration-150 active:scale-95 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#48BB78] focus-visible:ring-offset-1'
                      : 'px-4 sm:px-5 py-2 rounded-xl text-[13px] font-semibold text-white/45 hover:text-white/75 transition-colors duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-1'
                  }
                >
                  {p}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Ingresos */}
        <div className={`${CLAY_CARD} p-6`}>
          <div className="flex items-center gap-2 mb-3.5">
            <div className="w-2 h-2 rounded-full bg-[#48BB78]" />
            <span className="text-[11px] font-semibold text-[#94A3AF] uppercase tracking-[0.07em]">Ingresos</span>
          </div>
          <p className="text-[26px] sm:text-[28px] font-extrabold text-[#1A2530] m-0 tracking-tight tabular-nums">${datosActuales.ingresos}</p>
          <p className="text-[12px] text-[#94A3AF] m-0 mt-1">este periodo</p>
        </div>

        {/* Gastos */}
        <div className={`${CLAY_CARD} p-6`}>
          <div className="flex items-center gap-2 mb-3.5">
            <div className="w-2 h-2 rounded-full bg-[#FCA5A5]" />
            <span className="text-[11px] font-semibold text-[#94A3AF] uppercase tracking-[0.07em]">Gastos</span>
          </div>
          <p className="text-[26px] sm:text-[28px] font-extrabold text-[#1A2530] m-0 tracking-tight tabular-nums">${datosActuales.gastos}</p>
          <p className="text-[12px] text-[#94A3AF] m-0 mt-1">este periodo</p>
        </div>

        {/* Ahorro */}
        <div className="relative overflow-hidden bg-[#48BB78] rounded-[24px] p-6 shadow-[8px_8px_20px_rgba(47,133,90,0.28),-6px_-6px_16px_rgba(255,255,255,0.5),inset_0_1px_1px_rgba(255,255,255,0.4)]">
          <div className="pointer-events-none absolute -top-5 -right-5 w-24 h-24 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.35)_0%,transparent_70%)]" />
          <div className="relative flex items-center gap-2 mb-3.5">
            <div className="w-2 h-2 rounded-full bg-[#1A2530]/50" />
            <span className="text-[11px] font-semibold text-[#1A2530]/70 uppercase tracking-[0.07em]">Ahorro neto</span>
          </div>
          <p className="relative text-[26px] sm:text-[28px] font-extrabold text-[#1A2530] m-0 tracking-tight tabular-nums">${datosActuales.ahorro}</p>
          <p className="relative text-[12px] text-[#1A2530]/60 m-0 mt-1">este periodo</p>
        </div>
      </div>

      {/* Gráfico y Footer */}
      <div className={`${CLAY_CARD} p-6 sm:p-8`}>
        <div className="flex items-center justify-between mb-7">
          <h3 className="text-[15px] font-bold text-[#1A2530] m-0">Ingresos vs Gastos</h3>
          <span className="text-[11px] font-bold text-[#2F855A] bg-[#DCF6E7] px-3 py-1 rounded-full">Este periodo</span>
        </div>

        <div className="flex flex-col gap-5">
          {[
            { label: 'Ingresos', pct: 100, color: '#48BB78', value: `$${datosActuales.ingresos}` },
            { label: 'Gastos',   pct: datosActuales.pctGastos, color: '#F87171', value: `$${datosActuales.gastos}` },
            { label: 'Ahorro',   pct: datosActuales.pctAhorro, color: '#48BB78', value: `$${datosActuales.ahorro}` },
          ].map(({ label, pct, color, value }) => (
            <div key={label}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ background: color }} />
                  <span className="text-[12px] font-semibold text-[#5B6B78] uppercase tracking-[0.06em]">{label}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-[13px] font-bold text-[#1A2530] tabular-nums">{value}</span>
                  <span className="text-[11px] text-[#94A3AF] min-w-[34px] text-right tabular-nums">{pct}%</span>
                </div>
              </div>
              <div className="w-full h-[10px] bg-[#EEF1EF] rounded-full overflow-hidden shadow-[inset_2px_2px_5px_rgba(26,37,48,0.08)]">
                <div className="h-full rounded-full transition-all duration-700 ease-out motion-reduce:transition-none" style={{ width: `${pct}%`, background: color }} />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-7 pt-6 border-t border-[#EDF1EF] grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Gasto Promedio Diario', value: datosActuales.promedio },
            { label: 'Mayor Gasto Registrado', value: datosActuales.topGasto },
          ].map(({ label, value }) => (
            <div key={label} className="bg-[#F5F8F6] rounded-[16px] px-5 py-4">
              <p className="text-[11px] font-semibold text-[#94A3AF] uppercase tracking-[0.07em] m-0 mb-1.5">{label}</p>
              <p className="text-[17px] sm:text-[18px] font-extrabold text-[#1A2530] m-0 tracking-tight tabular-nums">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}