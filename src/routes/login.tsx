import { createFileRoute, Link } from "@tanstack/react-router";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  return (
    <main className="grid min-h-dvh place-items-center bg-bg px-5 text-fg">
      <div className="w-full max-w-sm rounded-xl border border-line bg-surface p-6 shadow-none">
        <p className="font-display text-[10px] tracking-widest text-muted">STEEL EAGLE</p>
        <h1 className="mt-3 font-display text-sm leading-relaxed">Iniciar sesión</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Guarda tu puntuación en el ranking. Puedes jugar como invitado cuando quieras.
        </p>
        <div className="mt-6 space-y-2">
          {authEnabled ? (
            GROK_PROVIDERS.map((p) => (
              <button
                key={p.providerId}
                type="button"
                onClick={() => signIn(p.providerId, { callbackURL: "/" })}
                className="w-full rounded-md border border-line bg-elevated px-4 py-3 text-sm font-medium text-fg transition-colors hover:bg-accent hover:text-accent-fg"
              >
                Continuar con {p.label}
              </button>
            ))
          ) : (
            <p className="text-sm text-muted">El inicio de sesión está desactivado.</p>
          )}
        </div>
        <Link
          to="/"
          className="mt-6 inline-block text-sm text-muted underline-offset-4 hover:text-fg hover:underline"
        >
          Volver al juego
        </Link>
      </div>
    </main>
  );
}
