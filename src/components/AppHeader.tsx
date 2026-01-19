import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";

type AppHeaderProps = {
  displayName: string;
  onNavigate: (
    path:
      | "home"
      | "patients"
      | "clinical-history"
      | "consultations"
      | "anthropometry"
      | "files"
  ) => void;
  active:
    | "home"
    | "patients"
    | "clinical-history"
    | "consultations"
    | "anthropometry"
    | "files";
  theme: "light" | "dark";
  onToggleTheme: () => void;
};

export default function AppHeader({
  displayName,
  onNavigate,
  active,
  theme,
  onToggleTheme,
}: AppHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = menuOpen ? "hidden" : previous;
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!settingsOpen) return;

    const handler = (event: MouseEvent) => {
      if (!settingsRef.current) return;
      if (event.target instanceof Node && settingsRef.current.contains(event.target)) return;
      setSettingsOpen(false);
    };

    document.addEventListener("click", handler);
    return () => {
      document.removeEventListener("click", handler);
    };
  }, [settingsOpen]);

  const handleNavigate = (
    next:
      | "home"
      | "patients"
      | "clinical-history"
      | "consultations"
      | "anthropometry"
      | "files"
  ) => {
    onNavigate(next);
    setMenuOpen(false);
    setSettingsOpen(false);
  };

  return (
    <header className="app-header">
      <div>
        <h1>Citas Medicas</h1>
        <p className="muted">Hola, {displayName}</p>
      </div>
      <button
        type="button"
        className="menu-toggle"
        onClick={() => setMenuOpen((prev) => !prev)}
        aria-expanded={menuOpen}
        aria-label="Abrir menu"
      >
        Menu
      </button>
      <div
        className={`menu-overlay ${menuOpen ? "is-open" : ""}`}
        onClick={() => setMenuOpen(false)}
      >
        <nav className="app-nav" onClick={(event) => event.stopPropagation()}>
          <div className="menu-header">
            <span className="muted">Menu</span>
            <button type="button" className="link" onClick={() => setMenuOpen(false)}>
              Cerrar
            </button>
          </div>
        <button
          type="button"
          className={active === "home" ? "active" : ""}
          onClick={() => handleNavigate("home")}
        >
          Resumen
        </button>
        <button
          type="button"
          className={active === "patients" ? "active" : ""}
          onClick={() => handleNavigate("patients")}
        >
          Pacientes
        </button>
        <button
          type="button"
          className={active === "clinical-history" ? "active" : ""}
          onClick={() => handleNavigate("clinical-history")}
        >
          Historia clinica
        </button>
        <button
          type="button"
          className={active === "anthropometry" ? "active" : ""}
          onClick={() => handleNavigate("anthropometry")}
        >
          Antropometria
        </button>
        <button
          type="button"
          className={active === "consultations" ? "active" : ""}
          onClick={() => handleNavigate("consultations")}
        >
          Consultas
        </button>
        <button
          type="button"
          className={active === "files" ? "active" : ""}
          onClick={() => handleNavigate("files")}
        >
          Archivos
        </button>
        </nav>
      </div>
      <div className="app-user" ref={settingsRef}>
        <button
          type="button"
          className="settings-toggle"
          onClick={() => setSettingsOpen((prev) => !prev)}
          aria-expanded={settingsOpen}
          aria-label="Abrir configuracion"
        >
          ⚙
        </button>
        {settingsOpen ? (
          <div className="settings-panel">
            <button type="button" className="theme-toggle" onClick={onToggleTheme}>
              {theme === "dark" ? "Modo claro" : "Modo oscuro"}
            </button>
            <button type="button" onClick={() => supabase.auth.signOut()}>
              Cerrar sesion
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
