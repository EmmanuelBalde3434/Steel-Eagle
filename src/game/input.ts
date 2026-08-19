import type { Actions } from "./types";

const GAME_CODES = new Set([
  "KeyW",
  "KeyA",
  "KeyS",
  "KeyD",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "Space",
  "KeyK",
  "KeyJ",
  "Enter",
  "Escape",
  "KeyP",
  "KeyM",
]);

export class Input {
  keys = new Set<string>();
  qaKeys = new Set<string>();
  touch = { up: false, down: false, left: false, right: false, fire: false };
  private prevFire = false;
  private prevPause = false;
  fireBuffer = 0;
  padFireHeld = false;

  attach(target: Window | HTMLElement = window): () => void {
    const down = (e: KeyboardEvent) => {
      if (e.repeat) {
        if (GAME_CODES.has(e.code)) e.preventDefault();
        return;
      }
      this.keys.add(e.code);
      if (GAME_CODES.has(e.code)) e.preventDefault();
    };
    const up = (e: KeyboardEvent) => {
      this.keys.delete(e.code);
      if (GAME_CODES.has(e.code)) e.preventDefault();
    };
    const clear = () => this.keys.clear();
    target.addEventListener("keydown", down as EventListener);
    target.addEventListener("keyup", up as EventListener);
    window.addEventListener("blur", clear);
    document.addEventListener("visibilitychange", clear);
    return () => {
      target.removeEventListener("keydown", down as EventListener);
      target.removeEventListener("keyup", up as EventListener);
      window.removeEventListener("blur", clear);
      document.removeEventListener("visibilitychange", clear);
    };
  }

  poll(dt: number): Actions {
    const k = this.keys;
    const q = this.qaKeys;
    const t = this.touch;
    let padUp = false;
    let padDown = false;
    let padLeft = false;
    let padRight = false;
    let padFire = false;
    let padPause = false;
    const pads = typeof navigator !== "undefined" ? navigator.getGamepads?.() : null;
    if (pads) {
      for (const p of pads) {
        if (!p) continue;
        const ax = p.axes[0] ?? 0;
        const ay = p.axes[1] ?? 0;
        const mag = Math.hypot(ax, ay);
        let sx = 0;
        let sy = 0;
        if (mag >= 0.28) {
          const scale = (mag - 0.28) / (1 - 0.28) / mag;
          sx = ax * scale;
          sy = ay * scale;
        }
        if (sy < -0.45 || p.buttons[12]?.pressed) padUp = true;
        if (sy > 0.45 || p.buttons[13]?.pressed) padDown = true;
        if (sx < -0.45 || p.buttons[14]?.pressed) padLeft = true;
        if (sx > 0.45 || p.buttons[15]?.pressed) padRight = true;
        if (p.buttons[0]?.pressed || p.buttons[2]?.pressed || (p.buttons[7]?.value ?? 0) > 0.4) {
          padFire = true;
        }
        if (p.buttons[9]?.pressed) padPause = true;
      }
    }

    const up = k.has("KeyW") || k.has("ArrowUp") || q.has("KeyW") || t.up || padUp;
    const down = k.has("KeyS") || k.has("ArrowDown") || q.has("KeyS") || t.down || padDown;
    const left = k.has("KeyA") || k.has("ArrowLeft") || q.has("KeyA") || t.left || padLeft;
    const right = k.has("KeyD") || k.has("ArrowRight") || q.has("KeyD") || t.right || padRight;
    const fireHeld =
      k.has("Space") || k.has("KeyK") || k.has("KeyJ") || q.has("Space") || t.fire || padFire;
    const pauseHeld = k.has("Escape") || k.has("KeyP") || k.has("Enter") || padPause;

    if (fireHeld) this.fireBuffer = 0.14;
    else this.fireBuffer = Math.max(0, this.fireBuffer - dt);

    const firePressed = (fireHeld && !this.prevFire) || this.fireBuffer > 0;
    const pausePressed = pauseHeld && !this.prevPause;
    this.prevFire = fireHeld;
    this.prevPause = pauseHeld;

    return {
      up,
      down,
      left,
      right,
      fire: fireHeld,
      firePressed,
      pausePressed,
    };
  }

  consumeFire(): void {
    this.fireBuffer = 0;
  }
}
