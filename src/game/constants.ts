export const CELL = 8;
export const TILE = 16;
export const MAP = 13;
export const GRID = 26;
export const WORLD = GRID * CELL; // 208
export const TANK = 16;
export const TANK_HIT = 14;
export const BULLET = 4;
export const SCALE = 2;
export const VIEW = WORLD * SCALE; // 416
export const HUD_W = 96;
export const STEP = 1 / 60;

export const DIRS = {
  up: { x: 0, y: -1, angle: 0 },
  right: { x: 1, y: 0, angle: 1 },
  down: { x: 0, y: 1, angle: 2 },
  left: { x: -1, y: 0, angle: 3 },
} as const;

export type DirName = keyof typeof DIRS;

export const DIR_LIST: DirName[] = ["up", "right", "down", "left"];

export const PLAYER_SPAWN = { x: 4 * TILE, y: 12 * TILE };
export const EAGLE_TILE = { tx: 6, ty: 12 };
export const ENEMY_SPAWNS = [
  { x: 0, y: 0 },
  { x: 6 * TILE, y: 0 },
  { x: 12 * TILE, y: 0 },
];

export const ENEMIES_PER_STAGE = 20;
export const MAX_ENEMIES = 4;

export const SPEEDS = {
  player: 56,
  basic: 38,
  fast: 78,
  armor: 32,
  playerBullet: 176,
  enemyBullet: 112,
};

export const FIRE = {
  playerCooldown: 0.26,
  playerMaxBullets: 1,
  playerMaxBulletsStar: 2,
};

export const INVULN_SPAWN = 3.1;
export const HELMET_TIME = 10;
export const CLOCK_TIME = 8.5;
export const SHOVEL_TIME = 18;
export const STAGE_INTRO = 1.7;
export const STAGE_CLEAR_HOLD = 2.2;
export const POWERUP_LIFE = 16;

export const TILE_EMPTY = 0;
export const TILE_BRICK = 1;
export const TILE_STEEL = 2;
export const TILE_WATER = 3;
export const TILE_ICE = 4;
export const TILE_BUSH = 5;
export const TILE_EAGLE = 6;
export const TILE_EAGLE_DEAD = 7;

export const TOTAL_STAGES = 15;
