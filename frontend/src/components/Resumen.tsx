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

  const card = {
    background: '#FFFFFF', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase',
  };

  return (
    <div style={{ width: '100%', maxWidth: '900px', margin: '0 auto', padding: '40px 24px 80px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* ── Hero ── */}
      <div style={{ width: '100%', background: '#0A0F1E', borderRadius: '20px', padding: '32px 36px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-50px', right: '-30px', width: '220px', height: '220px', background: 'radial-gradient(circle, rgba(29,107,243,0.38) 0%, transparent 68%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-40px', left: '60px', width: '160px', height: '160px', background: 'radial-gradient(circle, rgba(99,179,237,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '10px' }}>
              <span style={labelStyle}>Análisis</span>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22D3EE', display: 'inline-block' }} />
            </div>
            <h2 style={{ fontSize: '36px', fontWeight: 800, color: '#FFFFFF', margin: 0, letterSpacing: '-1px', lineHeight: '1' }}>Resumen</h2>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', margin: '8px 0 0' }}>Desempeño financiero por periodo</p>
          </div>

          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.07)', borderRadius: '12px', padding: '4px', gap: '2px' }}>
            {['Día', 'Semana', 'Mes'].map((p) => {
              const isActive = periodo === p;
              return (
                <button
                  key={p}
                  onClick={() => setPeriodo(p)}
                  style={{
                    padding: '7px 18px', borderRadius: '9px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 700, fontFamily: 'inherit',
                    background: isActive ? '#1D6BF3' : 'transparent', color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.45)', transition: 'all 0.15s',
                  }}
                >
                  {p}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        {/* Ingresos */}
        <div style={{ ...card, padding: '24px 26px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ADE80' }} />
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Ingresos</span>
          </div>
          <p style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.5px' }}>${datosActuales.ingresos}</p>
          <p style={{ fontSize: '12px', color: '#94A3B8', margin: '4px 0 0' }}>este periodo</p>
        </div>

        {/* Gastos */}
        <div style={{ ...card, padding: '24px 26px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F87171' }} />
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Gastos</span>
          </div>
          <p style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.5px' }}>${datosActuales.gastos}</p>
          <p style={{ fontSize: '12px', color: '#94A3B8', margin: '4px 0 0' }}>este periodo</p>
        </div>

        {/* Ahorro */}
        <div style={{ background: '#1D6BF3', borderRadius: '20px', padding: '24px 26px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.6)' }} />
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Ahorro neto</span>
          </div>
          <p style={{ fontSize: '28px', fontWeight: 800, color: '#FFFFFF', margin: 0, letterSpacing: '-0.5px' }}>${datosActuales.ahorro}</p>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', margin: '4px 0 0' }}>este periodo</p>
        </div>
      </div>

      {/* Gráfico y Footer */}
      <div style={{ ...card, padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: 0 }}>Ingresos vs Gastos</h3>
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#1D6BF3', background: '#EFF6FF', padding: '4px 12px', borderRadius: '20px' }}>Este periodo</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {[
            { label: 'Ingresos', pct: 100, color: '#1D6BF3', value: `$${datosActuales.ingresos}` },
            { label: 'Gastos',   pct: datosActuales.pctGastos, color: '#F87171', value: `$${datosActuales.gastos}` },
            { label: 'Ahorro',   pct: datosActuales.pctAhorro, color: '#4ADE80', value: `$${datosActuales.ahorro}` },
          ].map(({ label, pct, color, value }) => (
            <div key={label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, display: 'inline-block' }} />
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>{value}</span>
                  <span style={{ fontSize: '11px', color: '#94A3B8', minWidth: '36px', textAlign: 'right' }}>{pct}%</span>
                </div>
              </div>
              <div style={{ width: '100%', height: '10px', background: '#F1F5F9', borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '99px', transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '28px', paddingTop: '24px', borderTop: '1px solid rgba(0,0,0,0.05)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
          {[
            { label: 'Gasto Promedio Diario', value: datosActuales.promedio },
            { label: 'Mayor Gasto Registrado', value: datosActuales.topGasto },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: '#F8FAFC', borderRadius: '14px', padding: '16px 20px' }}>
              <p style={{ fontSize: '11px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 6px' }}>{label}</p>
              <p style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.5px' }}>{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}