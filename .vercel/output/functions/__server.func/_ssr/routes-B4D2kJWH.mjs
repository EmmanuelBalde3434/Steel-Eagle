import { o as __toESM } from "../_runtime.mjs";
import { _ as Link, y as require_jsx_runtime, z as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as getServerFnById, i as TSS_SERVER_FUNCTION, r as createServerFn } from "./ssr.mjs";
import { i as signOut, t as authClient } from "./client-sGid3STf.mjs";
import { t as authMiddleware } from "./middleware-Dlwe3HMV.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-B4D2kJWH.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Current user + loading state. Same behavior in live preview and when deployed:
*   - Auth enabled (default) -> the real signed-in user; `user` is `null` while
*                            the session resolves (`isPending: true`) and when
*                            signed out (`isPending: false`). Session comes from
*                            Better Auth `useSession()` → `/api/auth/get-session`
*                            (cookie when deployed; bearer in live preview).
*   - Auth disabled (`VITE_AUTH_ENABLED=false`) -> `DEV_USER`, never pending.
*
* Protect a route by waiting out `isPending` before acting on `user` —
* redirecting on `user: null` alone bounces signed-in visitors to sign-in on
* every hard reload:
*
*   import { RedirectToSignIn } from "@/lib/auth/gates";
*   const { user, isPending } = useCurrentUserState();
*   if (isPending) return null;              // still resolving — don't redirect yet
*   if (!user) return <RedirectToSignIn />;  // definitely signed out
*
* `authEnabled` is a module-level constant fixed at load, so the guarded hook
* call keeps a stable hook order across every render of a given component.
*/
function useCurrentUserState() {
	const { data, isPending } = authClient.useSession();
	const user = data?.user;
	return {
		user: user ? {
			id: user.id,
			displayName: user.name ?? null,
			primaryEmail: user.email ?? null,
			profileImageUrl: user.image ?? null,
			isDevFallback: false
		} : null,
		isPending
	};
}
/**
* Convenience view of `useCurrentUserState().user` for display (e.g.
* `user?.displayName ?? "Guest"`). NOTE: `null` means *loading OR signed out* —
* for redirects/guards use `useCurrentUserState()` and check `isPending`.
*/
function useCurrentUser() {
	return useCurrentUserState().user;
}
/**
* Minimal signed-in identity chip + sign-out. Restyle freely (see the
* `design-ui` skill). Sign-out is only shown when auth is enabled (the
* disabled-auth dev user has nothing to sign out of).
*/
function UserButton() {
	const user = useCurrentUser();
	if (!user) return null;
	const label = user.displayName ?? user.primaryEmail ?? "Account";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2",
		children: [
			user.profileImageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: user.profileImageUrl,
				alt: "",
				className: "h-8 w-8 rounded-full object-cover"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid h-8 w-8 place-items-center rounded-full bg-black/10 text-sm font-medium dark:bg-white/20",
				children: label.charAt(0).toUpperCase()
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm font-medium",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => void signOut(),
				className: "cursor-pointer text-sm underline-offset-4 opacity-70 hover:underline",
				children: "Sign out"
			})
		]
	});
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var submitScore = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((data) => ({
	score: Math.max(0, Math.min(9999999, Math.floor(data.score))),
	stage: Math.max(1, Math.min(99, Math.floor(data.stage)))
})).handler(createSsrRpc("4acb619768901da9f9c8c18040dfcf74cbb036b3c33bbc3d17e69fbee1085fc8"));
var listTopScores = createServerFn({ method: "GET" }).handler(createSsrRpc("60ee5fa860848cdde9f3f1cd8fb56f89eff113c8b124c51b8c043a2776ff05a5"));
var STEP = 1 / 60;
var DIRS = {
	up: {
		x: 0,
		y: -1,
		angle: 0
	},
	right: {
		x: 1,
		y: 0,
		angle: 1
	},
	down: {
		x: 0,
		y: 1,
		angle: 2
	},
	left: {
		x: -1,
		y: 0,
		angle: 3
	}
};
var DIR_LIST = [
	"up",
	"right",
	"down",
	"left"
];
var PLAYER_SPAWN = {
	x: 64,
	y: 192
};
var EAGLE_TILE = {
	tx: 6,
	ty: 12
};
var ENEMY_SPAWNS = [
	{
		x: 0,
		y: 0
	},
	{
		x: 96,
		y: 0
	},
	{
		x: 192,
		y: 0
	}
];
var SPEEDS = {
	player: 56,
	basic: 38,
	fast: 78,
	armor: 32,
	playerBullet: 176,
	enemyBullet: 112
};
var FIRE = {
	playerCooldown: .26,
	playerMaxBullets: 1,
	playerMaxBulletsStar: 2
};
var INVULN_SPAWN = 3.1;
var CLOCK_TIME = 8.5;
var STAGE_INTRO = 1.7;
var STAGE_CLEAR_HOLD = 2.2;
function aabb(ax, ay, aw, ah, bx, by, bw, bh) {
	return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}
function solidForTank(t) {
	return t === 1 || t === 2 || t === 3 || t === 6 || t === 7;
}
function solidForBullet(t, canBreakSteel) {
	if (t === 1 || t === 6 || t === 7) return true;
	if (t === 2) return true;
	return false;
}
function isIce(grid, x, y, w, h) {
	let ice = 0;
	let n = 0;
	const x0 = Math.max(0, Math.floor(x / 8));
	const y0 = Math.max(0, Math.floor(y / 8));
	const x1 = Math.min(25, Math.floor((x + w - .01) / 8));
	const y1 = Math.min(25, Math.floor((y + h - .01) / 8));
	for (let gy = y0; gy <= y1; gy++) for (let gx = x0; gx <= x1; gx++) {
		n++;
		if (grid[gy][gx] === 4) ice++;
	}
	return n > 0 && ice * 2 >= n;
}
function tankBlocked(grid, x, y) {
	const pad = 1;
	const hx = x + pad;
	const hy = y + pad;
	if (hx < 0 || hy < 0 || hx + 14 > 208 || hy + 14 > 208) return true;
	const x0 = Math.max(0, Math.floor(hx / 8));
	const y0 = Math.max(0, Math.floor(hy / 8));
	const x1 = Math.min(25, Math.floor((hx + 14 - .01) / 8));
	const y1 = Math.min(25, Math.floor((hy + 14 - .01) / 8));
	for (let gy = y0; gy <= y1; gy++) for (let gx = x0; gx <= x1; gx++) if (solidForTank(grid[gy][gx])) return true;
	return false;
}
function snapAxis(v) {
	return Math.round(v / 8) * 8;
}
function tryMove(grid, x, y, dir, dist, others, selfId) {
	const d = DIRS[dir];
	const nx = x + d.x * dist;
	const ny = y + d.y * dist;
	if (!tankBlocked(grid, nx, ny) && !tankOverlap(nx, ny, others, selfId)) return {
		x: nx,
		y: ny,
		moved: true
	};
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
	return {
		x: cx,
		y: cy,
		moved
	};
}
function tankOverlap(x, y, others, selfId) {
	const pad = 1;
	for (const o of others) {
		if (!o.live || o.id === selfId) continue;
		if (aabb(x + pad, y + pad, 14, 14, o.x + pad, o.y + pad, 14, 14)) return true;
	}
	return false;
}
/** Swept cell walk along a bullet path — no tunneling. */
function sweepBullet(grid, x0, y0, x1, y1, canBreakSteel) {
	const dx = x1 - x0;
	const dy = y1 - y0;
	const steps = Math.max(1, Math.ceil(Math.hypot(dx, dy) / 2));
	for (let i = 1; i <= steps; i++) {
		const t = i / steps;
		const x = x0 + dx * t;
		const y = y0 + dy * t;
		if (x < 0 || y < 0 || x >= 208 || y >= 208) return {
			kind: "tile",
			gx: Math.max(0, Math.min(25, Math.floor(x / 8))),
			gy: Math.max(0, Math.min(25, Math.floor(y / 8))),
			tile: 2
		};
		const gx = Math.floor(x / 8);
		const gy = Math.floor(y / 8);
		if (gx < 0 || gy < 0 || gx >= 26 || gy >= 26) return {
			kind: "tile",
			gx: Math.max(0, gx),
			gy: Math.max(0, gy),
			tile: 2
		};
		const tile = grid[gy][gx];
		if (solidForBullet(tile, canBreakSteel)) return {
			kind: "tile",
			gx,
			gy,
			tile
		};
	}
	return { kind: "none" };
}
function damageTile(grid, gx, gy, power) {
	const t = grid[gy]?.[gx];
	if (t === 1) {
		grid[gy][gx] = 0;
		return "brick";
	}
	if (t === 2) {
		if (power >= 3) {
			grid[gy][gx] = 0;
			return "steel";
		}
		return "steel";
	}
	if (t === 6) {
		grid[gy][gx] = 7;
		for (let y = 0; y < 26; y++) for (let x = 0; x < 26; x++) if (grid[y][x] === 6) grid[y][x] = 7;
		return "eagle";
	}
	return "none";
}
function inBush(grid, x, y) {
	const cx = Math.floor((x + 8) / 8);
	const cy = Math.floor((y + 8) / 8);
	if (cx < 0 || cy < 0 || cx >= 26 || cy >= 26) return false;
	return grid[cy][cx] === 5;
}
var LEGEND = {
	".": 0,
	"#": 1,
	"@": 2,
	"~": 3,
	"-": 4,
	"%": 5
};
var RAW = [
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
`
];
function parseMap(src) {
	const rows = src.trim().split("\n").map((r) => r.trimEnd().padEnd(13, ".").slice(0, 13));
	while (rows.length < 13) rows.push(".".repeat(13));
	const grid = [];
	for (let gy = 0; gy < 26; gy++) {
		grid[gy] = [];
		for (let gx = 0; gx < 26; gx++) {
			const ch = rows[gy >> 1]?.[gx >> 1] ?? ".";
			grid[gy][gx] = LEGEND[ch] ?? 0;
		}
	}
	return grid;
}
function armorForStage(stage) {
	if (stage <= 2) return 2;
	if (stage === 3) return 2;
	if (stage <= 5) return 1;
	return 1;
}
/** U-shaped base shield. Weakens after stage 3; later stages leave gaps. */
function applyBase(grid, stage) {
	const { tx, ty } = EAGLE_TILE;
	for (let y = 0; y < 2; y++) for (let x = 0; x < 2; x++) {
		const gy = ty * 2 + y;
		const gx = tx * 2 + x;
		if (grid[gy]) grid[gy][gx] = 6;
	}
	const mat = armorForStage(stage);
	const spots = [
		[tx * 2 - 1, ty * 2 - 1],
		[tx * 2, ty * 2 - 1],
		[tx * 2 + 1, ty * 2 - 1],
		[tx * 2 + 2, ty * 2 - 1],
		[tx * 2 - 1, ty * 2],
		[tx * 2 + 2, ty * 2],
		[tx * 2 - 1, ty * 2 + 1],
		[tx * 2 + 2, ty * 2 + 1]
	];
	for (const [gx, gy] of spots) {
		if (gx < 0 || gy < 0 || gx >= 26 || gy >= 26) continue;
		if (stage >= 7 && (gx + gy) % 3 === 0) {
			grid[gy][gx] = 0;
			continue;
		}
		if (stage === 4 && (gx + gy) % 2 === 0) {
			grid[gy][gx] = 1;
			continue;
		}
		grid[gy][gx] = mat;
	}
	for (let x = 0; x < 4; x++) {
		grid[0][x] = 0;
		grid[1][x] = 0;
		grid[0][25 - x] = 0;
		grid[1][25 - x] = 0;
	}
	for (let x = 11; x < 15; x++) {
		grid[0][x] = 0;
		grid[1][x] = 0;
	}
	for (let y = 24; y < 26; y++) for (let x = 8; x < 12; x++) if (grid[y][x] !== 6) grid[y][x] = 0;
}
function shovelBase(grid, steel) {
	const { tx, ty } = EAGLE_TILE;
	const mat = steel ? 2 : 1;
	const spots = [
		[tx * 2 - 1, ty * 2 - 1],
		[tx * 2, ty * 2 - 1],
		[tx * 2 + 1, ty * 2 - 1],
		[tx * 2 + 2, ty * 2 - 1],
		[tx * 2 - 1, ty * 2],
		[tx * 2 + 2, ty * 2],
		[tx * 2 - 1, ty * 2 + 1],
		[tx * 2 + 2, ty * 2 + 1]
	];
	for (const [gx, gy] of spots) {
		if (gx < 0 || gy < 0 || gx >= 26 || gy >= 26) continue;
		const cur = grid[gy][gx] ?? 0;
		if (cur === 6 || cur === 7) continue;
		grid[gy][gx] = mat;
	}
}
function buildLevel(stage) {
	const grid = parseMap(RAW[Math.max(0, Math.min(RAW.length - 1, stage - 1))]);
	applyBase(grid, stage);
	return grid;
}
var GAME_CODES = /* @__PURE__ */ new Set([
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
	"KeyM"
]);
var Input = class {
	keys = /* @__PURE__ */ new Set();
	qaKeys = /* @__PURE__ */ new Set();
	touch = {
		up: false,
		down: false,
		left: false,
		right: false,
		fire: false
	};
	prevFire = false;
	prevPause = false;
	fireBuffer = 0;
	padFireHeld = false;
	attach(target = window) {
		const down = (e) => {
			if (e.repeat) {
				if (GAME_CODES.has(e.code)) e.preventDefault();
				return;
			}
			this.keys.add(e.code);
			if (GAME_CODES.has(e.code)) e.preventDefault();
		};
		const up = (e) => {
			this.keys.delete(e.code);
			if (GAME_CODES.has(e.code)) e.preventDefault();
		};
		const clear = () => this.keys.clear();
		target.addEventListener("keydown", down);
		target.addEventListener("keyup", up);
		window.addEventListener("blur", clear);
		document.addEventListener("visibilitychange", clear);
		return () => {
			target.removeEventListener("keydown", down);
			target.removeEventListener("keyup", up);
			window.removeEventListener("blur", clear);
			document.removeEventListener("visibilitychange", clear);
		};
	}
	poll(dt) {
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
		if (pads) for (const p of pads) {
			if (!p) continue;
			const ax = p.axes[0] ?? 0;
			const ay = p.axes[1] ?? 0;
			const mag = Math.hypot(ax, ay);
			let sx = 0;
			let sy = 0;
			if (mag >= .28) {
				const scale = (mag - .28) / .72 / mag;
				sx = ax * scale;
				sy = ay * scale;
			}
			if (sy < -.45 || p.buttons[12]?.pressed) padUp = true;
			if (sy > .45 || p.buttons[13]?.pressed) padDown = true;
			if (sx < -.45 || p.buttons[14]?.pressed) padLeft = true;
			if (sx > .45 || p.buttons[15]?.pressed) padRight = true;
			if (p.buttons[0]?.pressed || p.buttons[2]?.pressed || (p.buttons[7]?.value ?? 0) > .4) padFire = true;
			if (p.buttons[9]?.pressed) padPause = true;
		}
		const up = k.has("KeyW") || k.has("ArrowUp") || q.has("KeyW") || t.up || padUp;
		const down = k.has("KeyS") || k.has("ArrowDown") || q.has("KeyS") || t.down || padDown;
		const left = k.has("KeyA") || k.has("ArrowLeft") || q.has("KeyA") || t.left || padLeft;
		const right = k.has("KeyD") || k.has("ArrowRight") || q.has("KeyD") || t.right || padRight;
		const fireHeld = k.has("Space") || k.has("KeyK") || k.has("KeyJ") || q.has("Space") || t.fire || padFire;
		const pauseHeld = k.has("Escape") || k.has("KeyP") || k.has("Enter") || padPause;
		if (fireHeld) this.fireBuffer = .14;
		else this.fireBuffer = Math.max(0, this.fireBuffer - dt);
		const firePressed = fireHeld && !this.prevFire || this.fireBuffer > 0;
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
			pausePressed
		};
	}
	consumeFire() {
		this.fireBuffer = 0;
	}
};
var bus = null;
var muted = false;
function getBus() {
	if (typeof window === "undefined") return null;
	if (bus) return bus;
	const AC = window.AudioContext || window.webkitAudioContext;
	if (!AC) return null;
	const ctx = new AC({ latencyHint: "interactive" });
	const master = ctx.createGain();
	const sfx = ctx.createGain();
	const music = ctx.createGain();
	master.gain.value = .7;
	sfx.gain.value = .85;
	music.gain.value = .22;
	sfx.connect(master);
	music.connect(master);
	master.connect(ctx.destination);
	bus = {
		ctx,
		master,
		sfx,
		music
	};
	return bus;
}
function unlockAudio() {
	const b = getBus();
	if (!b) return;
	if (b.ctx.state === "suspended") b.ctx.resume();
}
function setMuted(v) {
	muted = v;
	const b = bus;
	if (!b) return;
	b.master.gain.setTargetAtTime(v ? 0 : .7, b.ctx.currentTime, .02);
}
function isMuted() {
	return muted;
}
function beep(freq, dur, type, gain = .12, slide = 0, dest) {
	const b = getBus();
	if (!b || muted) return;
	const t = b.ctx.currentTime;
	const o = b.ctx.createOscillator();
	const g = b.ctx.createGain();
	o.type = type;
	o.frequency.setValueAtTime(freq, t);
	if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t + dur);
	g.gain.setValueAtTime(gain, t);
	g.gain.exponentialRampToValueAtTime(8e-4, t + dur);
	o.connect(g);
	g.connect(dest ?? b.sfx);
	o.start(t);
	o.stop(t + dur + .02);
}
var sfx = {
	shoot() {
		beep(620 + Math.random() * 40, .07, "square", .07, -280);
		beep(180, .05, "triangle", .05, -40);
	},
	boom(big = false) {
		beep(big ? 140 : 180, big ? .28 : .16, "sawtooth", big ? .16 : .1, -100);
		beep(big ? 90 : 120, big ? .34 : .18, "triangle", .08, -50);
	},
	hit() {
		beep(320, .06, "square", .06, -80);
	},
	power() {
		beep(520, .08, "square", .08, 80);
		beep(780, .12, "square", .06, 120);
	},
	life() {
		beep(440, .1, "square", .08, 0);
		beep(660, .12, "square", .07, 0);
		beep(880, .16, "square", .06, 0);
	},
	steel() {
		beep(240, .04, "square", .04, 0);
	},
	spawn() {
		beep(200, .12, "triangle", .05, 160);
	},
	stage() {
		beep(330, .12, "square", .07, 0);
		beep(440, .16, "square", .06, 0);
	},
	over() {
		beep(220, .2, "sawtooth", .1, -80);
		beep(160, .35, "triangle", .08, -60);
	},
	win() {
		[
			523,
			659,
			784,
			1046
		].forEach((f, i) => {
			const b = getBus();
			if (!b || muted) return;
			const t = b.ctx.currentTime + i * .12;
			const o = b.ctx.createOscillator();
			const g = b.ctx.createGain();
			o.type = "square";
			o.frequency.setValueAtTime(f, t);
			g.gain.setValueAtTime(.07, t);
			g.gain.exponentialRampToValueAtTime(8e-4, t + .2);
			o.connect(g);
			g.connect(b.sfx);
			o.start(t);
			o.stop(t + .22);
		});
	},
	pickup() {
		beep(880, .07, "square", .06, 200);
	}
};
var C = {
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
	bulletE: "#f0a0a0"
};
function px(ctx, x, y, w, h, c) {
	ctx.fillStyle = c;
	ctx.fillRect(x, y, w, h);
}
function drawGround(ctx) {
	ctx.fillStyle = C.ground;
	ctx.fillRect(0, 0, 416, 416);
	ctx.fillStyle = C.ground2;
	for (let y = 0; y < 26; y++) for (let x = 0; x < 26; x++) if ((x + y) % 2 === 0) ctx.fillRect(x * 8 * 2, y * 8 * 2, 16, 16);
}
function drawTiles(ctx, grid, time, layer) {
	for (let gy = 0; gy < 26; gy++) for (let gx = 0; gx < 26; gx++) {
		const t = grid[gy][gx];
		if (t === 0) continue;
		if (layer === "bush" && t !== 5) continue;
		if (layer === "base" && t === 5) continue;
		const x = gx * 8 * 2;
		const y = gy * 8 * 2;
		const s = 16;
		if (t === 1) drawBrick(ctx, x, y, s, gx, gy);
		else if (t === 2) drawSteel(ctx, x, y, s, gx, gy);
		else if (t === 3) drawWater(ctx, x, y, s, time, gx, gy);
		else if (t === 4) drawIce(ctx, x, y, s, gx, gy);
		else if (t === 5) drawBush(ctx, x, y, s, gx, gy);
		else if (t === 6) drawEagleCell(ctx, x, y, s, gx, gy, false);
		else if (t === 7) drawEagleCell(ctx, x, y, s, gx, gy, true);
	}
}
function drawBrick(ctx, x, y, s, gx, gy) {
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
function drawSteel(ctx, x, y, s, gx, gy) {
	px(ctx, x, y, s, s, C.steelDk);
	px(ctx, x + 1, y + 1, s - 2, s - 2, C.steel);
	px(ctx, x + 1, y + 1, s - 2, 2, C.steelLt);
	px(ctx, x + 1, y + 1, 2, s - 2, C.steelLt);
	px(ctx, x + s - 3, y + 2, 2, s - 3, C.steelDk);
	const r = (gx * 3 + gy * 5) % 3;
	px(ctx, x + 3 + r, y + 3, 2, 2, C.steelDk);
	px(ctx, x + s - 6, y + s - 6, 2, 2, C.steelDk);
}
function drawWater(ctx, x, y, s, time, gx, gy) {
	px(ctx, x, y, s, s, C.water2);
	const phase = Math.sin(time * 3 + gx * .7 + gy * .5);
	px(ctx, x, y + 2 + (phase > 0 ? 2 : 0), s, s - 4, C.water);
	ctx.fillStyle = C.water3;
	const ox = (time * 18 + gy * 6 | 0) % s;
	ctx.fillRect(x + ox, y + 3, 4, 2);
	ctx.fillRect(x + (ox + s / 2) % s, y + s - 5, 5, 2);
}
function drawIce(ctx, x, y, s, gx, gy) {
	px(ctx, x, y, s, s, C.ice);
	px(ctx, x + 1, y + 1, s - 2, 2, C.ice3);
	px(ctx, x + 1, y + 1, 2, s - 2, C.ice3);
	if ((gx + gy) % 2 === 0) px(ctx, x + 4, y + 5, 5, 1, C.ice2);
	else px(ctx, x + 3, y + 8, 6, 1, C.ice3);
}
function drawBush(ctx, x, y, s, gx, gy) {
	px(ctx, x + 1, y + 2, s - 2, s - 3, C.bush2);
	px(ctx, x + 2, y + 1, s - 5, s - 4, C.bush);
	if ((gx + gy) % 2 === 0) px(ctx, x + 3, y + 3, 4, 3, C.bush3);
	else px(ctx, x + 5, y + 5, 4, 3, C.bush3);
}
function drawEagleCell(ctx, x, y, s, gx, gy, dead) {
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
var palettes = {
	player: {
		body: C.player,
		dk: C.playerDk,
		lt: C.playerLt,
		hatch: C.hatch
	},
	basic: {
		body: C.basic,
		dk: C.basicDk,
		lt: "#ececec",
		hatch: "#333"
	},
	fast: {
		body: C.fast,
		dk: C.fastDk,
		lt: "#f08080",
		hatch: "#401010"
	},
	armor: {
		body: C.armor,
		dk: C.armorDk,
		lt: "#7aba72",
		hatch: "#142014"
	}
};
function drawTankSprite(ctx, tank, time, hidden) {
	if (!tank.live) return;
	if (tank.invuln > 0 && Math.floor(time * 14) % 2 === 0 && tank.kind === "player") {}
	const x = tank.x * 2;
	const y = tank.y * 2;
	const s = 32;
	ctx.save();
	ctx.translate(x + s / 2, y + s / 2);
	ctx.rotate(DIRS[tank.dir].angle * Math.PI / 2);
	if (hidden) ctx.globalAlpha = .28;
	else if (tank.invuln > 0 && tank.kind === "player" && Math.floor(time * 14) % 2 === 0) ctx.globalAlpha = .45;
	if (tank.flash > 0) ctx.globalAlpha = 1;
	let pal = palettes[tank.kind === "player" ? "player" : tank.kind];
	if (tank.drop && Math.floor(time * 8) % 2 === 0) pal = {
		body: "#f4f4f0",
		dk: "#b0b0a8",
		lt: "#ffffff",
		hatch: "#444"
	};
	if (tank.flash > 0) pal = {
		body: "#ffffff",
		dk: "#ddd",
		lt: "#fff",
		hatch: "#888"
	};
	if (tank.kind === "armor" && tank.hp < tank.maxHp) {
		const hurt = [
			"#c8b44a",
			"#d08030",
			"#c8c8c8"
		][Math.max(0, tank.hp - 1)] ?? pal.body;
		pal = {
			...pal,
			body: hurt
		};
	}
	const treads = Math.floor(tank.moveTime * 10) % 2;
	px(ctx, -15, -12, 6, 24, C.tread);
	px(ctx, s / 2 - 7, -12, 6, 24, C.tread);
	ctx.fillStyle = pal.dk;
	for (let i = 0; i < 5; i++) {
		const yy = -10 + i * 5 + treads * 2;
		ctx.fillRect(-14, yy, 4, 2);
		ctx.fillRect(s / 2 - 6, yy, 4, 2);
	}
	px(ctx, -9, -10, 18, 22, pal.dk);
	px(ctx, -8, -9, 16, 20, pal.body);
	px(ctx, -7, -8, 14, 3, pal.lt);
	px(ctx, -4, -2, 8, 8, pal.hatch);
	px(ctx, -3, -1, 6, 6, pal.dk);
	px(ctx, -2, 0, 4, 4, pal.body);
	px(ctx, -3, -15, 6, 10, pal.dk);
	px(ctx, -2, -16, 4, 11, pal.body);
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
function drawBulletSprite(ctx, b) {
	if (!b.live) return;
	const x = b.x * 2;
	const y = b.y * 2;
	const col = b.owner === "player" ? C.bulletP : C.bulletE;
	px(ctx, x, y, 6, 6, "#1a1a14");
	px(ctx, x + 1, y + 1, 4, 4, col);
	if (b.owner === "player") px(ctx, x + 1, y + 1, 2, 2, "#fff");
}
function drawPickupSprite(ctx, p, time) {
	const bob = Math.sin(time * 6 + p.bob) * 2;
	const x = p.x * 2;
	const y = p.y * 2 + bob;
	const s = 32;
	px(ctx, x, y, s, s, "#1a1408");
	px(ctx, x + 2, y + 2, 28, 28, "#c4a030");
	px(ctx, x + 3, y + 3, 26, 26, "#f0d060");
	ctx.fillStyle = "#2a1a08";
	ctx.font = "bold 14px ui-sans-serif, system-ui, sans-serif";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText({
		star: "★",
		life: "+",
		bomb: "●",
		clock: "◷",
		helmet: "▣",
		shovel: "T"
	}[p.kind] ?? "?", x + s / 2, y + s / 2 + 1);
}
function drawBoom(ctx, b) {
	const t = b.t;
	const x = b.x * 2;
	const y = b.y * 2;
	const max = b.big ? 22 : 14;
	const r = Math.min(max, t * 90);
	const a = Math.max(0, 1 - t / .35);
	ctx.save();
	ctx.globalAlpha = a;
	ctx.fillStyle = t < .08 ? "#fff6d0" : t < .18 ? "#f0a040" : "#803018";
	ctx.beginPath();
	ctx.arc(x, y, r, 0, Math.PI * 2);
	ctx.fill();
	ctx.restore();
}
function drawParticles(ctx, parts) {
	for (const p of parts) {
		ctx.globalAlpha = Math.max(0, p.life / p.max);
		ctx.fillStyle = p.color;
		ctx.fillRect(p.x * 2, p.y * 2, p.size, p.size);
	}
	ctx.globalAlpha = 1;
}
function drawBorder(ctx) {
	ctx.strokeStyle = "#3a3d44";
	ctx.lineWidth = 2;
	ctx.strokeRect(1, 1, 414, 414);
}
var HS_KEY = "steel-eagle-hs";
function loadHs() {
	try {
		return Number(localStorage.getItem(HS_KEY) || 0) || 0;
	} catch {
		return 0;
	}
}
function saveHs(n) {
	try {
		localStorage.setItem(HS_KEY, String(n));
	} catch {}
}
var POWER_CYCLE = [
	"star",
	"helmet",
	"clock",
	"shovel",
	"bomb",
	"life"
];
var Engine = class {
	canvas;
	ctx;
	input = new Input();
	detach;
	raf = 0;
	acc = 0;
	last = 0;
	time = 0;
	mode = "title";
	grid = [];
	player;
	enemies = [];
	bullets = [];
	pickups = [];
	parts = [];
	booms = [];
	floaters = [];
	score = 0;
	highScore = 0;
	lives = 3;
	stage = 1;
	remaining = 20;
	spawned = 0;
	spawnTimer = 0;
	star = 0;
	clock = 0;
	shovel = 0;
	intro = 0;
	clearHold = 0;
	nextEnemyId = 2;
	nextBulletId = 1;
	spawnIdx = 0;
	shake = 0;
	hitstop = 0;
	powerIdx = 0;
	reduced = false;
	onUi;
	lastUi = "";
	fireHeldTime = 0;
	constructor(canvas, onUi) {
		this.canvas = canvas;
		const ctx = canvas.getContext("2d");
		if (!ctx) throw new Error("Canvas 2D no disponible");
		this.ctx = ctx;
		this.onUi = onUi;
		this.highScore = loadHs();
		this.player = this.makeTank("player", PLAYER_SPAWN.x, PLAYER_SPAWN.y, 1);
		this.player.live = false;
		this.detach = this.input.attach(window);
		this.reduced = typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
		this.grid = buildLevel(1);
		this.emitUi();
		this.wireQa();
		this.last = performance.now();
		this.loop = this.loop.bind(this);
		this.raf = requestAnimationFrame(this.loop);
	}
	destroy() {
		cancelAnimationFrame(this.raf);
		this.detach();
		if (typeof window !== "undefined") delete window.__controlsTest;
	}
	setTouch(partial) {
		Object.assign(this.input.touch, partial);
	}
	beginGame() {
		unlockAudio();
		this.score = 0;
		this.lives = 3;
		this.stage = 1;
		this.star = 0;
		this.startStage();
		sfx.stage();
	}
	startStage() {
		this.grid = buildLevel(this.stage);
		this.enemies = [];
		this.bullets = [];
		this.pickups = [];
		this.parts = [];
		this.booms = [];
		this.floaters = [];
		this.remaining = 20;
		this.spawned = 0;
		this.spawnTimer = .4;
		this.spawnIdx = 0;
		this.clock = 0;
		this.shovel = 0;
		this.intro = STAGE_INTRO;
		this.clearHold = 0;
		this.mode = "stageIntro";
		this.respawnPlayer(true);
		this.emitUi();
	}
	respawnPlayer(silent = false) {
		const p = this.makeTank("player", PLAYER_SPAWN.x, PLAYER_SPAWN.y, 1);
		p.invuln = INVULN_SPAWN;
		p.dir = "up";
		this.player = p;
		if (!silent) sfx.spawn();
	}
	makeTank(kind, x, y, hp) {
		const speed = kind === "player" ? SPEEDS.player : kind === "fast" ? SPEEDS.fast : kind === "armor" ? SPEEDS.armor : SPEEDS.basic;
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
			cooldown: kind === "player" ? 0 : .8 + Math.random() * 1.2,
			invuln: kind === "player" ? 0 : .6,
			frozen: 0,
			flash: 0,
			drop: false,
			stuck: 0,
			think: .2 + Math.random() * .6,
			moveTime: 0,
			lastX: x,
			lastY: y,
			live: true
		};
	}
	emitUi() {
		const ui = {
			mode: this.mode,
			score: this.score,
			highScore: this.highScore,
			lives: this.lives,
			stage: this.stage,
			enemiesLeft: this.remaining + this.enemies.filter((e) => e.live).length,
			star: this.star,
			shield: this.player.invuln > 0,
			frozen: this.clock > 0,
			message: this.modeMessage()
		};
		const key = JSON.stringify(ui);
		if (key === this.lastUi) return;
		this.lastUi = key;
		this.onUi(ui);
	}
	modeMessage() {
		switch (this.mode) {
			case "stageIntro": return `NIVEL ${this.stage}`;
			case "stageClear": return "NIVEL SUPERADO";
			case "gameOver": return "GAME OVER";
			case "win": return "VICTORIA";
			case "paused": return "PAUSA";
			default: return "";
		}
	}
	loop(now) {
		this.raf = requestAnimationFrame(this.loop);
		const raw = Math.min(.1, (now - this.last) / 1e3);
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
		while (this.acc >= .016666666666666666 && steps < 5) {
			this.acc -= STEP;
			steps++;
			if (this.hitstop > 0) {
				this.hitstop -= STEP;
				continue;
			}
			if (this.mode === "playing" || this.mode === "stageIntro" || this.mode === "stageClear") this.step(STEP, actions);
		}
		const alpha = this.acc / STEP;
		this.draw(alpha);
		this.time += raw;
		if (this.shake > 0) this.shake = Math.max(0, this.shake - raw * 2.4);
	}
	step(dt, actions) {
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
				if (this.stage >= 8) {
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
		this.stepPlayer(dt, actions);
		this.stepEnemies(dt);
		this.stepBullets(dt);
		this.stepPickups(dt);
		this.tickFx(dt);
		this.trySpawn(dt);
		this.checkStageClear();
		this.emitUi();
	}
	allTanks() {
		return [this.player, ...this.enemies];
	}
	stepPlayer(dt, actions) {
		const p = this.player;
		if (!p.live) return;
		if (p.invuln > 0) p.invuln = Math.max(0, p.invuln - dt);
		if (p.cooldown > 0) p.cooldown = Math.max(0, p.cooldown - dt);
		p.px = p.x;
		p.py = p.y;
		let dir = null;
		if (actions.up) dir = "up";
		if (actions.down) dir = "down";
		if (actions.left) dir = "left";
		if (actions.right) dir = "right";
		if (actions.up && actions.down) dir = p.dir === "down" ? "down" : "up";
		if (actions.left && actions.right) dir = p.dir === "right" ? "right" : "left";
		if ((actions.up || actions.down) && (actions.left || actions.right)) {
			if (p.dir === "up" && actions.up) dir = "up";
			else if (p.dir === "down" && actions.down) dir = "down";
			else if (p.dir === "left" && actions.left) dir = "left";
			else if (p.dir === "right" && actions.right) dir = "right";
		}
		const icy = isIce(this.grid, p.x, p.y, 16, 16);
		if (dir) {
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
		} else if (icy) {
			const others = this.enemies.filter((e) => e.live);
			const res = tryMove(this.grid, p.x, p.y, p.dir, p.speed * .7 * dt, others, p.id);
			p.x = res.x;
			p.y = res.y;
			if (res.moved) p.moveTime += dt;
		}
		const maxB = this.star >= 2 ? FIRE.playerMaxBulletsStar : FIRE.playerMaxBullets;
		const mine = this.bullets.filter((b) => b.live && b.owner === "player").length;
		if (actions.fire && p.cooldown <= 0 && mine < maxB) {
			this.shoot(p, "player");
			p.cooldown = this.star >= 1 ? .2 : FIRE.playerCooldown;
			this.input.consumeFire();
		}
		for (const pk of this.pickups) if (aabb(p.x, p.y, 16, 16, pk.x, pk.y, 16, 16)) {
			this.applyPower(pk.kind);
			pk.life = 0;
		}
		this.pickups = this.pickups.filter((pk) => pk.life > 0);
	}
	stepEnemies(dt) {
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
			if (e.think <= 0 || e.stuck > .7) {
				e.dir = this.pickEnemyDir(e);
				if (e.dir === "left" || e.dir === "right") e.y = snapAxis(e.y);
				else e.x = snapAxis(e.x);
				e.think = .45 + Math.random() * (1.1 - this.stage * .05);
				e.stuck = 0;
			}
			const others = othersBase.filter((o) => o.live && o.id !== e.id);
			const res = tryMove(this.grid, e.x, e.y, e.dir, e.speed * dt, others, e.id);
			e.x = res.x;
			e.y = res.y;
			if (res.moved) e.moveTime += dt;
			else e.think = 0;
			const fireCd = Math.max(.85, 2.6 - this.stage * .18);
			if (e.cooldown <= 0 && Math.random() < this.enemyFireChance(e)) {
				if (e.invuln <= 0) {
					this.shoot(e, "enemy");
					e.cooldown = fireCd + Math.random() * .6;
				}
			}
		}
	}
	enemyFireChance(e) {
		const p = this.player;
		if (!p.live) return .01;
		const alignedX = Math.abs(e.x - p.x) < 14;
		const alignedY = Math.abs(e.y - p.y) < 14;
		const facing = e.dir === "up" && p.y < e.y && alignedX || e.dir === "down" && p.y > e.y && alignedX || e.dir === "left" && p.x < e.x && alignedY || e.dir === "right" && p.x > e.x && alignedY;
		const towardBase = e.dir === "down" && Math.abs(e.x - 96) < 20 || e.dir === "left" && e.y > 168 || e.dir === "right" && e.y > 168;
		if (facing) return this.stage <= 2 ? .35 : .55;
		if (towardBase) return .12;
		return this.stage <= 2 ? .015 : .03;
	}
	pickEnemyDir(e) {
		const p = this.player;
		const roll = Math.random();
		const prefer = [];
		const huntPlayer = this.stage <= 2 ? .22 : .32;
		const huntBase = this.stage <= 3 ? .18 : .3;
		if (roll < huntPlayer && p.live) {
			if (Math.abs(p.x - e.x) > Math.abs(p.y - e.y)) prefer.push(p.x < e.x ? "left" : "right");
			else prefer.push(p.y < e.y ? "up" : "down");
		} else if (roll < huntPlayer + huntBase) {
			const bx = 96;
			const by = 192;
			if (Math.abs(bx - e.x) > Math.abs(by - e.y)) prefer.push(bx < e.x ? "left" : "right");
			else prefer.push(by < e.y ? "up" : "down");
		}
		const options = DIR_LIST.filter((d) => {
			const nx = e.x + DIRS[d].x * 4;
			const ny = e.y + DIRS[d].y * 4;
			return !tankBlocked(this.grid, nx, ny);
		});
		const pool = options.length ? options : DIR_LIST;
		if (prefer.length && pool.includes(prefer[0]) && Math.random() < .75) return prefer[0];
		if (Math.random() < .12) return pool[Math.random() * pool.length | 0];
		return pool[Math.random() * pool.length | 0];
	}
	shoot(tank, owner) {
		const d = DIRS[tank.dir];
		const cx = tank.x + 8 - 2 + d.x * 8;
		const cy = tank.y + 8 - 2 + d.y * 8;
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
			live: true
		});
		if (owner === "player") sfx.shoot();
	}
	stepBullets(dt) {
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
				const res = damageTile(this.grid, hit.gx, hit.gy, b.power);
				b.live = false;
				this.burst(hit.gx * 8 + 4, hit.gy * 8 + 4, res === "steel" ? "#9aa4ae" : "#d06040", 6);
				if (res === "eagle") {
					sfx.boom(true);
					this.shake = this.reduced ? 0 : .55;
					this.killEagle();
				} else if (res === "steel" && b.power < 3) sfx.steel();
				else if (res === "brick") sfx.hit();
				continue;
			}
			b.x = nx;
			b.y = ny;
			if (b.owner === "player") for (const e of this.enemies) {
				if (!e.live || e.invuln > 0) continue;
				if (this.bulletHitsTank(b, e)) {
					b.live = false;
					this.hurtEnemy(e);
					break;
				}
			}
			else if (this.player.live && this.player.invuln <= 0 && this.bulletHitsTank(b, this.player)) {
				b.live = false;
				this.hurtPlayer();
			}
		}
		this.bullets = this.bullets.filter((b) => b.live);
	}
	bulletHitsTank(b, t) {
		const pad = b.owner === "player" ? -1 : 1;
		return aabb(b.x - 1, b.y - 1, 6, 6, t.x + pad, t.y + pad, 16 - pad * 2, 16 - pad * 2);
	}
	hurtEnemy(e) {
		e.hp -= 1;
		e.flash = .08;
		this.hitstop = this.reduced ? 0 : .03;
		if (e.hp <= 0) {
			e.live = false;
			const pts = e.kind === "armor" ? 400 : e.kind === "fast" ? 200 : 100;
			this.addScore(pts, e.x, e.y);
			this.boom(e.x + 8, e.y + 8, false);
			sfx.boom(false);
			if (e.drop) this.spawnPickup(e.x, e.y);
			this.remaining = Math.max(0, this.remaining);
		} else sfx.hit();
	}
	hurtPlayer() {
		this.boom(this.player.x + 8, this.player.y + 8, false);
		sfx.boom(true);
		this.shake = this.reduced ? 0 : .4;
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
	killEagle() {
		this.mode = "gameOver";
		sfx.over();
		this.recordHs();
		this.boom(104, 200, true);
	}
	trySpawn(dt) {
		const alive = this.enemies.filter((e) => e.live).length;
		if (this.spawned >= 20 || alive >= 4) return;
		this.spawnTimer -= dt;
		if (this.spawnTimer > 0) return;
		const slot = ENEMY_SPAWNS[this.spawnIdx % ENEMY_SPAWNS.length];
		this.spawnIdx++;
		if (this.allTanks().some((t) => t.live && aabb(slot.x, slot.y, 16, 16, t.x, t.y, 16, 16))) {
			this.spawnTimer = .35;
			return;
		}
		const kind = this.rollKind();
		const hp = kind === "armor" ? this.stage >= 6 ? 4 : 3 : 1;
		const tank = this.makeTank(kind, slot.x, slot.y, hp);
		tank.drop = this.spawned % 5 === 3;
		this.enemies.push(tank);
		this.spawned += 1;
		this.remaining = 20 - this.spawned;
		this.spawnTimer = Math.max(1.15, 2.4 - this.stage * .12);
		sfx.spawn();
	}
	rollKind() {
		if (this.stage <= 1) return Math.random() < .12 ? "fast" : "basic";
		if (this.stage === 2) {
			if (Math.random() < .2) return "fast";
			return "basic";
		}
		if (this.stage <= 4) {
			const r = Math.random();
			if (r < .18) return "armor";
			if (r < .45) return "fast";
			return "basic";
		}
		const r = Math.random();
		if (r < .28) return "armor";
		if (r < .6) return "fast";
		return "basic";
	}
	spawnPickup(x, y) {
		const kind = POWER_CYCLE[this.powerIdx % POWER_CYCLE.length];
		this.powerIdx++;
		const px = Math.max(0, Math.min(192, snapAxis(x)));
		const py = Math.max(0, Math.min(192, snapAxis(y)));
		this.pickups.push({
			kind,
			x: px,
			y: py,
			life: 16,
			bob: Math.random() * 6
		});
		sfx.pickup();
	}
	applyPower(kind) {
		sfx.power();
		this.addScore(500, this.player.x, this.player.y);
		if (kind === "star") this.star = Math.min(3, this.star + 1);
		else if (kind === "life") {
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
			this.shake = this.reduced ? 0 : .35;
		} else if (kind === "clock") this.clock = CLOCK_TIME;
		else if (kind === "helmet") this.player.invuln = 10;
		else if (kind === "shovel") {
			this.shovel = 18;
			shovelBase(this.grid, true);
		}
	}
	stepPickups(dt) {
		for (const p of this.pickups) p.life -= dt;
		this.pickups = this.pickups.filter((p) => p.life > 0);
	}
	checkStageClear() {
		if (this.mode !== "playing") return;
		if (!this.enemies.some((e) => e.live) && this.spawned >= 20) {
			this.mode = "stageClear";
			this.clearHold = STAGE_CLEAR_HOLD;
			this.addScore(1e3, this.player.x, this.player.y);
			sfx.stage();
		}
	}
	addScore(n, x, y) {
		this.score += n;
		this.floaters.push({
			x,
			y,
			text: String(n),
			t: 0
		});
		if (this.score > this.highScore) {
			this.highScore = this.score;
			saveHs(this.highScore);
		}
	}
	recordHs() {
		if (this.score > this.highScore) {
			this.highScore = this.score;
			saveHs(this.highScore);
		}
	}
	boom(x, y, big) {
		this.booms.push({
			x,
			y,
			t: 0,
			big
		});
		this.burst(x, y, "#f0a040", big ? 16 : 10);
	}
	burst(x, y, color, n) {
		for (let i = 0; i < n; i++) {
			const a = Math.random() * Math.PI * 2;
			const s = 20 + Math.random() * 50;
			this.parts.push({
				x,
				y,
				vx: Math.cos(a) * s,
				vy: Math.sin(a) * s,
				life: .25 + Math.random() * .25,
				max: .45,
				size: 2 + Math.random() * 2,
				color
			});
		}
	}
	tickFx(dt) {
		for (const p of this.parts) {
			p.x += p.vx * dt;
			p.y += p.vy * dt;
			p.life -= dt;
		}
		this.parts = this.parts.filter((p) => p.life > 0);
		for (const b of this.booms) b.t += dt;
		this.booms = this.booms.filter((b) => b.t < .35);
		for (const f of this.floaters) {
			f.t += dt;
			f.y -= 12 * dt;
		}
		this.floaters = this.floaters.filter((f) => f.t < .7);
		if (this.player.flash > 0) this.player.flash -= dt;
	}
	draw(alpha) {
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
		const lerp = (a, b) => a + (b - a) * alpha;
		for (const e of this.enemies) {
			if (!e.live) continue;
			const hide = inBush(this.grid, e.x, e.y);
			drawTankSprite(ctx, {
				...e,
				x: lerp(e.px, e.x),
				y: lerp(e.py, e.y)
			}, this.time, hide);
		}
		if (this.player.live) {
			const hide = inBush(this.grid, this.player.x, this.player.y);
			drawTankSprite(ctx, {
				...this.player,
				x: lerp(this.player.px, this.player.x),
				y: lerp(this.player.py, this.player.y)
			}, this.time, hide);
		}
		for (const b of this.bullets) {
			if (!b.live) continue;
			drawBulletSprite(ctx, {
				...b,
				x: lerp(b.px, b.x),
				y: lerp(b.py, b.y)
			});
		}
		for (const p of this.pickups) drawPickupSprite(ctx, p, this.time);
		drawTiles(ctx, this.grid, this.time, "bush");
		drawParticles(ctx, this.parts);
		for (const b of this.booms) drawBoom(ctx, b);
		for (const f of this.floaters) {
			ctx.globalAlpha = 1 - f.t / .7;
			ctx.fillStyle = "#f4f0d8";
			ctx.font = "bold 10px ui-sans-serif, system-ui, sans-serif";
			ctx.textAlign = "center";
			ctx.fillText(f.text, f.x * 2 + 8, f.y * 2);
			ctx.globalAlpha = 1;
		}
		drawBorder(ctx);
		ctx.restore();
		if (this.mode === "title") this.drawAttractHint(ctx);
	}
	drawAttractHint(ctx) {
		ctx.fillStyle = "rgba(7,8,10,0.18)";
		ctx.fillRect(0, 0, 416, 416);
	}
	wireQa() {
		if (typeof window === "undefined") return;
		window.__controlsTest = {
			getYaw: () => {
				return {
					up: 0,
					left: Math.PI / 2,
					down: Math.PI,
					right: -Math.PI / 2
				}[this.player.dir];
			},
			getSpeed: () => {
				const dx = this.player.x - this.player.px;
				const dy = this.player.y - this.player.py;
				return Math.hypot(dx, dy) / STEP;
			},
			getPos: () => ({
				x: this.player.x,
				y: this.player.y
			}),
			setKeys: (codes) => {
				this.input.qaKeys = new Set(codes);
			},
			setSteer: (v) => {
				this.input.qaKeys.clear();
				if (v > .3) this.input.qaKeys.add("KeyA");
				else if (v < -.3) this.input.qaKeys.add("KeyD");
			}
		};
	}
};
var EMPTY_UI = {
	mode: "title",
	score: 0,
	highScore: 0,
	lives: 3,
	stage: 1,
	enemiesLeft: 20,
	star: 0,
	shield: false,
	frozen: false,
	message: ""
};
function TankGame() {
	const canvasRef = (0, import_react.useRef)(null);
	const engineRef = (0, import_react.useRef)(null);
	const [ui, setUi] = (0, import_react.useState)(EMPTY_UI);
	const [help, setHelp] = (0, import_react.useState)(false);
	const [muted, setMutedState] = (0, import_react.useState)(false);
	const [scores, setScores] = (0, import_react.useState)([]);
	const posted = (0, import_react.useRef)(false);
	const { user, isPending } = useCurrentUserState();
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		canvas.width = 416;
		canvas.height = 416;
		const engine = new Engine(canvas, setUi);
		engineRef.current = engine;
		return () => {
			engine.destroy();
			engineRef.current = null;
		};
	}, []);
	(0, import_react.useEffect)(() => {
		listTopScores().then(setScores).catch(() => setScores([]));
	}, [ui.mode]);
	(0, import_react.useEffect)(() => {
		if ((ui.mode === "gameOver" || ui.mode === "win") && user && !posted.current && ui.score > 0) {
			posted.current = true;
			submitScore({ data: {
				score: ui.score,
				stage: ui.stage
			} }).catch(() => void 0);
		}
		if (ui.mode === "title" || ui.mode === "playing") posted.current = false;
	}, [
		ui.mode,
		ui.score,
		ui.stage,
		user
	]);
	const play = (0, import_react.useCallback)(() => {
		unlockAudio();
		engineRef.current?.beginGame();
	}, []);
	const toggleMute = (0, import_react.useCallback)(() => {
		const next = !isMuted();
		setMuted(next);
		setMutedState(next);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh flex-col bg-bg text-fg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "flex items-center justify-between gap-3 px-4 py-3 sm:px-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-[10px] leading-none tracking-widest text-muted",
					children: "STEEL EAGLE"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 truncate text-xs text-subtle",
					children: "Defiende el águila"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: toggleMute,
					className: "h-10 rounded-md border border-line bg-surface px-3 text-xs text-muted hover:text-fg",
					children: muted ? "Sonido off" : "Sonido"
				}), isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-8 w-8 animate-pulse rounded-full bg-elevated" }) : user ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/login",
					className: "inline-flex h-10 items-center rounded-md border border-line bg-surface px-3 text-xs text-muted hover:text-fg",
					children: "Entrar"
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: "mx-auto flex w-full max-w-5xl flex-1 flex-col items-center px-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex w-full flex-col items-center gap-3 lg:flex-row lg:items-start lg:justify-center lg:gap-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
						className: "hidden w-28 shrink-0 flex-col gap-4 pt-2 lg:flex",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "PUNTOS",
								value: pad(ui.score, 6)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "RÉCORD",
								value: pad(ui.highScore, 6)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "NIVEL",
								value: String(ui.stage)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "VIDAS",
								value: String(Math.max(0, ui.lives))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-[8px] text-subtle",
								children: "ENEMIGOS"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-2 grid grid-cols-4 gap-1",
								children: Array.from({ length: 20 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `block h-2.5 w-2.5 rounded-[1px] ${i < ui.enemiesLeft ? "bg-brick" : "bg-line"}` }, i))
							})] }),
							ui.star > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "ESTRELLA",
								value: "I".repeat(ui.star)
							}) : null,
							ui.frozen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-[8px] text-ok",
								children: "RELOJ"
							}) : null,
							ui.shield ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-display text-[8px] text-steel",
								children: "CASCO"
							}) : null
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative w-full max-w-[min(100%,416px)]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-2 flex items-center justify-between gap-2 lg:hidden",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-[9px] tabular-nums text-muted",
									children: pad(ui.score, 6)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-mono text-[9px] text-muted",
									children: ["Nv ", ui.stage]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-mono text-[9px] text-muted",
									children: ["Vidas ", Math.max(0, ui.lives)]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-[9px] text-brick",
									children: ui.enemiesLeft
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative overflow-hidden rounded-lg border border-line bg-elevated",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
								ref: canvasRef,
								className: "block h-auto w-full touch-none select-none",
								style: {
									aspectRatio: "1 / 1",
									imageRendering: "pixelated"
								},
								width: 416,
								height: 416
							}), ui.mode !== "playing" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Overlay, {
								ui,
								help,
								scores,
								onPlay: play,
								onHelp: () => setHelp((v) => !v),
								signedIn: !!user
							}) : null]
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TouchPad, { engine: engineRef }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 hidden text-center text-xs text-subtle sm:block",
					children: "WASD o flechas para mover · Espacio para disparar · P para pausar"
				})
			]
		})]
	});
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "font-display text-[8px] text-subtle",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-1 font-mono text-[11px] tabular-nums tracking-wider",
		children: value
	})] });
}
function pad(n, w) {
	return String(Math.max(0, n)).padStart(w, "0");
}
function Overlay({ ui, help, scores, onPlay, onHelp, signedIn }) {
	if (ui.mode === "stageIntro" || ui.mode === "stageClear") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 grid place-items-center bg-bg/70",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-xs tracking-widest text-accent",
				children: ui.message
			}), ui.mode === "stageClear" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-xs text-muted",
				children: pad(ui.score, 6)
			}) : null]
		})
	});
	if (ui.mode === "paused") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 grid place-items-center bg-bg/75",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-lg border border-line bg-surface px-8 py-6 text-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-xs",
				children: "PAUSA"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-xs text-muted",
				children: "Espacio o P para seguir"
			})]
		})
	});
	if (ui.mode === "gameOver" || ui.mode === "win") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 grid place-items-center bg-bg/80 p-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-xs rounded-lg border border-line bg-surface px-5 py-6 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-xs tracking-widest",
					children: ui.mode === "win" ? "VICTORIA" : "GAME OVER"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 font-mono text-sm tabular-nums",
					children: pad(ui.score, 6)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-xs text-muted",
					children: ["Nivel ", ui.stage]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onPlay,
					className: "mt-5 w-full rounded-md bg-accent px-4 py-3 text-sm font-medium text-accent-fg",
					children: "Jugar de nuevo"
				})
			]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "absolute inset-0 flex flex-col justify-end bg-linear-to-t from-bg via-bg/80 to-bg/25 p-4 sm:p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: "/title-art.jpg",
			alt: "",
			className: "pointer-events-none absolute inset-0 h-full w-full object-cover opacity-40"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
					className: "font-display text-[18px] leading-tight sm:text-[22px]",
					children: [
						"STEEL",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
						"EAGLE"
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 max-w-[18rem] text-sm leading-relaxed text-muted",
					children: "Protege la base. Los ladrillos caen, el acero aguanta, los arbustos ocultan."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onPlay,
						className: "rounded-md bg-accent px-4 py-3 text-sm font-medium text-accent-fg",
						children: "Jugar"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onHelp,
						className: "rounded-md border border-line bg-surface px-4 py-3 text-sm text-fg",
						children: "Controles"
					})]
				}),
				help ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "mt-4 space-y-1 text-xs leading-relaxed text-muted",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "PC: WASD o flechas, Espacio dispara" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Móvil: cruceta + botón de fuego" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "3 vidas · escudo al reaparecer · 8 niveles" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Estrella, bomba, reloj, casco, pala y vida extra" })
					]
				}) : null,
				scores.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
					className: "mt-4 space-y-1 text-[11px] text-muted",
					children: scores.slice(0, 4).map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex justify-between gap-3 font-mono tabular-nums",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "truncate",
							children: s.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: pad(s.score, 6) })]
					}, `${s.name}-${s.score}-${i}`))
				}) : null,
				!signedIn ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-[11px] text-subtle",
					children: "Entra para guardar tu marca"
				}) : null
			]
		})]
	});
}
function TouchPad({ engine }) {
	const set = (0, import_react.useCallback)((partial) => {
		engine.current?.setTouch(partial);
	}, [engine]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-3 flex w-full max-w-[min(100%,416px)] items-end justify-between gap-4 select-none lg:hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-3 grid-rows-3 gap-1.5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PadBtn, {
					label: "▲",
					onChange: (v) => set({ up: v })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PadBtn, {
					label: "◀",
					onChange: (v) => set({ left: v })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PadBtn, {
					label: "▶",
					onChange: (v) => set({ right: v })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PadBtn, {
					label: "▼",
					onChange: (v) => set({ down: v })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PadBtn, {
			fire: true,
			label: "FUEGO",
			onChange: (v) => set({ fire: v })
		})]
	});
}
function PadBtn({ label, onChange, fire }) {
	const down = (e) => {
		e.preventDefault();
		e.currentTarget.setPointerCapture(e.pointerId);
		onChange(true);
	};
	const up = (e) => {
		e.preventDefault();
		onChange(false);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"aria-label": label,
		onPointerDown: down,
		onPointerUp: up,
		onPointerCancel: up,
		onContextMenu: (e) => e.preventDefault(),
		className: fire ? "h-[72px] w-[72px] rounded-full border border-line bg-elevated font-display text-[9px] text-fg active:bg-accent active:text-accent-fg" : "flex h-14 w-14 items-center justify-center rounded-md border border-line bg-elevated text-lg text-fg active:bg-accent active:text-accent-fg",
		children: label
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TankGame, {});
}
//#endregion
export { Home as component };
