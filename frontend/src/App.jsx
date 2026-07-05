// src/App.jsx
import { useState } from 'react';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Facturas from './pages/Facturas';
import Resumen from './pages/Resumen'; // 1. Importamos la nueva página

function App() {
  const [vista, setVista] = useState('inicio');

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-12">
      <Header vistaActual={vista} cambiarVista={setVista} />
      
      <main>
        {vista === 'inicio' && <Dashboard />}
        {vista === 'facturas' && <Facturas />}
        {vista === 'resumen' && <Resumen />} {/* 2. Mostramos Resumen */}
      </main>
    </div>
  )
}

export default App