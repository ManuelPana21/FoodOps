import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { getActiveRole, login, ROLE_HOME, type Role } from "../services/auth";

const DEMO_ACCOUNTS: { role: Role; username: string; password: string }[] = [
  { role: "Mesero", username: "mesero", password: "mesero123" },
  { role: "Cocinero", username: "cocinero", password: "cocina123" },
];

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Si ya hay una sesión activa, se redirige directamente a su pantalla.
  const activeRole = getActiveRole();
  if (activeRole) return <Navigate to={ROLE_HOME[activeRole]} replace />;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!username.trim() || !password) {
      setError("Ingresa tu usuario y contraseña.");
      return;
    }

    const user = login(username, password);
    if (!user) {
      setError("Usuario o contraseña incorrectos.");
      return;
    }

    navigate(ROLE_HOME[user.role], { replace: true });
  };

  const fillDemo = (account: (typeof DEMO_ACCOUNTS)[number]) => {
    setUsername(account.username);
    setPassword(account.password);
    setError(null);
  };

  return (
    <div className="login-shell">
      <main className="login-card">
        <div className="login-brand">
          <div className="brand-mark">
            <svg
              aria-hidden="true"
              fill="none"
              height={24}
              viewBox="0 0 24 24"
              width={24}
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            >
              <path d="M6.5 10.5c-2.8 0-3.5-4.2-.6-5.1A4.1 4.1 0 0 1 13 3.8a3.6 3.6 0 0 1 5.5 3c0 2-1.4 3.5-3.4 3.7" />
              <path d="M6.5 10v9h9v-9M6.5 15h9" />
            </svg>
          </div>
          <div className="brand-name">
            Food<span>Ops</span>
          </div>
        </div>

        <h1 className="login-title">Iniciar sesión</h1>
        <p className="login-subtitle">Accede con tu usuario de Mesero o Cocinero.</p>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <label className="login-field">
            <span>Usuario</span>
            <input
              autoComplete="username"
              autoFocus
              name="username"
              onChange={(event) => {
                setUsername(event.target.value);
                setError(null);
              }}
              placeholder="mesero"
              type="text"
              value={username}
            />
          </label>

          <label className="login-field">
            <span>Contraseña</span>
            <input
              autoComplete="current-password"
              name="password"
              onChange={(event) => {
                setPassword(event.target.value);
                setError(null);
              }}
              placeholder="••••••••"
              type="password"
              value={password}
            />
          </label>

          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}

          <button className="button-base login-submit" type="submit">
            Entrar
          </button>
        </form>

        <div className="login-demo">
          <span>Cuentas de prueba</span>
          <div className="login-demo-grid">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                className="button-base login-demo-button"
                key={account.role}
                onClick={() => fillDemo(account)}
                type="button"
              >
                <strong>{account.role}</strong>
                <small>
                  {account.username} / {account.password}
                </small>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
