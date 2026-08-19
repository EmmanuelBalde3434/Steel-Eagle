import type { DirName } from "./constants";

export type Mode =
  | "title"
  | "stageIntro"
  | "playing"
  | "paused"
  | "stageClear"
  | "gameOver"
  | "win";

export type TankKind = "player" | "basic" | "fast" | "armor";

export type PowerKind = "star" | "life" | "bomb" | "clock" | "helmet" | "shovel";

export type Tank = {
  id: number;
  kind: TankKind;
  x: number;
  y: number;
  px: number;
  py: number;
  dir: DirName;
  hp: number;
  maxHp: number;
  speed: number;
  cooldown: number;
  invuln: number;
  frozen: number;
  flash: number;
  drop: boolean;
  stuck: number;
  think: number;
  moveTime: number;
  lastX: number;
  lastY: number;
  live: boolean;
};

export type Bullet = {
  id: number;
  x: number;
  y: number;
  px: number;
  py: number;
  dir: DirName;
  owner: "player" | "enemy";
  speed: number;
  power: number;
  live: boolean;
};

export type Pickup = {
  kind: PowerKind;
  x: number;
  y: number;
  life: number;
  bob: number;
};

export type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  color: string;
};

export type Boom = {
  x: number;
  y: number;
  t: number;
  big: boolean;
};

export type Floater = {
  x: number;
  y: number;
  text: string;
  t: number;
};

export type UiState = {
  mode: Mode;
  score: number;
  highScore: number;
  lives: number;
  stage: number;
  enemiesLeft: number;
  star: number;
  shield: boolean;
  frozen: boolean;
  message: string;
};

export type Actions = {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  fire: boolean;
  firePressed: boolean;
  pausePressed: boolean;
};
