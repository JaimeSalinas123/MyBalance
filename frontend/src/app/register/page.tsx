// src/app/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import Link from "next/link";

export default function RegisterPage() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await api.post("/auth/register", { nombre, email, password });
      // Si el registro es exitoso, lo mandamos a que inicie sesión
      router.push("/login");
    } catch (err: any) {
      setError(err.response?.data?.error || "Error al registrar el usuario");
    }
  };

  const cardStyle: React.CSSProperties = {
    background: "#FFFFFF",
    borderRadius: "20px",
    border: "1px solid rgba(0,0,0,0.07)",
    padding: "36px 32px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "12px",
    fontWeight: 600,
    color: "#64748B",
    marginBottom: "8px",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    paddingLeft: "44px",
    paddingRight: "16px",
    paddingTop: "13px",
    paddingBottom: "13px",
    background: "#F8FAFC",
    border: "1.5px solid #E2E8F0",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: 500,
    color: "#0F172A",
    outline: "none",
    boxSizing: "border-box",
  };

  const iconWrapStyle: React.CSSProperties = {
    position: "absolute",
    left: "16px",
    top: "50%",
    transform: "translateY(-50%)",
    display: "flex",
    pointerEvents: "none",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F1F5F9",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div style={{ width: "100%", maxWidth: "420px", display: "flex", flexDirection: "column", gap: "20px" }}>

        {/* ── Hero ── */}
        <div style={{ background: "#0A0F1E", borderRadius: "24px", padding: "44px 32px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "-60px", right: "-40px", width: "240px", height: "240px", background: "radial-gradient(circle, rgba(29,107,243,0.35) 0%, transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: "-50px", left: "-30px", width: "180px", height: "180px", background: "radial-gradient(circle, rgba(99,179,237,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />

          <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
            <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "#1D6BF3", margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M19 8v6M22 11h-6" />
              </svg>
            </div>
            <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#FFFFFF", margin: "0 0 6px", letterSpacing: "-0.3px" }}>
              Crea tu cuenta
            </h1>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", margin: 0 }}>
              Empieza a controlar tus finanzas
            </p>
          </div>
        </div>

        {/* ── Formulario ── */}
        <div style={cardStyle}>
          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "12px", padding: "12px 14px", marginBottom: "20px" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v4m0 4h.01" />
              </svg>
              <span style={{ fontSize: "13px", color: "#B91C1C", fontWeight: 600 }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div>
              <label style={labelStyle}>Nombre</label>
              <div style={{ position: "relative" }}>
                <span style={iconWrapStyle}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Correo Electrónico</label>
              <div style={{ position: "relative" }}>
                <span style={iconWrapStyle}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="M3 7l9 6 9-6" />
                  </svg>
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Contraseña</label>
              <div style={{ position: "relative" }}>
                <span style={iconWrapStyle}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="5" y="11" width="14" height="10" rx="2" />
                    <path d="M8 11V7a4 4 0 018 0v4" />
                  </svg>
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              style={{ width: "100%", padding: "14px", background: "#1D6BF3", color: "#FFFFFF", fontSize: "15px", fontWeight: 700, borderRadius: "12px", border: "none", cursor: "pointer", marginTop: "6px" }}
            >
              Registrarse
            </button>
          </form>

          <p style={{ marginTop: "24px", textAlign: "center", fontSize: "13px", color: "#64748B" }}>
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" style={{ color: "#1D6BF3", fontWeight: 600, textDecoration: "none" }}>
              Inicia sesión
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}