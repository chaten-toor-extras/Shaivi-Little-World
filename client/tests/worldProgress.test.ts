import assert from "node:assert";
import {
  resolveWorldProgress,
  type WorldProgressInput,
} from "../src/data/worldEvolutionRules";
import {
  worldProgressStorage,
  WORLD_PROGRESS_STORAGE_KEY,
} from "../src/services/worldProgressStorage";

console.log("Starting World Progression Engine & Storage Tests...");

// Mock localStorage for Node environment
class MockLocalStorage {
  private store: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }
}

const mockStorage = new MockLocalStorage();
(global as any).window = {
  localStorage: mockStorage,
};
(global as any).localStorage = mockStorage;

// ── Test 1: Baseline Initial State ────────────────────────────────
{
  const input: WorldProgressInput = {
    visitedSections: [],
    discoveredSecretCount: 0,
    totalActiveSecrets: 6,
    collectedItemCount: 0,
    totalActiveCollectibles: 8,
    letterSent: false,
    journeyExplored: false,
    musicPlayed: false,
    quoteInteracted: false,
  };

  const state = resolveWorldProgress(input);
  assert.strictEqual(state.overallProgress, 0, "Initial progress must be 0");
  assert.strictEqual(state.stage, "QUIET", "Initial stage must be QUIET");
  assert.strictEqual(state.completionEligible, false, "Not completion eligible");
  assert.strictEqual(state.effects.GALLERY_PALETTE, false);
  assert.strictEqual(state.effects.MAILBOX_FLAG, false);
  assert.strictEqual(state.effects.TELESCOPE_STARS, false);
  assert.strictEqual(state.effects.SECRET_MEADOW_FLOWER, false);
  assert.strictEqual(state.effects.COLLECTIBLE_VIOLETS, false);
  console.log("✓ Test 1 Passed: Initial state is clean, QUIET, and has 0 active effects");
}

// ── Test 2: Gallery Visit Unlocks Palette ────────────────────────
{
  const input: WorldProgressInput = {
    visitedSections: ["GALLERY"],
    discoveredSecretCount: 0,
    totalActiveSecrets: 6,
    collectedItemCount: 0,
    totalActiveCollectibles: 8,
    letterSent: false,
    journeyExplored: false,
    musicPlayed: false,
    quoteInteracted: false,
  };

  const state = resolveWorldProgress(input);
  assert.strictEqual(state.effects.GALLERY_PALETTE, true, "Gallery visit unlocks palette");
  assert.strictEqual(state.effects.GALLERY_SKETCH, false, "Sketch requires higher progress");
  assert.strictEqual(state.visitedRatio, 0.167);
  assert.ok(state.overallProgress > 0, "Progress should increase");
  console.log("✓ Test 2 Passed: Gallery visit unlocks palette");
}

// ── Test 3: Letter Sent Unlocks Mailbox Flag and Letter Detail ─────
{
  const input: WorldProgressInput = {
    visitedSections: [],
    discoveredSecretCount: 0,
    totalActiveSecrets: 6,
    collectedItemCount: 0,
    totalActiveCollectibles: 8,
    letterSent: true,
    journeyExplored: false,
    musicPlayed: false,
    quoteInteracted: false,
  };

  const state = resolveWorldProgress(input);
  assert.strictEqual(state.effects.MAILBOX_FLAG, true, "Mailbox flag unlocked");
  assert.strictEqual(state.effects.MAILBOX_LETTER, true, "Mailbox letter unlocked");
  console.log("✓ Test 3 Passed: Confirmed letter sent unlocks mailbox evolution");
}

// ── Test 4: Dynamic CMS Catalog Counts & Zero Total Handling ──────
{
  // Zero active secrets in CMS should not divide by zero or result in NaN
  const input: WorldProgressInput = {
    visitedSections: ["ABOUT", "QUOTES", "GALLERY", "JOURNEY", "CONTACT", "MUSIC"],
    discoveredSecretCount: 0,
    totalActiveSecrets: 0, // No active secrets
    collectedItemCount: 4,
    totalActiveCollectibles: 8,
    letterSent: true,
    journeyExplored: true,
    musicPlayed: true,
    quoteInteracted: true,
  };

  const state = resolveWorldProgress(input);
  assert.ok(!Number.isNaN(state.overallProgress), "Progress must not be NaN");
  assert.strictEqual(state.secretRatio, 1.0, "Zero active secrets should default to 1.0 ratio");
  assert.strictEqual(state.collectibleRatio, 0.5, "4/8 collectibles is 0.5");
  assert.ok(state.overallProgress <= 1.0, "Progress must be clamped <= 1.0");
  console.log("✓ Test 4 Passed: Zero dynamic catalog count handled safely without NaN");
}

// ── Test 5: Collectible & Secret Threshold Unlocks ────────────────
{
  const input: WorldProgressInput = {
    visitedSections: ["GALLERY"],
    discoveredSecretCount: 3,
    totalActiveSecrets: 6, // 50%
    collectedItemCount: 6,
    totalActiveCollectibles: 8, // 75%
    letterSent: false,
    journeyExplored: true,
    musicPlayed: false,
    quoteInteracted: false,
  };

  const state = resolveWorldProgress(input);
  assert.strictEqual(state.effects.SECRET_MEADOW_FLOWER, true, "Meadow flower unlocked at >= 25%");
  assert.strictEqual(state.effects.SECRET_FIREFLIES, true, "Fireflies unlocked at >= 50%");
  assert.strictEqual(state.effects.COLLECTIBLE_VIOLETS, true, "Violets unlocked at >= 25%");
  assert.strictEqual(state.effects.COLLECTIBLE_BENCH_STAR, true, "Bench star unlocked at >= 50%");
  assert.strictEqual(state.effects.COLLECTIBLE_POND_LILIES, true, "Pond lilies unlocked at >= 75%");
  assert.strictEqual(state.effects.COLLECTIBLE_HARMONY, false, "Harmony requires 100%");
  console.log("✓ Test 5 Passed: Dynamic threshold unlocks operate correctly");
}

// ── Test 6: Completion Eligible for Phase 11 ─────────────────────
{
  const almostComplete: WorldProgressInput = {
    visitedSections: ["ABOUT", "QUOTES", "GALLERY", "JOURNEY", "CONTACT", "MUSIC"],
    discoveredSecretCount: 4,
    totalActiveSecrets: 6, // ~66% (< 70%)
    collectedItemCount: 7,
    totalActiveCollectibles: 8, // 87.5%
    letterSent: true,
    journeyExplored: true,
    musicPlayed: true,
    quoteInteracted: true,
  };

  const state1 = resolveWorldProgress(almostComplete);
  assert.strictEqual(state1.completionEligible, false, "Requires >= 70% secrets");

  const fullyEligible: WorldProgressInput = {
    ...almostComplete,
    discoveredSecretCount: 5, // 5/6 = 83.3% (>= 70%)
  };

  const state2 = resolveWorldProgress(fullyEligible);
  assert.strictEqual(state2.completionEligible, true, "Eligible when sections, journey, >=70% secrets & >=70% collectibles complete");
  assert.strictEqual(state2.stage, "ALIVE", "High progress achieves ALIVE stage");
  console.log("✓ Test 6 Passed: Phase 11 completion eligibility verified");
}

// ── Test 7: WorldProgressStorage Service ──────────────────────────
{
  mockStorage.clear();
  const storage = worldProgressStorage;
  const initial = storage.loadProgress();
  assert.strictEqual(initial.version, 1);
  assert.deepStrictEqual(initial.visitedSections, []);
  assert.strictEqual(initial.letterSent, false);

  storage.recordSectionVisited("GALLERY");
  storage.recordSectionVisited("GALLERY"); // Idempotent duplicate
  storage.recordLetterSent();
  storage.recordJourneyExplored();
  storage.recordMusicPlayed();
  storage.recordQuoteInteracted();

  const saved = storage.loadProgress();
  assert.deepStrictEqual(saved.visitedSections, ["GALLERY"], "Duplicate visits must be deduplicated");
  assert.strictEqual(saved.letterSent, true);
  assert.strictEqual(saved.journeyExplored, true);
  assert.strictEqual(saved.musicPlayed, true);
  assert.strictEqual(saved.quoteInteracted, true);

  storage.resetProgress();
  const afterReset = storage.loadProgress();
  assert.deepStrictEqual(afterReset.visitedSections, []);
  assert.strictEqual(afterReset.letterSent, false);
  console.log("✓ Test 7 Passed: Storage service records idempotently and resets cleanly");
}

console.log("\nAll World Progression Engine & Storage Tests Passed! (7/7)");

