// src/pages/Facturas.jsx
import { useState, useEffect } from 'react';

export default function Facturas() {
  const [facturas, setFacturas] = useState([]);
  const [form, setForm] = useState({ concepto: '', monto: '', fecha: '' });
  const [error, setError] = useState('');

  // 1. Función para traer los datos del backend
  const cargarFacturas = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/transacciones');
      const data = await res.json();
      // Filtramos solo los gastos para esta pantalla
      const soloGastos = data.filter(t => t.tipo === 'gasto');
      setFacturas(soloGastos);
    } catch (error) {
      console.error("Error al cargar la base de datos", error);
    }
  };

  // 2. Ejecutar la carga al abrir la pantalla
  useEffect(() => {
    cargarFacturas();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  // 3. Función para enviar el dato al backend
  const handleAdd = async () => {
    if (!form.concepto.trim() || !form.monto || !form.fecha) {
      setError('Completa todos los campos.');
      return;
    }

    // Convertir la fecha a formato amigable
    const dateObj = new Date(form.fecha + 'T00:00:00');
    const labelFecha = dateObj.toLocaleDateString('es-SV', { day: '2-digit', month: 'short', year: 'numeric' });

    const payload = {
      tipo: 'gasto',
      concepto: form.concepto.trim(),
      monto: parseFloat(form.monto),
      fecha: labelFecha
    };

    try {
      const res = await fetch('http://localhost:3000/api/transacciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setForm({ concepto: '', monto: '', fecha: '' });
        cargarFacturas(); // Recargar la lista automáticamente
      } else {
        setError('Error al guardar en el servidor.');
      }
    } catch (error) {
      setError('Asegúrate de que el backend esté encendido.');
    }
  };

  const total = facturas.reduce((acc, f) => acc + f.monto, 0);

  const card = {
    background: '#FFFFFF', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.07)', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  };
  const inputStyle = {
    width: '100%', padding: '12px 14px', background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: '12px', fontSize: '14px', color: '#0F172A', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
  };
  const labelStyle = {
    display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748B', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.07em',
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px 80px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Hero */}
      <div style={{ background: '#0A0F1E', borderRadius: '20px', padding: '32px 36px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-50px', right: '-30px', width: '220px', height: '220px', background: 'radial-gradient(circle, rgba(29,107,243,0.38) 0%, transparent 68%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '10px' }}>
              <span style={{ fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Historial</span>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22D3EE', display: 'inline-block' }} />
            </div>
            <h2 style={{ fontSize: '36px', fontWeight: '800', color: '#FFFFFF', margin: 0, letterSpacing: '-1px', lineHeight: '1' }}>Mis Facturas</h2>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', margin: '8px 0 0' }}>Registros y recibos de tus movimientos</p>
          </div>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.38)', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Registros</div>
              <div style={{ fontSize: '22px', fontWeight: '700', color: '#FFFFFF' }}>{facturas.length}</div>
            </div>
            <div style={{ width: '1px', height: '28px', background: 'rgba(255,255,255,0.08)' }} />
            <div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.38)', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total</div>
              <div style={{ fontSize: '22px', fontWeight: '700', color: '#F87171' }}>$-{total.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div style={{ ...card, padding: '28px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#1D6BF3', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 4V14M4 9H14" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', margin: 0 }}>Agregar Factura</h3>
            <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0 }}>Registra un nuevo gasto</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '14px', alignItems: 'end' }}>
          <div>
            <label style={labelStyle}>Nombre</label>
            <input name="concepto" type="text" placeholder="Ej. Factura de luz" value={form.concepto} onChange={handleChange} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Costo ($)</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', fontWeight: '600', color: '#94A3B8' }}>$</span>
              <input name="monto" type="number" placeholder="0.00" value={form.monto} onChange={handleChange} style={{ ...inputStyle, paddingLeft: '28px', fontWeight: '600' }} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Fecha</label>
            <input name="fecha" type="date" value={form.fecha} onChange={handleChange} style={inputStyle} />
          </div>
        </div>

        {error && <p style={{ fontSize: '13px', color: '#EF4444', margin: '12px 0 0', fontWeight: '500' }}>{error}</p>}

        <button onClick={handleAdd} style={{ marginTop: '18px', padding: '13px 28px', background: '#1D6BF3', color: '#FFFFFF', fontSize: '14px', fontWeight: '700', borderRadius: '12px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '-0.1px' }}>
          Guardar Factura
        </button>
      </div>

      {/* Tabla */}
      <div style={card}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', padding: '13px 28px', background: '#F8FAFC', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          {['Fecha', 'Nombre', 'Costo'].map((col, i) => (
            <div key={col} style={{ fontSize: '10px', fontWeight: '600', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.07em', textAlign: i === 2 ? 'right' : 'left' }}>{col}</div>
          ))}
        </div>

        {facturas.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#CBD5E1', fontSize: '14px' }}>No hay facturas aún. ¡Agrega la primera!</div>
        ) : (
          facturas.map((f, idx) => (
            <div key={f.id} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', padding: '17px 28px', alignItems: 'center', borderBottom: idx < facturas.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#FCA5A5', flexShrink: 0 }} />
                <span style={{ fontSize: '13px', color: '#94A3B8', fontWeight: '500' }}>{f.fecha}</span>
              </div>
              <div style={{ fontSize: '15px', fontWeight: '600', color: '#0F172A' }}>{f.concepto}</div>
              <div style={{ textAlign: 'right', fontSize: '15px', fontWeight: '700', color: '#EF4444' }}>−${f.monto.toFixed(2)}</div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}