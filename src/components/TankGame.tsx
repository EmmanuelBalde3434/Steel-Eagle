import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { UserButton } from "@/lib/auth/gates";
import { listTopScores, submitScore } from "@/lib/scores";
import { VIEW } from "@/game/constants";
import { Engine } from "@/game/engine";
import { isMuted, setMuted, unlockAudio } from "@/game/audio";
import type { UiState } from "@/game/types";

const EMPTY_UI: UiState = {
  mode: "title",
  score: 0,
  highScore: 0,
  lives: 3,
  stage: 1,
  enemiesLeft: 20,
  star: 0,
  shield: false,
  frozen: false,
  message: "",
};

type ScoreRow = { name: string; score: number; stage: number };

export function TankGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const [ui, setUi] = useState<UiState>(EMPTY_UI);
  const [help, setHelp] = useState(false);
  const [muted, setMutedState] = useState(false);
  const [scores, setScores] = useState<ScoreRow[]>([]);
  const posted = useRef(false);
  const { user, isPending } = useCurrentUserState();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = VIEW;
    canvas.height = VIEW;
    const engine = new Engine(canvas, setUi);
    engineRef.current = engine;
    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    void listTopScores()
      .then(setScores)
      .catch(() => setScores([]));
  }, [ui.mode]);

  useEffect(() => {
    if ((ui.mode === "gameOver" || ui.mode === "win") && user && !posted.current && ui.score > 0) {
      posted.current = true;
      void submitScore({ data: { score: ui.score, stage: ui.stage } }).catch(() => undefined);
    }
    if (ui.mode === "title" || ui.mode === "playing") posted.current = false;
  }, [ui.mode, ui.score, ui.stage, user]);

  const play = useCallback(() => {
    unlockAudio();
    engineRef.current?.beginGame();
  }, []);

  const toggleMute = useCallback(() => {
    const next = !isMuted();
    setMuted(next);
    setMutedState(next);
  }, []);

  return (
    <div className="flex min-h-dvh flex-col bg-bg text-fg">
      <header className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <p className="font-display text-[10px] leading-none tracking-widest text-muted">STEEL EAGLE</p>
          <p className="mt-1 truncate text-xs text-subtle">Defiende el águila</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleMute}
            className="h-10 rounded-md border border-line bg-surface px-3 text-xs text-muted hover:text-fg"
          >
            {muted ? "Sonido off" : "Sonido"}
          </button>
          {isPending ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-elevated" />
          ) : user ? (
            <UserButton />
          ) : (
            <Link
              to="/login"
              className="inline-flex h-10 items-center rounded-md border border-line bg-surface px-3 text-xs text-muted hover:text-fg"
            >
              Entrar
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center px-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">
        <div className="flex w-full flex-col items-center gap-3 lg:flex-row lg:items-start lg:justify-center lg:gap-6">
          <aside className="hidden w-28 shrink-0 flex-col gap-4 pt-2 lg:flex">
            <Stat label="PUNTOS" value={pad(ui.score, 6)} />
            <Stat label="RÉCORD" value={pad(ui.highScore, 6)} />
            <Stat label="NIVEL" value={String(ui.stage)} />
            <Stat label="VIDAS" value={String(Math.max(0, ui.lives))} />
            <div>
              <p className="font-display text-[8px] text-subtle">ENEMIGOS</p>
              <div className="mt-2 grid grid-cols-4 gap-1">
                {Array.from({ length: 20 }).map((_, i) => (
                  <span
                    key={i}
                    className={`block h-2.5 w-2.5 rounded-[1px] ${i < ui.enemiesLeft ? "bg-brick" : "bg-line"}`}
                  />
                ))}
              </div>
            </div>
            {ui.star > 0 ? <Stat label="ESTRELLA" value={"I".repeat(ui.star)} /> : null}
            {ui.frozen ? <p className="font-display text-[8px] text-ok">RELOJ</p> : null}
            {ui.shield ? <p className="font-display text-[8px] text-steel">CASCO</p> : null}
          </aside>

          <div className="relative w-full max-w-[min(100%,416px)]">
            <div className="mb-2 flex items-center justify-between gap-2 lg:hidden">
              <span className="font-mono text-[9px] tabular-nums text-muted">{pad(ui.score, 6)}</span>
              <span className="font-mono text-[9px] text-muted">Nv {ui.stage}</span>
              <span className="font-mono text-[9px] text-muted">Vidas {Math.max(0, ui.lives)}</span>
              <span className="font-mono text-[9px] text-brick">{ui.enemiesLeft}</span>
            </div>
            <div className="relative overflow-hidden rounded-lg border border-line bg-elevated">
              <canvas
                ref={canvasRef}
                className="block h-auto w-full touch-none select-none"
                style={{ aspectRatio: "1 / 1", imageRendering: "pixelated" }}
                width={VIEW}
                height={VIEW}
              />
              {ui.mode !== "playing" ? (
                <Overlay
                  ui={ui}
                  help={help}
                  scores={scores}
                  onPlay={play}
                  onHelp={() => setHelp((v) => !v)}
                  signedIn={!!user}
                />
              ) : null}
            </div>
          </div>
        </div>

        <TouchPad engine={engineRef} />

        <p className="mt-4 hidden text-center text-xs text-subtle sm:block">
          WASD o flechas para mover · Espacio para disparar · P para pausar
        </p>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-display text-[8px] text-subtle">{label}</p>
      <p className="mt-1 font-mono text-[11px] tabular-nums tracking-wider">{value}</p>
    </div>
  );
}

function pad(n: number, w: number): string {
  return String(Math.max(0, n)).padStart(w, "0");
}

function Overlay({
  ui,
  help,
  scores,
  onPlay,
  onHelp,
  signedIn,
}: {
  ui: UiState;
  help: boolean;
  scores: ScoreRow[];
  onPlay: () => void;
  onHelp: () => void;
  signedIn: boolean;
}) {
  if (ui.mode === "stageIntro" || ui.mode === "stageClear") {
    return (
      <div className="absolute inset-0 grid place-items-center bg-bg/70">
        <div className="text-center">
          <p className="font-display text-xs tracking-widest text-accent">{ui.message}</p>
          {ui.mode === "stageClear" ? (
            <p className="mt-3 text-xs text-muted">{pad(ui.score, 6)}</p>
          ) : null}
        </div>
      </div>
    );
  }

  if (ui.mode === "paused") {
    return (
      <div className="absolute inset-0 grid place-items-center bg-bg/75">
        <div className="rounded-lg border border-line bg-surface px-8 py-6 text-center">
          <p className="font-display text-xs">PAUSA</p>
          <p className="mt-3 text-xs text-muted">Espacio o P para seguir</p>
        </div>
      </div>
    );
  }

  if (ui.mode === "gameOver" || ui.mode === "win") {
    return (
      <div className="absolute inset-0 grid place-items-center bg-bg/80 p-4">
        <div className="w-full max-w-xs rounded-lg border border-line bg-surface px-5 py-6 text-center">
          <p className="font-display text-xs tracking-widest">{ui.mode === "win" ? "VICTORIA" : "GAME OVER"}</p>
          <p className="mt-4 font-mono text-sm tabular-nums">{pad(ui.score, 6)}</p>
          <p className="mt-1 text-xs text-muted">Nivel {ui.stage}</p>
          <button
            type="button"
            onClick={onPlay}
            className="mt-5 w-full rounded-md bg-accent px-4 py-3 text-sm font-medium text-accent-fg"
          >
            Jugar de nuevo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col justify-end bg-linear-to-t from-bg via-bg/80 to-bg/25 p-4 sm:p-5">
      <img
        src="/title-art.jpg"
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-40"
      />
      <div className="relative">
        <h1 className="font-display text-[18px] leading-tight sm:text-[22px]">
          STEEL
          <br />
          EAGLE
        </h1>
        <p className="mt-3 max-w-[18rem] text-sm leading-relaxed text-muted">
          Protege la base. Los ladrillos caen, el acero aguanta, los arbustos ocultan.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onPlay}
            className="rounded-md bg-accent px-4 py-3 text-sm font-medium text-accent-fg"
          >
            Jugar
          </button>
          <button
            type="button"
            onClick={onHelp}
            className="rounded-md border border-line bg-surface px-4 py-3 text-sm text-fg"
          >
            Controles
          </button>
        </div>
        {help ? (
          <ul className="mt-4 space-y-1 text-xs leading-relaxed text-muted">
            <li>PC: WASD o flechas, Espacio dispara</li>
            <li>Móvil: cruceta + botón de fuego</li>
            <li>3 vidas · escudo al reaparecer · 8 niveles</li>
            <li>Estrella, bomba, reloj, casco, pala y vida extra</li>
          </ul>
        ) : null}
        {scores.length > 0 ? (
          <ol className="mt-4 space-y-1 text-[11px] text-muted">
            {scores.slice(0, 4).map((s, i) => (
              <li key={`${s.name}-${s.score}-${i}`} className="flex justify-between gap-3 font-mono tabular-nums">
                <span className="truncate">{s.name}</span>
                <span>{pad(s.score, 6)}</span>
              </li>
            ))}
          </ol>
        ) : null}
        {!signedIn ? <p className="mt-3 text-[11px] text-subtle">Entra para guardar tu marca</p> : null}
      </div>
    </div>
  );
}

function TouchPad({ engine }: { engine: React.RefObject<Engine | null> }) {
  const set = useCallback(
    (partial: Record<string, boolean>) => {
      engine.current?.setTouch(partial);
    },
    [engine],
  );

  return (
    <div className="mt-3 flex w-full max-w-[min(100%,416px)] items-end justify-between gap-4 select-none lg:hidden">
      <div className="grid grid-cols-3 grid-rows-3 gap-1.5">
        <span />
        <PadBtn label="▲" onChange={(v) => set({ up: v })} />
        <span />
        <PadBtn label="◀" onChange={(v) => set({ left: v })} />
        <span />
        <PadBtn label="▶" onChange={(v) => set({ right: v })} />
        <span />
        <PadBtn label="▼" onChange={(v) => set({ down: v })} />
        <span />
      </div>
      <PadBtn fire label="FUEGO" onChange={(v) => set({ fire: v })} />
    </div>
  );
}

function PadBtn({
  label,
  onChange,
  fire,
}: {
  label: string;
  onChange: (v: boolean) => void;
  fire?: boolean;
}) {
  const down = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.currentTarget as HTMLButtonElement).setPointerCapture(e.pointerId);
    onChange(true);
  };
  const up = (e: React.PointerEvent) => {
    e.preventDefault();
    onChange(false);
  };
  return (
    <button
      type="button"
      aria-label={label}
      onPointerDown={down}
      onPointerUp={up}
      onPointerCancel={up}
      onContextMenu={(e) => e.preventDefault()}
      className={
        fire
          ? "h-[72px] w-[72px] rounded-full border border-line bg-elevated font-display text-[9px] text-fg active:bg-accent active:text-accent-fg"
          : "flex h-14 w-14 items-center justify-center rounded-md border border-line bg-elevated text-lg text-fg active:bg-accent active:text-accent-fg"
      }
    >
      {label}
    </button>
  );
}
