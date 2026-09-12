import { describe, expect, it } from "vitest";
import { PerspectiveCamera, Vector3 } from "three";
import { quoteCameraDistance, quotePages, TV_FOCUS } from "../src/components/world/quote-tv/quoteTVConfig";
import { createQuotePointerGuard } from "../src/components/world/quote-tv/quotePointerGuard";
import { publishedQuotes, useQuotePlayerMemory } from "../src/components/world/quote-tv/useQuotePlayer";
import type { Quote } from "../src/types";

describe("shared quote player", () => {
  it("wraps, handles rapid input, and retains the channel across power cycles", () => {
    useQuotePlayerMemory.setState({ index: 0, page: 0, on: true });
    const player = useQuotePlayerMemory.getState();
    player.tune(-1, 4); expect(useQuotePlayerMemory.getState().index).toBe(3);
    player.tune(1, 4); expect(useQuotePlayerMemory.getState().index).toBe(0);
    for (let i = 0; i < 103; i++) player.tune(1, 4);
    expect(useQuotePlayerMemory.getState().index).toBe(3);
    player.toggle(); expect(useQuotePlayerMemory.getState().on).toBe(false);
    player.toggle(); expect(useQuotePlayerMemory.getState().index).toBe(3);
    player.turnPage(3); expect(useQuotePlayerMemory.getState().page).toBe(1);
    player.tune(1, 4); expect(useQuotePlayerMemory.getState().page).toBe(0);
  });
  it("safely ignores navigation for zero or one published quote", () => {
    useQuotePlayerMemory.setState({ index: 0, page: 0, on: true });
    const player = useQuotePlayerMemory.getState();
    for (const count of [0, 1]) { player.tune(-1, count); player.tune(1, count); }
    expect(useQuotePlayerMemory.getState().index).toBe(0);
  });
  it("uses CMS ordering, excludes drafts, and does not mutate source content", () => {
    const source = [
      { _id: "later", text: "Original text", order: 2, isPublished: true },
      { _id: "draft", text: "Unpublished", order: 0, isPublished: false },
      { _id: "first", text: "First text", order: 1, isPublished: true },
    ] as Quote[];
    const before = JSON.stringify(source);
    expect(publishedQuotes(source).map((q) => q._id)).toEqual(["first", "later"]);
    expect(JSON.stringify(source)).toBe(before);
    expect(publishedQuotes([])).toEqual([]);
  });
});

describe("TV framing", () => {
  for (const [width, height] of [[1440, 900], [390, 844], [844, 390], [320, 568]]) {
    for (const fov of [33, 37, 41]) {
      it(`keeps the close-up cabinet and controls visible at ${width}×${height}, fov ${fov}`, () => {
        const camera = new PerspectiveCamera(fov, width / height, 0.1, 100);
        camera.position.set(TV_FOCUS[0], TV_FOCUS[1], TV_FOCUS[2] + quoteCameraDistance(width, height, fov));
        camera.lookAt(...TV_FOCUS);
        camera.updateMatrixWorld();
        for (const point of [[-0.71, 0.89, 0.20], [1.01, 1.91, 0.20], [0.94, 1.69, 0.355], [0.94, 1.10, 0.355]]) {
          const projected = new Vector3(...point).project(camera);
          expect(Math.abs(projected.x)).toBeLessThan(0.95);
          expect(Math.abs(projected.y)).toBeLessThan(0.82);
        }
        const edge = new Vector3(1.01, 1.91, 0.2).project(camera);
        expect(Math.max(Math.abs(edge.x), Math.abs(edge.y))).toBeGreaterThan(0.7);
      });
    }
  }
});

describe("long CMS content", () => {
  for (const text of ["", "A short quote.", "word ".repeat(1000), "🦋".repeat(500), "x".repeat(1000), "Line\n".repeat(100)]) {
    it(`preserves all ${text.length} characters with bounded pages`, () => {
      const pages = quotePages(text);
      expect(pages.join("")).toBe(text);
      expect(pages.every((p) => Array.from(p).length <= 180)).toBe(true);
      expect(pages.length).toBeGreaterThan(0);
    });
  }
});

describe("intentional TV taps", () => {
  it("accepts a clean tap, rejects out-and-back drag and resets for the next tap", () => {
    const guard = createQuotePointerGuard();
    expect(guard.allows(0)).toBe(false);
    guard.down(1, 10, 10, 0); guard.up(1);
    expect(guard.allows(100)).toBe(true);
    guard.down(1, 10, 10, 100); guard.move(1, 30, 10); guard.move(1, 10, 10); guard.up(1);
    expect(guard.allows(200)).toBe(false);
    guard.down(1, 10, 10, 200); guard.up(1);
    expect(guard.allows(250)).toBe(true);
  });
  it("rejects both releases of a pinch and canceled or held gestures", () => {
    const guard = createQuotePointerGuard();
    guard.down(1, 10, 10, 0); guard.down(2, 11, 11, 10); guard.up(1);
    expect(guard.allows(100)).toBe(false);
    guard.up(2); expect(guard.allows(150)).toBe(false);
    guard.down(1, 10, 10, 200); guard.cancel(); expect(guard.allows(250)).toBe(false);
    guard.down(1, 10, 10, 300); guard.up(1); expect(guard.allows(1200)).toBe(false);
  });
});

describe("existing client regression scripts", () => {
  it("telescope", async () => { await import("./telescope.test"); });
  it("moods", async () => { await import("./moodResolver.test"); });
  it("secrets", async () => { await import("./secretEngine.test"); });
  it("collectibles", async () => { await import("./collectibleEngine.test"); });
});
