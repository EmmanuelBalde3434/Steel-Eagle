import {
  CELL,
  DIRS,
  GRID,
  TANK,
  TANK_HIT,
  TILE_BRICK,
  TILE_BUSH,
  TILE_EAGLE,
  TILE_EAGLE_DEAD,
  TILE_EMPTY,
  TILE_ICE,
  TILE_STEEL,
  TILE_WATER,
  WORLD,
  type DirName,
} from "./constants";

export function aabb(
  ax: number,
  ay: number,
  aw: number,
  ah: number,
  bx: number,
  by: number,
  bw: number,
  bh: number,
): boolean {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

export function solidForTank(t: number): boolean {
  return t === TILE_BRICK || t === TILE_STEEL || t === TILE_WATER || t === TILE_EAGLE || t === TILE_EAGLE_DEAD;
}

export function solidForBullet(t: number, canBreakSteel: boolean): boolean {
  if (t === TILE_BRICK || t === TILE_EAGLE || t === TILE_EAGLE_DEAD) return true;
  if (t === TILE_STEEL) return true;
  void canBreakSteel;
  return false;
}

export function isIce(grid: number[][], x: number, y: number, w: number, h: number): boolean {
  let ice = 0;
  let n = 0;
  const x0 = Math.max(0, Math.floor(x / CELL));
  const y0 = Math.max(0, Math.floor(y / CELL));
  const x1 = Math.min(GRID - 1, Math.floor((x + w - 0.01) / CELL));
  const y1 = Math.min(GRID - 1, Math.floor((y + h - 0.01) / CELL));
  for (let gy = y0; gy <= y1; gy++) {
    for (let gx = x0; gx <= x1; gx++) {
      n++;
      if (grid[gy]![gx] === TILE_ICE) ice++;
    }
  }
  return n > 0 && ice * 2 >= n;
}

export function tankBlocked(grid: number[][], x: number, y: number): boolean {
  const pad = (TANK - TANK_HIT) / 2;
  const hx = x + pad;
  const hy = y + pad;
  if (hx < 0 || hy < 0 || hx + TANK_HIT > WORLD || hy + TANK_HIT > WORLD) return true;
  const x0 = Math.max(0, Math.floor(hx / CELL));
  const y0 = Math.max(0, Math.floor(hy / CELL));
  const x1 = Math.min(GRID - 1, Math.floor((hx + TANK_HIT - 0.01) / CELL));
  const y1 = Math.min(GRID - 1, Math.floor((hy + TANK_HIT - 0.01) / CELL));
  for (let gy = y0; gy <= y1; gy++) {
    for (let gx = x0; gx <= x1; gx++) {
      if (solidForTank(grid[gy]![gx]!)) return true;
    }
  }
  return false;
}

export function snapAxis(v: number): number {
  return Math.round(v / CELL) * CELL;
}

export function tryMove(
  grid: number[][],
  x: number,
  y: number,
  dir: DirName,
  dist: number,
  others: { x: number; y: number; live: boolean; id: number }[],
  selfId: number,
): { x: number; y: number; moved: boolean } {
  const d = DIRS[dir];
  const nx = x + d.x * dist;
  const ny = y + d.y * dist;
  if (!tankBlocked(grid, nx, ny) && !tankOverlap(nx, ny, others, selfId)) {
    return { x: nx, y: ny, moved: true };
  }
  // Pixel walk so we rest flush against walls (fair, no gap / no overlap)
  const step = Math.sign(dist) || 1;
  const steps = Math.max(1, Math.ceil(Math.abs(dist)));
  let cx = x;
  let cy = y;
  let moved = false;
  for (let i = 0; i < steps; i++) {
    const tx = cx + d.x * step;
    const ty = cy + d.y * step;
    if (tankBlocked(grid, tx, ty) || tankOverlap(tx, ty, others, selfId)) break;
    cx = tx;
    cy = ty;
    moved = true;
  }
  return { x: cx, y: cy, moved };
}

function tankOverlap(
  x: number,
  y: number,
  others: { x: number; y: number; live: boolean; id: number }[],
  selfId: number,
): boolean {
  const pad = 1;
  for (const o of others) {
    if (!o.live || o.id === selfId) continue;
    if (aabb(x + pad, y + pad, TANK - pad * 2, TANK - pad * 2, o.x + pad, o.y + pad, TANK - pad * 2, TANK - pad * 2)) {
      return true;
    }
  }
  return false;
}

export type BulletHit =
  | { kind: "tile"; gx: number; gy: number; tile: number }
  | { kind: "none" };

/** Swept cell walk along a bullet path — no tunneling. */
export function sweepBullet(
  grid: number[][],
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  canBreakSteel: boolean,
): BulletHit {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const steps = Math.max(1, Math.ceil(Math.hypot(dx, dy) / 2));
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const x = x0 + dx * t;
    const y = y0 + dy * t;
    if (x < 0 || y < 0 || x >= WORLD || y >= WORLD) {
      const gx = Math.max(0, Math.min(GRID - 1, Math.floor(x / CELL)));
      const gy = Math.max(0, Math.min(GRID - 1, Math.floor(y / CELL)));
      return { kind: "tile", gx, gy, tile: TILE_STEEL };
    }
    const gx = Math.floor(x / CELL);
    const gy = Math.floor(y / CELL);
    if (gx < 0 || gy < 0 || gx >= GRID || gy >= GRID) {
      return { kind: "tile", gx: Math.max(0, gx), gy: Math.max(0, gy), tile: TILE_STEEL };
    }
    const tile = grid[gy]![gx]!;
    if (solidForBullet(tile, canBreakSteel)) {
      return { kind: "tile", gx, gy, tile };
    }
  }
  return { kind: "none" };
}

export function damageTile(grid: number[][], gx: number, gy: number, power: number): "brick" | "steel" | "eagle" | "none" {
  const t = grid[gy]?.[gx];
  if (t === TILE_BRICK) {
    grid[gy]![gx] = TILE_EMPTY;
    return "brick";
  }
  if (t === TILE_STEEL) {
    if (power >= 3) {
      grid[gy]![gx] = TILE_EMPTY;
      return "steel";
    }
    return "steel";
  }
  if (t === TILE_EAGLE) {
    grid[gy]![gx] = TILE_EAGLE_DEAD;
    // flatten the 2x2 eagle
    for (let y = 0; y < GRID; y++) {
      for (let x = 0; x < GRID; x++) {
        if (grid[y]![x] === TILE_EAGLE) grid[y]![x] = TILE_EAGLE_DEAD;
      }
    }
    return "eagle";
  }
  return "none";
}

export function inBush(grid: number[][], x: number, y: number): boolean {
  const cx = Math.floor((x + TANK / 2) / CELL);
  const cy = Math.floor((y + TANK / 2) / CELL);
  if (cx < 0 || cy < 0 || cx >= GRID || cy >= GRID) return false;
  return grid[cy]![cx] === TILE_BUSH;
}

export { TILE_BUSH, TILE_EMPTY };
