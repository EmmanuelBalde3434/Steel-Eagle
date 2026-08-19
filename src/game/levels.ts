import {
  EAGLE_TILE,
  GRID,
  MAP,
  TILE_BRICK,
  TILE_BUSH,
  TILE_EAGLE,
  TILE_EAGLE_DEAD,
  TILE_EMPTY,
  TILE_ICE,
  TILE_STEEL,
  TILE_WATER,
} from "./constants";

const LEGEND: Record<string, number> = {
  ".": TILE_EMPTY,
  "#": TILE_BRICK,
  "@": TILE_STEEL,
  "~": TILE_WATER,
  "-": TILE_ICE,
  "%": TILE_BUSH,
};

const RAW: string[] = [
  // 1 — open lanes, easy reading
  `
.............
.#.#.#.#.#.#.
.............
.#.#.#.#.#.#.
.............
.#.#.#.#.#.#.
.............
.#.#.#.#.#.#.
.............
.#.#.#.#.#.#.
.............
.............
.............
`,
  // 2 — brick rooms
  `
.............
.#####.#####.
.#...#.#...#.
.#.#.#.#.#.#.
.#.#...#.#.#.
.#.#####.#.#.
.............
.#.#####.#.#.
.#.#...#.#.#.
.#.#.#.#.#.#.
.#...#.#...#.
.#####.#####.
.............
`,
  // 3 — water canals + first bushes
  `
.............
.##~~~##~~~##
.#...........
.##.#.%%%.#.#
....#.....#..
###.#.###.#.#
....#.....#..
.#.#.%%%#.#.#
.#...........
.##~~~##~~~##
.............
.##.....##...
.............
`,
  // 4 — ice + vegetation
  `
.............
.##--##--##.#
.#..........#
.#.%#.##.#%.#
.--......--..
.#.#.####.#.#
.............
.#.#.%%%%.#.#
.--......--..
.#.%#.##.#%.#
.#..........#
.##--##--##.#
.............
`,
  // 5 — mixed fortress
  `
@...........@
.##.~~~~~.##.
.#....%....#.
.#.##.#.##.#.
....#...#....
##.#.@@@.#.##
....#...#....
.#.##.#.##.#.
.#....%....#.
.##.~~~~~.##.
.%.........% .
.##.....##...
.............
`,
  // 6 — dense cover + ice
  `
.............
.%%#--#--#%%.
.#.........#.
.#.%@%%%@%.#.
.--.......--.
.#.#.~.~.#.#.
.............
.#.#.~.~.#.#.
.--.......--.
.#.%@%%%@%.#.
.#.........#.
.%%#--#--#%%.
.............
`,
  // 7 — moat
  `
.............
.@@@.....@@@.
.@~~~#.#~~~@.
.@~.......~@.
.#~.##.##.~#.
....#...#....
~~~.#.@.#.~~~
....#...#....
.#~.##.##.~#.
.@~.......~@.
.@~~~#.#~~~@.
.@@@.....@@@.
.............
`,
  // 8 — final gauntlet
  `
@.@.@.@.@.@.@
.#%~-#%-~#%.#
.............
.#@#.%.%.#@#.
-~-.......-~-
.#.#.@@@.#.#.
.............
.#.#.@@@.#.#.
-~-.......-~-
.#@#.%.%.#@#.
.............
.#%~-#%-~#%.#
@.@.@.@.@.@.@
`,
];

function parseMap(src: string): number[][] {
  const rows = src
    .trim()
    .split("\n")
    .map((r) => r.trimEnd().padEnd(MAP, ".").slice(0, MAP));
  while (rows.length < MAP) rows.push(".".repeat(MAP));
  const grid: number[][] = [];
  for (let gy = 0; gy < GRID; gy++) {
    grid[gy] = [];
    for (let gx = 0; gx < GRID; gx++) {
      const ch = rows[gy >> 1]?.[gx >> 1] ?? ".";
      grid[gy]![gx] = LEGEND[ch] ?? TILE_EMPTY;
    }
  }
  return grid;
}

function armorForStage(stage: number): number {
  if (stage <= 2) return TILE_STEEL;
  if (stage === 3) return TILE_STEEL;
  if (stage <= 5) return TILE_BRICK;
  return TILE_BRICK;
}

/** U-shaped base shield. Weakens after stage 3; later stages leave gaps. */
export function applyBase(grid: number[][], stage: number): void {
  const { tx, ty } = EAGLE_TILE;
  for (let y = 0; y < 2; y++) {
    for (let x = 0; x < 2; x++) {
      const gy = ty * 2 + y;
      const gx = tx * 2 + x;
      if (grid[gy]) grid[gy][gx] = TILE_EAGLE;
    }
  }
  const mat = armorForStage(stage);
  const spots: [number, number][] = [
    [tx * 2 - 1, ty * 2 - 1],
    [tx * 2, ty * 2 - 1],
    [tx * 2 + 1, ty * 2 - 1],
    [tx * 2 + 2, ty * 2 - 1],
    [tx * 2 - 1, ty * 2],
    [tx * 2 + 2, ty * 2],
    [tx * 2 - 1, ty * 2 + 1],
    [tx * 2 + 2, ty * 2 + 1],
  ];
  for (const [gx, gy] of spots) {
    if (gx < 0 || gy < 0 || gx >= GRID || gy >= GRID) continue;
    if (stage >= 7 && (gx + gy) % 3 === 0) {
      grid[gy]![gx] = TILE_EMPTY;
      continue;
    }
    if (stage === 4 && (gx + gy) % 2 === 0) {
      grid[gy]![gx] = TILE_BRICK;
      continue;
    }
    grid[gy]![gx] = mat;
  }
  // Keep spawn lanes open
  for (let x = 0; x < 4; x++) {
    grid[0]![x] = TILE_EMPTY;
    grid[1]![x] = TILE_EMPTY;
    grid[0]![GRID - 1 - x] = TILE_EMPTY;
    grid[1]![GRID - 1 - x] = TILE_EMPTY;
  }
  for (let x = 11; x < 15; x++) {
    grid[0]![x] = TILE_EMPTY;
    grid[1]![x] = TILE_EMPTY;
  }
  // Player spawn (tile 4,12)
  for (let y = 24; y < 26; y++) {
    for (let x = 8; x < 12; x++) {
      if (grid[y]![x] !== TILE_EAGLE) grid[y]![x] = TILE_EMPTY;
    }
  }
}

export function shovelBase(grid: number[][], steel: boolean): void {
  const { tx, ty } = EAGLE_TILE;
  const mat = steel ? TILE_STEEL : TILE_BRICK;
  const spots: [number, number][] = [
    [tx * 2 - 1, ty * 2 - 1],
    [tx * 2, ty * 2 - 1],
    [tx * 2 + 1, ty * 2 - 1],
    [tx * 2 + 2, ty * 2 - 1],
    [tx * 2 - 1, ty * 2],
    [tx * 2 + 2, ty * 2],
    [tx * 2 - 1, ty * 2 + 1],
    [tx * 2 + 2, ty * 2 + 1],
  ];
  for (const [gx, gy] of spots) {
    if (gx < 0 || gy < 0 || gx >= GRID || gy >= GRID) continue;
    const cur = grid[gy]![gx] ?? 0;
    if (cur === TILE_EAGLE || cur === TILE_EAGLE_DEAD) continue;
    grid[gy]![gx] = mat;
  }
}

export function buildLevel(stage: number): number[][] {
  const idx = Math.max(0, Math.min(RAW.length - 1, stage - 1));
  const grid = parseMap(RAW[idx]!);
  applyBase(grid, stage);
  return grid;
}

export function cloneGrid(grid: number[][]): number[][] {
  return grid.map((row) => row.slice());
}
