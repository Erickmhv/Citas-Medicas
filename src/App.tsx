import { lazy, Suspense, useEffect, useState } from "react";
import AuthView from "./components/AuthView";
import AppHeader from "./components/AppHeader";
import { ToastProvider } from "./components/ToastProvider";
import { useSession } from "./lib/auth";
import { supabase } from "./lib/supabase";
import type { UserProfile } from "./lib/types";

const HomePage = lazy(() => import("./pages/HomePage"));
const PatientsListPage = lazy(() => import("./pages/PatientsListPage"));
const PatientFormPage = lazy(() => import("./pages/PatientFormPage"));
const PatientProfilePage = lazy(() => import("./pages/PatientProfilePage"));
const ClinicalHistoryPage = lazy(() => import("./pages/ClinicalHistoryPage"));
const ConsultationsPage = lazy(() => import("./pages/ConsultationsPage"));
const AnthropometryPage = lazy(() => import("./pages/AnthropometryPage"));
const FilesPage = lazy(() => import("./pages/FilesPage"));

function CargandoPagina() {
  return (
    <div className="centered">
      <p className="muted">Cargando pagina...</p>
    </div>
  );
}

type RouteKey =
  | "home"
  | "patients"
  | "patient-form"
  | "patient-profile"
  | "clinical-history"
  | "consultations"
  | "anthropometry"
  | "files";

export default function App() {
  const { session, loading } = useSession();
  const [route, setRoute] = useState<RouteKey>("home");
  const [patientFormId, setPatientFormId] = useState<string | null>(null);
  const [patientProfileId, setPatientProfileId] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const stored = window.localStorage.getItem("theme");
    return stored === "dark" ? "dark" : "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem("theme", theme);
  }, [theme]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) {
      setProfile(null);
      setProfileLoading(false);
      setProfileError(null);
      return;
    }

    let isMounted = true;
    setProfileLoading(true);
    setProfileError(null);

    supabase
      .from("users")
      .select("id, clinic_id, full_name")
      .eq("id", session.user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!isMounted) return;
        if (error) {
          setProfileError(error.message);
          setProfile(null);
        } else {
          setProfile(data ?? null);
        }
        setProfileLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [session]);

  if (loading) {
    return (
      <div className="centered">
        <p className="muted">Cargando sesion...</p>
      </div>
    );
  }

  if (!session) {
    return <AuthView />;
  }

  if (profileLoading) {
    return (
      <div className="centered">
        <p className="muted">Validando datos de la clinica...</p>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="centered">
        <div className="card">
          <h2>No se pudo cargar tu perfil</h2>
          <p className="muted">{profileError}</p>
          <button type="button" onClick={() => supabase.auth.signOut()}>
            Cerrar sesion
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="centered">
        <div className="card">
          <h2>Cuenta sin clinica asignada</h2>
          <p className="muted">
            Tu cuenta aun no esta vinculada a una clinica. Pide a un
            administrador que te asigne una para continuar.
          </p>
          <button type="button" onClick={() => supabase.auth.signOut()}>
            Cerrar sesion
          </button>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="app-layout">
        <AppHeader
          displayName={profile?.full_name?.trim() || session.user.email || "Profesional"}
          onNavigate={(nextRoute) => {
            setRoute(nextRoute);
            setPatientFormId(null);
          }}
          active={route === "patient-form" || route === "patient-profile" ? "patients" : route}
          theme={theme}
          onToggleTheme={() => {
            setTheme((current) => (current === "dark" ? "light" : "dark"));
          }}
        />
        <main className="app-main">
          <Suspense fallback={<CargandoPagina />}>
            {route === "home" ? (
              <HomePage
                onNewPatient={() => {
                  setPatientFormId(null);
                  setRoute("patient-form");
                }}
                onNewConsultation={() => setRoute("consultations")}
                onNewFile={() => setRoute("files")}
              />
            ) : null}
            {route === "patients" ? (
              <PatientsListPage
                onAdd={() => {
                  setPatientFormId(null);
                  setRoute("patient-form");
                }}
                onEdit={(id) => {
                  setPatientFormId(id);
                  setRoute("patient-form");
                }}
                onViewProfile={(id) => {
                  setPatientProfileId(id);
                  setRoute("patient-profile");
                }}
              />
            ) : null}
            {route === "patient-form" ? (
              <PatientFormPage
                patientId={patientFormId}
                onDone={() => setRoute("patients")}
                onCancel={() => setRoute("patients")}
              />
            ) : null}
            {route === "patient-profile" && patientProfileId ? (
              <PatientProfilePage
                patientId={patientProfileId}
                onBack={() => setRoute("patients")}
                onEdit={(id) => {
                  setPatientFormId(id);
                  setRoute("patient-form");
                }}
              />
            ) : null}
            {route === "clinical-history" ? <ClinicalHistoryPage /> : null}
            {route === "consultations" ? <ConsultationsPage /> : null}
            {route === "anthropometry" ? <AnthropometryPage /> : null}
            {route === "files" ? <FilesPage /> : null}
          </Suspense>
        </main>
      </div>
    </ToastProvider>
  );
}
