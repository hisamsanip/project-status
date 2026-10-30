// Records the six "how to use" clips of the AI Sandbox Prompt Vault, frame by frame.
// Each frame is a real screenshot of the site, so text stays sharp and timing is exact.
// Usage: node record.js <site-url> <output-dir>
const { chromium } = require("playwright");
const { spawn } = require("child_process");
const path = require("path");

const SITE = process.argv[2] || "http://127.0.0.1:8770/ai-sandbox/";
const OUT = process.argv[3] || path.join(__dirname, "..", "remotion", "public", "clips");
const FPS = 30;

const CURSOR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24"><path d="M4 2l15 10.5-6.6 1.3 3.9 7.4-2.6 1.3-3.9-7.4L4 20z" fill="#fff" stroke="#0b1b4d" stroke-width="1.4" stroke-linejoin="round"/></svg>`;

class Clip {
  constructor(page, file, totalFrames) {
    this.page = page;
    this.total = totalFrames;
    this.count = 0;
    this.last = null;
    this.ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "png", "-i", "-",
      "-vf", "scale=1920:1080:flags=lanczos", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "14", "-preset", "medium", file]);
    this.done = new Promise((res, rej) => this.ff.on("close", c => (c === 0 ? res() : rej(new Error("ffmpeg " + c)))));
  }
  async write(buf) {
    this.last = buf;
    this.count++;
    if (!this.ff.stdin.write(buf)) await new Promise(r => this.ff.stdin.once("drain", r));
  }
  async shot() { await this.write(await this.page.screenshot({ type: "png" })); }
  async hold(n) { if (!this.last) await this.shot(), n--; for (let i = 0; i < n; i++) await this.write(this.last); }
  async finish() {
    if (this.count > this.total) console.warn(`  ! clip ran ${this.count - this.total} frames over`);
    await this.hold(Math.max(0, this.total - this.count));
    this.ff.stdin.end();
    await this.done;
    console.log(`  wrote ${this.count} frames`);
  }
}

const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

async function setup(page) {
  await page.addStyleTag({ content: `
    #fakecursor{position:fixed;left:0;top:0;z-index:99999;pointer-events:none;translate:-5px -3px}
    #fakeripple{position:fixed;left:0;top:0;width:46px;height:46px;margin:-23px 0 0 -23px;border-radius:50%;
      border:4px solid #3d7bff;background:rgba(61,123,255,.18);pointer-events:none;z-index:99998;opacity:0}
    *{caret-color:#3d7bff}` });
  await page.evaluate(svg => {
    const c = document.createElement("div"); c.id = "fakecursor"; c.innerHTML = svg; document.body.appendChild(c);
    const r = document.createElement("div"); r.id = "fakeripple"; document.body.appendChild(r);
  }, CURSOR_SVG);
}

function makeActions(page, clipRef) {
  let pos = { x: 640, y: 420 };
  const clip = () => clipRef.current;
  const setCursor = (x, y) => page.evaluate(([x, y]) => { const c = document.getElementById("fakecursor"); c.style.left = x + "px"; c.style.top = y + "px"; }, [x, y]);
  const center = async loc => { const b = await loc.boundingBox(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; };
  return {
    async place(x, y) { pos = { x, y }; await setCursor(x, y); },
    async moveTo(target, frames = 18) {
      const t = target.x !== undefined ? target : await center(target);
      const from = { ...pos };
      for (let i = 1; i <= frames; i++) {
        const k = ease(i / frames), x = from.x + (t.x - from.x) * k, y = from.y + (t.y - from.y) * k;
        await setCursor(x, y); await page.mouse.move(x, y); await clip().shot();
      }
      pos = { x: t.x, y: t.y };
    },
    async click(frames = 10) {
      await page.mouse.click(pos.x, pos.y);
      for (let i = 1; i <= frames; i++) {
        const k = i / frames;
        await page.evaluate(([x, y, k]) => { const r = document.getElementById("fakeripple"); r.style.left = x + "px"; r.style.top = y + "px"; r.style.opacity = String(1 - k); r.style.scale = String(0.4 + k * 0.9); }, [pos.x, pos.y, k]);
        await clip().shot();
      }
      await page.evaluate(() => { document.getElementById("fakeripple").style.opacity = "0"; });
    },
    async clickOn(loc, moveFrames = 18) { await this.moveTo(loc, moveFrames); await this.click(); },
    async type(text, perChar = 2) { for (const ch of text) { await page.keyboard.type(ch); await clip().shot(); await clip().hold(perChar - 1); } },
    async scrollWindow(toY, frames = 24) {
      const from = await page.evaluate(() => scrollY);
      for (let i = 1; i <= frames; i++) { await page.evaluate(y => scrollTo(0, y), from + (toY - from) * ease(i / frames)); await clip().shot(); }
    },
    async scrollModalTo(loc, margin = 70, frames = 22) {
      const to = await loc.evaluate((el, m) => { const md = document.querySelector(".modal"); return Math.max(0, md.scrollTop + el.getBoundingClientRect().top - md.getBoundingClientRect().top - m); }, margin);
      const from = await page.evaluate(() => document.querySelector(".modal").scrollTop);
      for (let i = 1; i <= frames; i++) { await page.evaluate(y => { document.querySelector(".modal").scrollTop = y; }, from + (to - from) * ease(i / frames)); await clip().shot(); }
    },
  };
}

(async () => {
  const browser = await chromium.launch();
  const clipRef = { current: null };
  const start = (page, name, seconds) => { console.log(name); clipRef.current = new Clip(page, path.join(OUT, name + ".mp4"), Math.round(seconds * FPS)); return clipRef.current; };

  // ---------- Steps 1-2: the page, at 1280x720 ----------
  const ctx1 = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1.5, colorScheme: "light", reducedMotion: "reduce" });
  const p1 = await ctx1.newPage();
  await p1.goto(SITE, { waitUntil: "networkidle" });
  await p1.evaluate(() => document.fonts.ready);
  await setup(p1);
  const a1 = makeActions(p1, clipRef);
  await a1.place(980, 600);

  let c = start(p1, "step1", 9);
  await c.hold(30);
  const tilesY = await p1.locator(".create").evaluate(el => el.getBoundingClientRect().top + scrollY - 90);
  await a1.scrollWindow(tilesY, 24);
  for (const t of ["Slides", "Infographic", "Visual", "Dashboard"]) { await a1.moveTo(p1.locator(`[data-jump="${t}"]`), 14); await c.hold(16); }
  await a1.moveTo(p1.locator('[data-jump="Slides"]'), 20);
  await c.hold(6);
  await a1.click();
  await c.shot();
  await c.finish();

  c = start(p1, "step2", 8);
  await c.hold(10);
  await a1.clickOn(p1.locator('#engineBar [data-engine="gemini"]'), 20);
  await c.shot(); await c.hold(14);
  await a1.moveTo(p1.locator(".card .lvl").first(), 18);
  await c.hold(24);
  await a1.clickOn(p1.locator('#engineBar [data-engine="claude"]'), 18);
  await c.shot(); await c.hold(14);
  await a1.moveTo(p1.locator(".card .lvl").first(), 16);
  await c.hold(16);
  await a1.clickOn(p1.locator('#engineBar [data-engine="gemini"]'), 18);
  await c.shot();
  await c.finish();
  await ctx1.close();

  // ---------- Steps 3-6: the prompt window, at 960x540 so it fills the frame ----------
  const ctx2 = await browser.newContext({ viewport: { width: 960, height: 540 }, deviceScaleFactor: 2, colorScheme: "light", reducedMotion: "reduce" });
  const p2 = await ctx2.newPage();
  await p2.goto(SITE, { waitUntil: "networkidle" });
  await p2.evaluate(() => document.fonts.ready);
  await p2.click('#engineBar [data-engine="gemini"]');
  await p2.click('[data-jump="Slides"]');
  await p2.evaluate(() => { const g = document.querySelector("#grid"); scrollTo(0, g.getBoundingClientRect().top + scrollY - 140); });
  await setup(p2);
  const a2 = makeActions(p2, clipRef);
  await a2.place(700, 470);

  c = start(p2, "step3", 11);
  await c.hold(8);
  await a2.clickOn(p2.locator(".card", { hasText: "Create Slides" }).first(), 18);
  await c.shot(); await c.hold(10);
  await a2.clickOn(p2.locator('[data-preset="slide_count"][data-value="10"]'), 16);
  await a2.clickOn(p2.locator("#var-topic"), 14);
  await a2.type("Q3 Sales Review", 2);
  await a2.clickOn(p2.locator("#var-goal"), 14);
  await a2.type("Approve next quarter's budget", 1);
  await c.hold(10);
  await c.finish();

  c = start(p2, "step4", 10);
  await a2.scrollModalTo(p2.locator("#mRoles"), 20, 24);
  await a2.clickOn(p2.locator('#mRoleGrid [data-role="1"]'), 16);
  await c.hold(8);
  await a2.scrollModalTo(p2.locator("#mAudience"), 20, 22);
  await a2.clickOn(p2.locator('[data-aud="0"]'), 16);
  await c.hold(8);
  await a2.scrollModalTo(p2.locator("#mTones"), 20, 22);
  await a2.clickOn(p2.locator('[data-tone="8"]'), 16);
  await c.hold(10);
  await c.finish();

  c = start(p2, "step5", 11);
  await a2.scrollModalTo(p2.locator('[data-style="13"]'), 150, 30);
  await a2.clickOn(p2.locator('[data-style="13"]'), 18);
  await c.shot(); await c.hold(6);
  await a2.scrollModalTo(p2.locator("#mStylePreview"), 20, 18);
  await c.hold(20);
  await a2.scrollModalTo(p2.locator("#mAttach"), 30, 22);
  await a2.clickOn(p2.locator('[data-attach="2"]'), 16);
  await a2.clickOn(p2.locator("#attach-name"), 14);
  await a2.type("Q3 Sales Report.xlsx", 2);
  await c.hold(8);
  await c.finish();

  c = start(p2, "step6", 10);
  await a2.scrollModalTo(p2.locator("#mPrompt"), 16, 30);
  await a2.moveTo({ x: 420, y: 300 }, 18);
  await c.hold(40);
  await a2.scrollModalTo(p2.locator("#mCopy"), 300, 30);
  await a2.clickOn(p2.locator("#mCopy"), 18);
  for (let i = 0; i < 6; i++) await c.shot();
  await c.hold(20);
  await c.finish();

  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
