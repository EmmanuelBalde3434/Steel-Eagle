import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const url = process.argv[2] || "http://127.0.0.1:8080/";
await mkdir("/workspace/screenshots", { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(msg.text());
});

await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(400);

const play = page.getByRole("button", { name: "Jugar" });
await play.click();
await page.waitForTimeout(2000);

await page.screenshot({ path: "/workspace/screenshots/gameplay-intro.png" });

// Wait out stage intro (~1.7s already partly elapsed)
await page.waitForTimeout(800);
await page.screenshot({ path: "/workspace/screenshots/gameplay-desktop.png" });

const probe = async () =>
  page.evaluate(() => {
    const t = window.__controlsTest;
    if (!t) return null;
    return { yaw: t.getYaw(), speed: t.getSpeed(), pos: t.getPos() };
  });

let p0 = await probe();
if (!p0) {
  console.log(JSON.stringify({ ok: false, reason: "no probe", errors }));
  await browser.close();
  process.exit(1);
}

// Hold A (left) — x must decrease
await page.evaluate(() => window.__controlsTest?.setKeys?.(["KeyA"]));
await page.waitForTimeout(500);
const pA = await probe();
await page.evaluate(() => window.__controlsTest?.setKeys?.([]));
await page.waitForTimeout(100);

// Hold D (right) — x must increase
await page.evaluate(() => window.__controlsTest?.setKeys?.(["KeyD"]));
await page.waitForTimeout(500);
const pD = await probe();
await page.evaluate(() => window.__controlsTest?.setKeys?.([]));
await page.waitForTimeout(100);

// Hold W (up) — y must decrease
await page.evaluate(() => window.__controlsTest?.setKeys?.(["KeyW"]));
await page.waitForTimeout(400);
const pW = await probe();
await page.evaluate(() => window.__controlsTest?.setKeys?.([]));

await page.keyboard.down("Space");
await page.waitForTimeout(80);
await page.keyboard.up("Space");
await page.waitForTimeout(200);
await page.screenshot({ path: "/workspace/screenshots/gameplay-after-move.png" });

const dxA = (pA?.pos.x ?? 0) - (p0.pos.x ?? 0);
const dxD = (pD?.pos.x ?? 0) - (pA?.pos.x ?? 0);
const dyW = (pW?.pos.y ?? 0) - (pD?.pos.y ?? 0);

const leftOk = dxA < -2;
const rightOk = dxD > 2;
const upOk = dyW < -1;

const result = {
  ok: leftOk && rightOk && errors.length === 0,
  leftOk,
  rightOk,
  upOk,
  dxA,
  dxD,
  dyW,
  p0,
  pA,
  pD,
  pW,
  errors,
};

console.log(JSON.stringify(result, null, 2));
await browser.close();
process.exit(result.ok ? 0 : 1);
