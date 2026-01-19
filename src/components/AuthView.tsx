import { useState } from "react";
import { supabase } from "../lib/supabase";

type Mode = "sign-in" | "sign-up";

export default function AuthView() {
  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === "sign-in") {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        setError(signInError.message);
      }
    } else {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpError) {
        setError(signUpError.message);
      }
    }

    setLoading(false);
  };

  return (
    <section className="auth-shell">
      <div className="card auth-card">
        <h1>{mode === "sign-in" ? "Bienvenido de nuevo" : "Crear cuenta"}</h1>
        <p className="muted">
          {mode === "sign-in"
            ? "Inicia sesion para gestionar los registros de la clinica."
            : "Crea tu cuenta con el correo de la clinica para comenzar."}
        </p>
        <form onSubmit={submit} className="stack">
          <label>
            Correo
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="doctor@clinica.com"
              required
            />
          </label>
          <label>
            Contrasena
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Minimo 6 caracteres"
              minLength={6}
              required
            />
          </label>
          <button type="submit" disabled={loading}>
            {loading ? "Espera..." : mode === "sign-in" ? "Iniciar sesion" : "Crear cuenta"}
          </button>
        </form>
        {error ? <p className="error">{error}</p> : null}
        <div className="auth-toggle">
          <span>
            {mode === "sign-in" ? "Eres nuevo?" : "Ya tienes cuenta?"}
          </span>
          <button
            type="button"
            className="link"
            onClick={() => setMode(mode === "sign-in" ? "sign-up" : "sign-in")}
          >
            {mode === "sign-in" ? "Crear cuenta" : "Iniciar sesion"}
          </button>
        </div>
      </div>
    </section>
  );
}
