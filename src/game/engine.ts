import {
  BULLET,
  CELL,
  CLOCK_TIME,
  DIR_LIST,
  DIRS,
  ENEMIES_PER_STAGE,
  ENEMY_SPAWNS,
  FIRE,
  HELMET_TIME,
  INVULN_SPAWN,
  MAX_ENEMIES,
  PLAYER_SPAWN,
  POWERUP_LIFE,
  SCALE,
  SHOVEL_TIME,
  SPEEDS,
  STAGE_CLEAR_HOLD,
  STAGE_INTRO,
  STEP,
  TANK,
  TILE,
  TOTAL_STAGES,
  VIEW,
  WORLD,
  type DirName,
} from "./constants";
import {
  aabb,
  damageTile,
  inBush,
  isIce,
  snapAxis,
  sweepBullet,
  tankBlocked,
  tryMove,
} from "./collision";
import { Input } from "./input";
import { sfx, unlockAudio } from "./audio";
import {
  drawBoom,
  drawBorder,
  drawBulletSprite,
  drawGround,
  drawParticles,
  drawPickupSprite,
  drawTankSprite,
  drawTiles,
} from "./draw";
import type { Actions, Boom, Bullet, Floater, Mode, Particle, Pickup, PowerKind, Tank, TankKind, UiState } from "./types";
import { buildLevel, shovelBase, resetLevelPool } from "./levels";

const HS_KEY = "steel-eagle-hs";

function loadHs(): number {
  try {
    return Number(localStorage.getItem(HS_KEY) || 0) || 0;
  } catch {
    return 0;
  }
}

function saveHs(n: number): void {
  try {
    localStorage.setItem(HS_KEY, String(n));
  } catch {
    /* ignore */
  }
}

const POWER_CYCLE: PowerKind[] = ["star", "helmet", "clock", "shovel", "bomb", "life", "machinegun"];

export class Engine {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  input = new Input();
  detach: () => void;
  raf = 0;
  acc = 0;
  last = 0;
  time = 0;
  mode: Mode = "title";
  grid: number[][] = [];
  player: Tank;
  enemies: Tank[] = [];
  bullets: Bullet[] = [];
  pickups: Pickup[] = [];
  parts: Particle[] = [];
  booms: Boom[] = [];
  floaters: Floater[] = [];
  score = 0;
  highScore = 0;
  lives = 3;
  stage = 1;
  remaining = ENEMIES_PER_STAGE;
  spawned = 0;
  spawnTimer = 0;
  star = 0;
  clock = 0;
  shovel = 0;
  machinegun = 0;
  intro = 0;
  clearHold = 0;
  nextEnemyId = 2;
  nextBulletId = 1;
  spawnIdx = 0;
  shake = 0;
  hitstop = 0;
  powerIdx = 0;
  reduced = false;
  onUi: (ui: UiState) => void;
  lastUi = "";
  fireHeldTime = 0;

  constructor(canvas: HTMLCanvasElement, onUi: (ui: UiState) => void) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D no disponible");
    this.ctx = ctx;
    this.onUi = onUi;
    this.highScore = loadHs();
    this.player = this.makeTank("player", PLAYER_SPAWN.x, PLAYER_SPAWN.y, 1);
    this.player.live = false;
    this.detach = this.input.attach(window);
    this.reduced =
      typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.grid = buildLevel(1);
    this.emitUi();
    this.wireQa();
    this.last = performance.now();
    this.loop = this.loop.bind(this);
    this.raf = requestAnimationFrame(this.loop);
  }

  destroy(): void {
    cancelAnimationFrame(this.raf);
    this.detach();
    if (typeof window !== "undefined") delete window.__controlsTest;
  }

  setTouch(partial: Partial<Input["touch"]>): void {
    Object.assign(this.input.touch, partial);
  }

  beginGame(): void {
    unlockAudio();
    this.score = 0;
    this.lives = 3;
    this.stage = 1;
    this.star = 0;
    resetLevelPool();
    this.startStage();
    sfx.stage();
  }

  startStage(): void {
    this.grid = buildLevel(this.stage);
    this.enemies = [];
    this.bullets = [];
    this.pickups = [];
    this.parts = [];
    this.booms = [];
    this.floaters = [];
    this.remaining = ENEMIES_PER_STAGE;
    this.spawned = 0;
    this.spawnTimer = 0.4;
    this.spawnIdx = 0;
    this.clock = 0;
    this.shovel = 0;
    this.intro = STAGE_INTRO;
    this.clearHold = 0;
    this.mode = "stageIntro";
    this.respawnPlayer(true);
    this.emitUi();
  }

  respawnPlayer(silent = false): void {
    const p = this.makeTank("player", PLAYER_SPAWN.x, PLAYER_SPAWN.y, 1);
    p.invuln = INVULN_SPAWN;
    p.dir = "up";
    this.player = p;
    if (!silent) sfx.spawn();
  }

  makeTank(kind: TankKind, x: number, y: number, hp: number): Tank {
    const speed =
      kind === "player" ? SPEEDS.player : kind === "fast" ? SPEEDS.fast : kind === "armor" ? SPEEDS.armor : SPEEDS.basic;
    return {
      id: kind === "player" ? 1 : this.nextEnemyId++,
      kind,
      x,
      y,
      px: x,
      py: y,
      dir: kind === "player" ? "up" : "down",
      hp,
      maxHp: hp,
      speed,
      cooldown: kind === "player" ? 0 : 0.8 + Math.random() * 1.2,
      invuln: kind === "player" ? 0 : 0.6,
      frozen: 0,
      flash: 0,
      drop: false,
      stuck: 0,
      think: 0.2 + Math.random() * 0.6,
      moveTime: 0,
      lastX: x,
      lastY: y,
      live: true,
    };
  }

  emitUi(): void {
    const ui: UiState = {
      mode: this.mode,
      score: this.score,
      highScore: this.highScore,
      lives: this.lives,
      stage: this.stage,
      enemiesLeft: this.remaining + this.enemies.filter((e) => e.live).length,
      star: this.star,
      shield: this.player.invuln > 0,
      frozen: this.clock > 0,
      message: this.modeMessage(),
    };
    const key = JSON.stringify(ui);
    if (key === this.lastUi) return;
    this.lastUi = key;
    this.onUi(ui);
  }

  modeMessage(): string {
    switch (this.mode) {
      case "stageIntro":
        return `NIVEL ${this.stage}`;
      case "stageClear":
        return "NIVEL SUPERADO";
      case "gameOver":
        return "GAME OVER";
      case "win":
        return "VICTORIA";
      case "paused":
        return "PAUSA";
      default:
        return "";
    }
  }

  loop(now: number): void {
    this.raf = requestAnimationFrame(this.loop);
    const raw = Math.min(0.1, (now - this.last) / 1000);
    this.last = now;
    this.acc += raw;
    const actions = this.input.poll(STEP);
    if (this.mode === "playing" && actions.pausePressed) {
      this.mode = "paused";
      this.emitUi();
    } else if (this.mode === "paused" && actions.pausePressed) {
      this.mode = "playing";
      this.emitUi();
    }
    if (this.mode === "title" && actions.firePressed) {
      this.input.consumeFire();
      this.beginGame();
    } else if ((this.mode === "gameOver" || this.mode === "win") && actions.firePressed) {
      this.input.consumeFire();
      this.mode = "title";
      this.emitUi();
    } else if (this.mode === "paused" && actions.firePressed) {
      this.mode = "playing";
      this.emitUi();
    }

    let steps = 0;
    while (this.acc >= STEP && steps < 5) {
      this.acc -= STEP;
      steps++;
      if (this.hitstop > 0) {
        this.hitstop -= STEP;
        continue;
      }
      if (this.mode === "playing" || this.mode === "stageIntro" || this.mode === "stageClear") {
        this.step(STEP, actions);
      }
    }
    const alpha = this.acc / STEP;
    this.draw(alpha);
    this.time += raw;
    if (this.shake > 0) this.shake = Math.max(0, this.shake - raw * 2.4);
  }

  step(dt: number, actions: Actions): void {
    if (this.mode === "stageIntro") {
      this.intro -= dt;
      this.tickFx(dt);
      if (this.intro <= 0) {
        this.mode = "playing";
        this.emitUi();
      }
      return;
    }
    if (this.mode === "stageClear") {
      this.clearHold -= dt;
      this.tickFx(dt);
      if (this.clearHold <= 0) {
        if (this.stage >= TOTAL_STAGES) {
          this.mode = "win";
          sfx.win();
          this.recordHs();
        } else {
          this.stage += 1;
          this.startStage();
          sfx.stage();
        }
        this.emitUi();
      }
      return;
    }

    if (this.clock > 0) this.clock = Math.max(0, this.clock - dt);
    if (this.shovel > 0) {
      this.shovel -= dt;
      if (this.shovel <= 0) shovelBase(this.grid, false);
    }

    if (this.machinegun > 0) this.machinegun = Math.max(0, this.machinegun - dt);

    this.stepPlayer(dt, actions);
    this.stepEnemies(dt);
    this.stepBullets(dt);
    this.stepPickups(dt);
    this.tickFx(dt);
    this.trySpawn(dt);
    this.checkStageClear();
    this.emitUi();
  }

  allTanks(): Tank[] {
    return [this.player, ...this.enemies];
  }

  stepPlayer(dt: number, actions: Actions): void {
    const p = this.player;
    if (!p.live) return;
    if (p.invuln > 0) p.invuln = Math.max(0, p.invuln - dt);
    if (p.cooldown > 0) p.cooldown = Math.max(0, p.cooldown - dt);
    p.px = p.x;
    p.py = p.y;

    let dir: DirName | null = null;
    // Last orthogonal wins; no diagonals (Battle City). Priority: newest axis.
    if (actions.up) dir = "up";
    if (actions.down) dir = "down";
    if (actions.left) dir = "left";
    if (actions.right) dir = "right";
    // If two opposing, prefer the one matching current facing
    if (actions.up && actions.down) dir = p.dir === "down" ? "down" : "up";
    if (actions.left && actions.right) dir = p.dir === "right" ? "right" : "left";
    // If both axes held, keep current axis if still held, else the latest cardinally
    if ((actions.up || actions.down) && (actions.left || actions.right)) {
      if (p.dir === "up" && actions.up) dir = "up";
      else if (p.dir === "down" && actions.down) dir = "down";
      else if (p.dir === "left" && actions.left) dir = "left";
      else if (p.dir === "right" && actions.right) dir = "right";
    }

   const icy = isIce(this.grid, p.x, p.y, TANK, TANK);
    let isSliding = false;

    if (icy) {
      // 1. Intentamos deslizar el tanque en su dirección actual con mayor velocidad (1.3x)
      const others = this.enemies.filter((e) => e.live);
      const res = tryMove(this.grid, p.x, p.y, p.dir, p.speed * 1.3 * dt, others, p.id);
      
      if (res.moved) {
        p.x = res.x;
        p.y = res.y;
        p.moveTime += dt;
        isSliding = true; // Si patina con éxito, bloqueamos el control del jugador
      }
    }

    if (!isSliding && dir) {
      // 2. Movimiento y control normal (si no está patinando o si chocó estando en el hielo)
      if (dir !== p.dir) {
        if (dir === "left" || dir === "right") p.y = snapAxis(p.y);
        else p.x = snapAxis(p.x);
        p.dir = dir;
      }
      const others = this.enemies.filter((e) => e.live);
      const res = tryMove(this.grid, p.x, p.y, dir, p.speed * dt, others, p.id);
      p.x = res.x;
      p.y = res.y;
      if (res.moved) p.moveTime += dt;
    }

    const maxB = this.machinegun > 0 ? 5 : (this.star >= 2 ? FIRE.playerMaxBulletsStar : FIRE.playerMaxBullets);
    const mine = this.bullets.filter((b) => b.live && b.owner === "player").length;
    
    if (actions.fire && p.cooldown <= 0 && mine < maxB) {
      this.shoot(p, "player");
      // Si tienes machinegun, el cooldown es casi nulo (0.05s), sino usa el normal
      p.cooldown = this.machinegun > 0 ? 0.05 : (this.star >= 1 ? 0.2 : FIRE.playerCooldown);
      this.input.consumeFire();
    }

    for (const pk of this.pickups) {
      if (aabb(p.x, p.y, TANK, TANK, pk.x, pk.y, TILE, TILE)) {
        this.applyPower(pk.kind);
        pk.life = 0;
      }
    }
    this.pickups = this.pickups.filter((pk) => pk.life > 0);
  }

  stepEnemies(dt: number): void {
    const frozen = this.clock > 0;
    const othersBase = [this.player, ...this.enemies];
    for (const e of this.enemies) {
      if (!e.live) continue;
      e.px = e.x;
      e.py = e.y;
      if (e.invuln > 0) e.invuln = Math.max(0, e.invuln - dt);
      if (e.flash > 0) e.flash = Math.max(0, e.flash - dt);
      if (e.cooldown > 0) e.cooldown = Math.max(0, e.cooldown - dt);
      if (frozen) continue;

      e.think -= dt;
      const moved = Math.hypot(e.x - e.lastX, e.y - e.lastY);
      e.stuck += dt;
      if (moved > 1) {
        e.lastX = e.x;
        e.lastY = e.y;
        e.stuck = 0;
      }

      if (e.think <= 0 || e.stuck > 0.7) {
        e.dir = this.pickEnemyDir(e);
        if (e.dir === "left" || e.dir === "right") e.y = snapAxis(e.y);
        else e.x = snapAxis(e.x);
        e.think = 0.45 + Math.random() * (1.1 - this.stage * 0.05);
        e.stuck = 0;
      }

      const others = othersBase.filter((o) => o.live && o.id !== e.id);
      const res = tryMove(this.grid, e.x, e.y, e.dir, e.speed * dt, others, e.id);
      e.x = res.x;
      e.y = res.y;
      if (res.moved) e.moveTime += dt;
      else e.think = 0;

      const fireCd = Math.max(0.85, 2.6 - this.stage * 0.18);
      if (e.cooldown <= 0 && Math.random() < this.enemyFireChance(e)) {
        // Don't snipe from spawn invuln
        if (e.invuln <= 0) {
          this.shoot(e, "enemy");
          e.cooldown = fireCd + Math.random() * 0.6;
        }
      }
    }
  }

  enemyFireChance(e: Tank): number {
    const p = this.player;
    if (!p.live) return 0.01;
    const alignedX = Math.abs(e.x - p.x) < 14;
    const alignedY = Math.abs(e.y - p.y) < 14;
    const facing =
      (e.dir === "up" && p.y < e.y && alignedX) ||
      (e.dir === "down" && p.y > e.y && alignedX) ||
      (e.dir === "left" && p.x < e.x && alignedY) ||
      (e.dir === "right" && p.x > e.x && alignedY);
    const towardBase =
      (e.dir === "down" && Math.abs(e.x - 6 * TILE) < 20) ||
      (e.dir === "left" && e.y > WORLD - 40) ||
      (e.dir === "right" && e.y > WORLD - 40);
    if (facing) return this.stage <= 2 ? 0.35 : 0.55;
    if (towardBase) return 0.12;
    return this.stage <= 2 ? 0.015 : 0.03;
  }

  pickEnemyDir(e: Tank): DirName {
    const p = this.player;
    const roll = Math.random();
    const prefer: DirName[] = [];
    // Early levels wander more; later they hunt the base a bit
    const huntPlayer = this.stage <= 2 ? 0.22 : 0.32;
    const huntBase = this.stage <= 3 ? 0.18 : 0.3;
    if (roll < huntPlayer && p.live) {
      if (Math.abs(p.x - e.x) > Math.abs(p.y - e.y)) prefer.push(p.x < e.x ? "left" : "right");
      else prefer.push(p.y < e.y ? "up" : "down");
    } else if (roll < huntPlayer + huntBase) {
      const bx = 6 * TILE;
      const by = 12 * TILE;
      if (Math.abs(bx - e.x) > Math.abs(by - e.y)) prefer.push(bx < e.x ? "left" : "right");
      else prefer.push(by < e.y ? "up" : "down");
    }
    const options = DIR_LIST.filter((d) => {
      const nx = e.x + DIRS[d].x * 4;
      const ny = e.y + DIRS[d].y * 4;
      return !tankBlocked(this.grid, nx, ny);
    });
    const pool = options.length ? options : DIR_LIST;
    if (prefer.length && pool.includes(prefer[0]!) && Math.random() < 0.75) return prefer[0]!;
    // Occasional "mistake"
    if (Math.random() < 0.12) return pool[(Math.random() * pool.length) | 0]!;
    return pool[(Math.random() * pool.length) | 0]!;
  }

  shoot(tank: Tank, owner: "player" | "enemy"): void {
    const d = DIRS[tank.dir];
    const cx = tank.x + TANK / 2 - BULLET / 2 + d.x * 8;
    const cy = tank.y + TANK / 2 - BULLET / 2 + d.y * 8;
    const speed = owner === "player" ? SPEEDS.playerBullet + this.star * 16 : SPEEDS.enemyBullet;
    const power = owner === "player" ? Math.min(3, 1 + (this.star >= 3 ? 2 : 0)) : 1;
    this.bullets.push({
      id: this.nextBulletId++,
      x: cx,
      y: cy,
      px: cx,
      py: cy,
      dir: tank.dir,
      owner,
      speed,
      power,
      live: true,
    });
    if (owner === "player") sfx.shoot();
  }

  stepBullets(dt: number): void {
    for (const b of this.bullets) {
      if (!b.live) continue;
      b.px = b.x;
      b.py = b.y;
      const d = DIRS[b.dir];
      const nx = b.x + d.x * b.speed * dt;
      const ny = b.y + d.y * b.speed * dt;
      const canSteel = b.owner === "player" && b.power >= 3;
      const hit = sweepBullet(this.grid, b.x + 2, b.y + 2, nx + 2, ny + 2, canSteel);
      
      if (hit.kind === "tile") {
        b.live = false;
        let res: "brick" | "steel" | "eagle" | "none" = "none";

        // Lógica modificada para impactar 2 bloques adyacentes
        if (b.dir === "up" || b.dir === "down") {
          // Si viaja en vertical, calculamos el ancho de la bala (en el eje X)
          const gx1 = Math.floor(b.x / CELL);
          const gx2 = Math.floor((b.x + BULLET - 0.1) / CELL);
          const r1 = damageTile(this.grid, gx1, hit.gy, b.power);
          const r2 = damageTile(this.grid, gx2, hit.gy, b.power);
          res = r1 !== "none" ? r1 : r2;
        } else {
          // Si viaja en horizontal, calculamos el alto de la bala (en el eje Y)
          const gy1 = Math.floor(b.y / CELL);
          const gy2 = Math.floor((b.y + BULLET - 0.1) / CELL);
          const r1 = damageTile(this.grid, hit.gx, gy1, b.power);
          const r2 = damageTile(this.grid, hit.gx, gy2, b.power);
          res = r1 !== "none" ? r1 : r2;
        }

        this.burst(hit.gx * CELL + 4, hit.gy * CELL + 4, res === "steel" ? "#9aa4ae" : "#d06040", 6);
        if (res === "eagle") {
          sfx.boom(true);
          this.shake = this.reduced ? 0 : 0.55;
          this.killEagle();
        } else if (res === "steel" && b.power < 3) {
          sfx.steel();
        } else if (res === "brick") {
          sfx.hit();
        }
        continue;
      }
      b.x = nx;
      b.y = ny;

      // vs tanks
      if (b.owner === "player") {
        for (const e of this.enemies) {
          if (!e.live || e.invuln > 0) continue;
          if (this.bulletHitsTank(b, e)) {
            b.live = false;
            this.hurtEnemy(e);
            break;
          }
        }
      } else if (this.player.live && this.player.invuln <= 0 && this.bulletHitsTank(b, this.player)) {
        b.live = false;
        this.hurtPlayer();
      }
    }
    this.bullets = this.bullets.filter((b) => b.live);
  }

  bulletHitsTank(b: Bullet, t: Tank): boolean {
    // Generous vs enemies, slightly tight vs player — fairness
    const pad = b.owner === "player" ? -1 : 1;
    return aabb(b.x - 1, b.y - 1, BULLET + 2, BULLET + 2, t.x + pad, t.y + pad, TANK - pad * 2, TANK - pad * 2);
  }

  hurtEnemy(e: Tank): void {
    e.hp -= 1;
    e.flash = 0.08;
    this.hitstop = this.reduced ? 0 : 0.03;
    if (e.hp <= 0) {
      e.live = false;
      const pts = e.kind === "armor" ? 400 : e.kind === "fast" ? 200 : 100;
      this.addScore(pts, e.x, e.y);
      this.boom(e.x + 8, e.y + 8, false);
      sfx.boom(false);
      if (e.drop) this.spawnPickup(e.x, e.y);
      this.remaining = Math.max(0, this.remaining);
    } else {
      sfx.hit();
    }
  }

  hurtPlayer(): void {
    this.boom(this.player.x + 8, this.player.y + 8, false);
    sfx.boom(true);
    this.shake = this.reduced ? 0 : 0.4;
    this.player.live = false;
    this.star = Math.max(0, this.star - 1);
    this.lives -= 1;
    if (this.lives <= 0) {
      this.mode = "gameOver";
      sfx.over();
      this.recordHs();
      return;
    }
    this.respawnPlayer();
  }

  killEagle(): void {
    this.mode = "gameOver";
    sfx.over();
    this.recordHs();
    this.boom(6 * TILE + 8, 12 * TILE + 8, true);
  }

  trySpawn(dt: number): void {
    const alive = this.enemies.filter((e) => e.live).length;
    if (this.spawned >= ENEMIES_PER_STAGE || alive >= MAX_ENEMIES) return;
    this.spawnTimer -= dt;
    if (this.spawnTimer > 0) return;
    const slot = ENEMY_SPAWNS[this.spawnIdx % ENEMY_SPAWNS.length]!;
    this.spawnIdx++;
    // Don't stack on an existing tank
    const blocked = this.allTanks().some(
      (t) => t.live && aabb(slot.x, slot.y, TANK, TANK, t.x, t.y, TANK, TANK),
    );
    if (blocked) {
      this.spawnTimer = 0.35;
      return;
    }
    const kind = this.rollKind();
    const hp = kind === "armor" ? (this.stage >= 6 ? 4 : 3) : 1;
    const tank = this.makeTank(kind, slot.x, slot.y, hp);
    tank.drop = this.spawned % 5 === 3;
    this.enemies.push(tank);
    this.spawned += 1;
    this.remaining = ENEMIES_PER_STAGE - this.spawned;
    this.spawnTimer = Math.max(1.15, 2.4 - this.stage * 0.12);
    sfx.spawn();
  }

  rollKind(): TankKind {
    if (this.stage <= 1) return Math.random() < 0.12 ? "fast" : "basic";
    if (this.stage === 2) {
      const r = Math.random();
      if (r < 0.2) return "fast";
      return "basic";
    }
    if (this.stage <= 4) {
      const r = Math.random();
      if (r < 0.18) return "armor";
      if (r < 0.45) return "fast";
      return "basic";
    }
    const r = Math.random();
    if (r < 0.28) return "armor";
    if (r < 0.6) return "fast";
    return "basic";
  }

  spawnPickup(x: number, y: number): void {
    const kind = POWER_CYCLE[this.powerIdx % POWER_CYCLE.length]!;
    this.powerIdx++;
    const px = Math.max(0, Math.min(WORLD - TILE, snapAxis(x)));
    const py = Math.max(0, Math.min(WORLD - TILE, snapAxis(y)));
    this.pickups.push({ kind, x: px, y: py, life: POWERUP_LIFE, bob: Math.random() * 6 });
    sfx.pickup();
  }

  applyPower(kind: PowerKind): void {
    sfx.power();
    this.addScore(500, this.player.x, this.player.y);
    if (kind === "star") {
      this.star = Math.min(3, this.star + 1);
    } else if (kind === "life") {
      this.lives += 1;
      sfx.life();
    } else if (kind === "bomb") {
      for (const e of this.enemies) {
        if (!e.live) continue;
        e.live = false;
        this.boom(e.x + 8, e.y + 8, false);
        this.addScore(e.kind === "armor" ? 400 : e.kind === "fast" ? 200 : 100, e.x, e.y);
      }
      sfx.boom(true);
      this.shake = this.reduced ? 0 : 0.35;
    } else if (kind === "clock") {
      this.clock = CLOCK_TIME;
    } else if (kind === "helmet") {
      this.player.invuln = HELMET_TIME;
    } else if (kind === "shovel") {
      this.shovel = SHOVEL_TIME;
      shovelBase(this.grid, true);
    } else if (kind === "machinegun") {
      this.machinegun = 10;
    }
  }

  stepPickups(dt: number): void {
    for (const p of this.pickups) p.life -= dt;
    this.pickups = this.pickups.filter((p) => p.life > 0);
  }

  checkStageClear(): void {
    if (this.mode !== "playing") return;
    const alive = this.enemies.some((e) => e.live);
    if (!alive && this.spawned >= ENEMIES_PER_STAGE) {
      this.mode = "stageClear";
      this.clearHold = STAGE_CLEAR_HOLD;
      this.addScore(1000, this.player.x, this.player.y);
      sfx.stage();
    }
  }

  addScore(n: number, x: number, y: number): void {
    this.score += n;
    this.floaters.push({ x, y, text: String(n), t: 0 });
    if (this.score > this.highScore) {
      this.highScore = this.score;
      saveHs(this.highScore);
    }
  }

  recordHs(): void {
    if (this.score > this.highScore) {
      this.highScore = this.score;
      saveHs(this.highScore);
    }
  }

  boom(x: number, y: number, big: boolean): void {
    this.booms.push({ x, y, t: 0, big });
    this.burst(x, y, "#f0a040", big ? 16 : 10);
  }

  burst(x: number, y: number, color: string, n: number): void {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = 20 + Math.random() * 50;
      this.parts.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        life: 0.25 + Math.random() * 0.25,
        max: 0.45,
        size: 2 + Math.random() * 2,
        color,
      });
    }
  }

  tickFx(dt: number): void {
    for (const p of this.parts) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
    }
    this.parts = this.parts.filter((p) => p.life > 0);
    for (const b of this.booms) b.t += dt;
    this.booms = this.booms.filter((b) => b.t < 0.35);
    for (const f of this.floaters) {
      f.t += dt;
      f.y -= 12 * dt;
    }
    this.floaters = this.floaters.filter((f) => f.t < 0.7);
    if (this.player.flash > 0) this.player.flash -= dt;
  }

  draw(alpha: number): void {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = "#07080a";
    ctx.fillRect(0, 0, w, h);

    const trauma = this.reduced ? 0 : this.shake * this.shake;
    const ox = trauma ? (Math.random() * 2 - 1) * trauma * 8 : 0;
    const oy = trauma ? (Math.random() * 2 - 1) * trauma * 8 : 0;

    const pad = 0;
    ctx.save();
    ctx.translate(pad + ox, pad + oy);

    drawGround(ctx);
    drawTiles(ctx, this.grid, this.time, "base");

    const lerp = (a: number, b: number) => a + (b - a) * alpha;
    for (const e of this.enemies) {
      if (!e.live) continue;
      const hide = inBush(this.grid, e.x, e.y);
      const ghost = { ...e, x: lerp(e.px, e.x), y: lerp(e.py, e.y) };
      drawTankSprite(ctx, ghost, this.time, hide);
    }
    if (this.player.live) {
      const hide = inBush(this.grid, this.player.x, this.player.y);
      const ghost = { ...this.player, x: lerp(this.player.px, this.player.x), y: lerp(this.player.py, this.player.y) };
      drawTankSprite(ctx, ghost, this.time, hide);
    }
    for (const b of this.bullets) {
      if (!b.live) continue;
      const g = { ...b, x: lerp(b.px, b.x), y: lerp(b.py, b.y) };
      drawBulletSprite(ctx, g);
    }
    for (const p of this.pickups) drawPickupSprite(ctx, p, this.time);
    drawTiles(ctx, this.grid, this.time, "bush");
    drawParticles(ctx, this.parts);
    for (const b of this.booms) drawBoom(ctx, b);
    for (const f of this.floaters) {
      ctx.globalAlpha = 1 - f.t / 0.7;
      ctx.fillStyle = "#f4f0d8";
      ctx.font = "bold 10px ui-sans-serif, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(f.text, f.x * SCALE + 8, f.y * SCALE);
      ctx.globalAlpha = 1;
    }
    drawBorder(ctx);
    ctx.restore();

    if (this.mode === "title") this.drawAttractHint(ctx);
  }

  drawAttractHint(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = "rgba(7,8,10,0.18)";
    ctx.fillRect(0, 0, VIEW, VIEW);
  }

  wireQa(): void {
    if (typeof window === "undefined") return;
    window.__controlsTest = {
      getYaw: () => {
        const map: Record<DirName, number> = { up: 0, left: Math.PI / 2, down: Math.PI, right: -Math.PI / 2 };
        return map[this.player.dir];
      },
      getSpeed: () => {
        const dx = this.player.x - this.player.px;
        const dy = this.player.y - this.player.py;
        return Math.hypot(dx, dy) / STEP;
      },
      getPos: () => ({ x: this.player.x, y: this.player.y }),
      setKeys: (codes: string[]) => {
        this.input.qaKeys = new Set(codes);
      },
      setSteer: (v: number) => {
        this.input.qaKeys.clear();
        if (v > 0.3) this.input.qaKeys.add("KeyA");
        else if (v < -0.3) this.input.qaKeys.add("KeyD");
      },
    };
  }
}

declare global {
  interface Window {
    __controlsTest?: {
      getYaw: () => number;
      getSpeed: () => number;
      getPos: () => { x: number; y: number };
      setKeys?: (codes: string[]) => void;
      setSteer?: (v: number) => void;
    };
  }
}
