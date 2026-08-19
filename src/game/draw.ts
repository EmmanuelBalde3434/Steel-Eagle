import {
  CELL,
  DIRS,
  GRID,
  SCALE,
  TANK,
  TILE,
  TILE_BRICK,
  TILE_BUSH,
  TILE_EAGLE,
  TILE_EAGLE_DEAD,
  TILE_EMPTY,
  TILE_ICE,
  TILE_STEEL,
  TILE_WATER,
  VIEW,
} from "./constants";
import type { Boom, Bullet, Particle, Pickup, Tank } from "./types";

const C = {
  ground: "#1a1714",
  ground2: "#151310",
  brick: "#c44c38",
  brickDk: "#8a2c1e",
  brickLt: "#e07858",
  mortar: "#3a2218",
  steel: "#8a94a0",
  steelDk: "#4a5560",
  steelLt: "#c4ccd4",
  water: "#2450a0",
  water2: "#1a3a78",
  water3: "#3a78c8",
  ice: "#9ec8dc",
  ice2: "#6a98b0",
  ice3: "#d4eef4",
  bush: "#2d6b2d",
  bush2: "#1a4a1a",
  bush3: "#4a9a42",
  eagle: "#e8e6e1",
  eagleDk: "#8a8880",
  player: "#e8d44a",
  playerDk: "#b89a18",
  playerLt: "#f4e878",
  basic: "#c8c8c8",
  basicDk: "#7a7a7a",
  fast: "#d05050",
  fastDk: "#8a2020",
  armor: "#4a9a4a",
  armorDk: "#2a5a2a",
  tread: "#2a2a2a",
  hatch: "#3a3010",
  bulletP: "#f4f0c8",
  bulletE: "#f0a0a0",
};

function px(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, c: string): void {
  ctx.fillStyle = c;
  ctx.fillRect(x, y, w, h);
}

export function drawGround(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = C.ground;
  ctx.fillRect(0, 0, VIEW, VIEW);
  ctx.fillStyle = C.ground2;
  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      if ((x + y) % 2 === 0) ctx.fillRect(x * CELL * SCALE, y * CELL * SCALE, CELL * SCALE, CELL * SCALE);
    }
  }
}

export function drawTiles(
  ctx: CanvasRenderingContext2D,
  grid: number[][],
  time: number,
  layer: "base" | "bush",
): void {
  for (let gy = 0; gy < GRID; gy++) {
    for (let gx = 0; gx < GRID; gx++) {
      const t = grid[gy]![gx]!;
      if (t === TILE_EMPTY) continue;
      if (layer === "bush" && t !== TILE_BUSH) continue;
      if (layer === "base" && t === TILE_BUSH) continue;
      const x = gx * CELL * SCALE;
      const y = gy * CELL * SCALE;
      const s = CELL * SCALE;
      if (t === TILE_BRICK) drawBrick(ctx, x, y, s, gx, gy);
      else if (t === TILE_STEEL) drawSteel(ctx, x, y, s, gx, gy);
      else if (t === TILE_WATER) drawWater(ctx, x, y, s, time, gx, gy);
      else if (t === TILE_ICE) drawIce(ctx, x, y, s, gx, gy);
      else if (t === TILE_BUSH) drawBush(ctx, x, y, s, gx, gy);
      else if (t === TILE_EAGLE) drawEagleCell(ctx, x, y, s, gx, gy, false);
      else if (t === TILE_EAGLE_DEAD) drawEagleCell(ctx, x, y, s, gx, gy, true);
    }
  }
}

function drawBrick(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, gx: number, gy: number): void {
  px(ctx, x, y, s, s, C.mortar);
  const odd = (gx + gy) % 2;
  const h = s / 2 - 1;
  if (odd === 0) {
    px(ctx, x + 1, y + 1, s - 2, h, C.brick);
    px(ctx, x + 1, y + 1, s - 2, 2, C.brickLt);
    px(ctx, x + 1, y + s / 2 + 1, s / 2 - 2, h, C.brickDk);
    px(ctx, x + s / 2 + 1, y + s / 2 + 1, s / 2 - 2, h, C.brick);
  } else {
    px(ctx, x + 1, y + 1, s / 2 - 2, h, C.brick);
    px(ctx, x + s / 2 + 1, y + 1, s / 2 - 2, h, C.brickDk);
    px(ctx, x + 1, y + s / 2 + 1, s - 2, h, C.brick);
    px(ctx, x + 1, y + s / 2 + 1, s - 2, 2, C.brickLt);
  }
}

function drawSteel(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, gx: number, gy: number): void {
  px(ctx, x, y, s, s, C.steelDk);
  px(ctx, x + 1, y + 1, s - 2, s - 2, C.steel);
  px(ctx, x + 1, y + 1, s - 2, 2, C.steelLt);
  px(ctx, x + 1, y + 1, 2, s - 2, C.steelLt);
  px(ctx, x + s - 3, y + 2, 2, s - 3, C.steelDk);
  const r = (gx * 3 + gy * 5) % 3;
  px(ctx, x + 3 + r, y + 3, 2, 2, C.steelDk);
  px(ctx, x + s - 6, y + s - 6, 2, 2, C.steelDk);
}

function drawWater(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, time: number, gx: number, gy: number): void {
  px(ctx, x, y, s, s, C.water2);
  const phase = Math.sin(time * 3 + gx * 0.7 + gy * 0.5);
  px(ctx, x, y + 2 + (phase > 0 ? 2 : 0), s, s - 4, C.water);
  ctx.fillStyle = C.water3;
  const ox = ((time * 18 + gy * 6) | 0) % s;
  ctx.fillRect(x + ox, y + 3, 4, 2);
  ctx.fillRect(x + ((ox + s / 2) % s), y + s - 5, 5, 2);
}

function drawIce(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, gx: number, gy: number): void {
  px(ctx, x, y, s, s, C.ice);
  px(ctx, x + 1, y + 1, s - 2, 2, C.ice3);
  px(ctx, x + 1, y + 1, 2, s - 2, C.ice3);
  if ((gx + gy) % 2 === 0) px(ctx, x + 4, y + 5, 5, 1, C.ice2);
  else px(ctx, x + 3, y + 8, 6, 1, C.ice3);
}

function drawBush(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, gx: number, gy: number): void {
  px(ctx, x + 1, y + 2, s - 2, s - 3, C.bush2);
  px(ctx, x + 2, y + 1, s - 5, s - 4, C.bush);
  if ((gx + gy) % 2 === 0) px(ctx, x + 3, y + 3, 4, 3, C.bush3);
  else px(ctx, x + 5, y + 5, 4, 3, C.bush3);
}

function drawEagleCell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  gx: number,
  gy: number,
  dead: boolean,
): void {
  // 2x2 eagle — draw only from the top-left cell of the pair
  const lx = gx % 2;
  const ly = gy % 2;
  if (lx !== 0 || ly !== 0) return;
  const X = x;
  const Y = y;
  const S = s * 2;
  px(ctx, X, Y, S, S, dead ? "#2a1a14" : "#2a2620");
  px(ctx, X + 2, Y + 2, S - 4, S - 4, dead ? "#4a3028" : "#3a3630");
  if (dead) {
    ctx.strokeStyle = "#6a4030";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(X + 6, Y + 6);
    ctx.lineTo(X + S - 6, Y + S - 6);
    ctx.moveTo(X + S - 6, Y + 6);
    ctx.lineTo(X + 6, Y + S - 6);
    ctx.stroke();
    return;
  }
  const e = C.eagle;
  const d = C.eagleDk;
  // Simple heraldic eagle
  px(ctx, X + 14, Y + 6, 4, 4, e);
  px(ctx, X + 12, Y + 10, 8, 3, e);
  px(ctx, X + 6, Y + 12, 20, 4, e);
  px(ctx, X + 4, Y + 15, 8, 3, d);
  px(ctx, X + 20, Y + 15, 8, 3, d);
  px(ctx, X + 13, Y + 16, 6, 8, e);
  px(ctx, X + 10, Y + 22, 5, 4, d);
  px(ctx, X + 17, Y + 22, 5, 4, d);
  px(ctx, X + 14, Y + 8, 2, 2, "#c44c38");
}

const palettes = {
  player: { body: C.player, dk: C.playerDk, lt: C.playerLt, hatch: C.hatch },
  basic: { body: C.basic, dk: C.basicDk, lt: "#ececec", hatch: "#333" },
  fast: { body: C.fast, dk: C.fastDk, lt: "#f08080", hatch: "#401010" },
  armor: { body: C.armor, dk: C.armorDk, lt: "#7aba72", hatch: "#142014" },
};

export function drawTankSprite(
  ctx: CanvasRenderingContext2D,
  tank: Tank,
  time: number,
  hidden: boolean,
): void {
  if (!tank.live) return;
  if (tank.invuln > 0 && Math.floor(time * 14) % 2 === 0 && tank.kind === "player") {
    // still draw a faint body so the player can track themselves
  }
  const x = tank.x * SCALE;
  const y = tank.y * SCALE;
  const s = TANK * SCALE;
  ctx.save();
  ctx.translate(x + s / 2, y + s / 2);
  ctx.rotate((DIRS[tank.dir].angle * Math.PI) / 2);
  if (hidden) ctx.globalAlpha = 0.28;
  else if (tank.invuln > 0 && tank.kind === "player" && Math.floor(time * 14) % 2 === 0) ctx.globalAlpha = 0.45;
  if (tank.flash > 0) ctx.globalAlpha = 1;

  const kind = tank.kind === "player" ? "player" : tank.kind;
  let pal = palettes[kind];
  if (tank.drop && Math.floor(time * 8) % 2 === 0) {
    pal = { body: "#f4f4f0", dk: "#b0b0a8", lt: "#ffffff", hatch: "#444" };
  }
  if (tank.flash > 0) pal = { body: "#ffffff", dk: "#ddd", lt: "#fff", hatch: "#888" };
  if (tank.kind === "armor" && tank.hp < tank.maxHp) {
    const hurt = ["#c8b44a", "#d08030", "#c8c8c8"][Math.max(0, tank.hp - 1)] ?? pal.body;
    pal = { ...pal, body: hurt };
  }

  const treads = Math.floor(tank.moveTime * 10) % 2;
  // treads (left / right while facing up)
  px(ctx, -s / 2 + 1, -s / 2 + 4, 6, s - 8, C.tread);
  px(ctx, s / 2 - 7, -s / 2 + 4, 6, s - 8, C.tread);
  ctx.fillStyle = pal.dk;
  for (let i = 0; i < 5; i++) {
    const yy = -s / 2 + 6 + i * 5 + treads * 2;
    ctx.fillRect(-s / 2 + 2, yy, 4, 2);
    ctx.fillRect(s / 2 - 6, yy, 4, 2);
  }
  // hull
  px(ctx, -9, -10, 18, 22, pal.dk);
  px(ctx, -8, -9, 16, 20, pal.body);
  px(ctx, -7, -8, 14, 3, pal.lt);
  // hatch
  px(ctx, -4, -2, 8, 8, pal.hatch);
  px(ctx, -3, -1, 6, 6, pal.dk);
  px(ctx, -2, 0, 4, 4, pal.body);
  // cannon
  px(ctx, -3, -s / 2 + 1, 6, 10, pal.dk);
  px(ctx, -2, -s / 2, 4, 11, pal.body);
  if (tank.kind === "armor") {
    px(ctx, -10, -6, 3, 12, pal.lt);
    px(ctx, 7, -6, 3, 12, pal.lt);
  }
  if (tank.invuln > 0 && tank.kind === "player" && !hidden) {
    ctx.strokeStyle = "rgba(200,220,255,0.85)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, s / 2 - 1, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawBulletSprite(ctx: CanvasRenderingContext2D, b: Bullet): void {
  if (!b.live) return;
  const x = b.x * SCALE;
  const y = b.y * SCALE;
  const col = b.owner === "player" ? C.bulletP : C.bulletE;
  px(ctx, x, y, 6, 6, "#1a1a14");
  px(ctx, x + 1, y + 1, 4, 4, col);
  if (b.owner === "player") px(ctx, x + 1, y + 1, 2, 2, "#fff");
}

export function drawPickupSprite(ctx: CanvasRenderingContext2D, p: Pickup, time: number): void {
  const bob = Math.sin(time * 6 + p.bob) * 2;
  const x = p.x * SCALE;
  const y = p.y * SCALE + bob;
  const s = TILE * SCALE;
  px(ctx, x, y, s, s, "#1a1408");
  px(ctx, x + 2, y + 2, s - 4, s - 4, "#c4a030");
  px(ctx, x + 3, y + 3, s - 6, s - 6, "#f0d060");
  ctx.fillStyle = "#2a1a08";
  ctx.font = "bold 14px ui-sans-serif, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const glyph: Record<string, string> = {
    star: "★",
    life: "+",
    bomb: "●",
    clock: "◷",
    helmet: "▣",
    shovel: "T",
  };
  ctx.fillText(glyph[p.kind] ?? "?", x + s / 2, y + s / 2 + 1);
}

export function drawBoom(ctx: CanvasRenderingContext2D, b: Boom): void {
  const t = b.t;
  const x = b.x * SCALE;
  const y = b.y * SCALE;
  const max = b.big ? 22 : 14;
  const r = Math.min(max, t * 90);
  const a = Math.max(0, 1 - t / 0.35);
  ctx.save();
  ctx.globalAlpha = a;
  ctx.fillStyle = t < 0.08 ? "#fff6d0" : t < 0.18 ? "#f0a040" : "#803018";
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawParticles(ctx: CanvasRenderingContext2D, parts: Particle[]): void {
  for (const p of parts) {
    const a = Math.max(0, p.life / p.max);
    ctx.globalAlpha = a;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x * SCALE, p.y * SCALE, p.size, p.size);
  }
  ctx.globalAlpha = 1;
}

export function drawBorder(ctx: CanvasRenderingContext2D): void {
  ctx.strokeStyle = "#3a3d44";
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, VIEW - 2, VIEW - 2);
}
