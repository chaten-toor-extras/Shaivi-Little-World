import assert from "node:assert";
import { collectibleStorage, STORAGE_KEY } from "../src/services/collectibleStorage";
import type { PublicCollectible, PublicSecret } from "../src/types";
import { SecretEngineCore } from "../src/services/secretEngineCore";

console.log("Starting Collectibles Engine & Storage Unit Tests...");

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
// Assign to global
(global as any).window = {
  localStorage: mockStorage,
};
(global as any).localStorage = mockStorage;

// ── Test 1: Storage Initial State & Versioning ─────────────────────
{
  mockStorage.clear();
  const initial = collectibleStorage.loadProgress();
  assert.strictEqual(initial.version, 1, "Storage schema version must be 1");
  assert.deepStrictEqual(initial.collected, {}, "Initial collected registry must be empty");
  console.log("✓ Storage initial state and schema versioning passed");
}

// ── Test 2: Idempotent Collection Recording ────────────────────────
{
  mockStorage.clear();

  // First record
  const result1 = collectibleStorage.saveCollectedItem("item-star", "little-star");
  assert.strictEqual(result1.isNew, true, "First save should be new");
  assert.ok(result1.updated.collected["item-star"], "Item should exist in updated progress");
  assert.strictEqual(result1.updated.collected["item-star"].slug, "little-star");

  // Read back from storage
  const state1 = collectibleStorage.loadProgress();
  assert.ok(state1.collected["item-star"], "Item should exist in persistent storage");
  assert.strictEqual(state1.collected["item-star"].slug, "little-star");

  // Duplicate record (should be idempotent & return isNew: false)
  const result2 = collectibleStorage.saveCollectedItem("item-star", "little-star");
  assert.strictEqual(result2.isNew, false, "Duplicate save must not be new");
  assert.strictEqual(
    result2.updated.collected["item-star"].collectedAt,
    result1.updated.collected["item-star"].collectedAt,
    "Should preserve original timestamp"
  );

  console.log("✓ Idempotent collection recording passed");
}

// ── Test 3: Progress Reset ─────────────────────────────────────────
{
  mockStorage.clear();
  collectibleStorage.saveCollectedItem("item-star", "little-star");
  collectibleStorage.saveCollectedItem("item-crane", "paper-crane");

  const beforeReset = collectibleStorage.loadProgress();
  assert.strictEqual(Object.keys(beforeReset.collected).length, 2);

  collectibleStorage.resetProgress();
  const afterReset = collectibleStorage.loadProgress();
  assert.strictEqual(Object.keys(afterReset.collected).length, 0, "Reset should clear all collected items");

  console.log("✓ Storage resetProgress passed");
}

// ── Test 4: Definition Matching & Active Calculations ──────────────
{
  const mockDefinitions: PublicCollectible[] = [
    {
      _id: "col-1",
      name: "Little Star",
      slug: "little-star",
      category: "STAR",
      rarity: "COMMON",
      source: "WORLD",
      enabled: true,
      isPublished: true,
      order: 0,
      model: { modelKey: "tiny_star" },
      appearance: {},
      placement: { anchor: "FLOWER_FIELD", offset: { x: 0, y: 0, z: 0 } },
      behavior: {},
    },
    {
      _id: "col-2",
      name: "Golden Wing",
      slug: "golden-wing",
      category: "MAGIC",
      rarity: "RARE",
      source: "SECRET",
      enabled: true,
      isPublished: true,
      order: 1,
      model: { modelKey: "golden_wing" },
      appearance: {},
      placement: { anchor: "FLOWER_FIELD", offset: { x: 0, y: 0, z: 0 } },
      behavior: {},
    },
    {
      _id: "col-3",
      name: "Draft Keepsake",
      slug: "draft-item",
      category: "ART",
      rarity: "SPECIAL",
      source: "WORLD",
      enabled: true,
      isPublished: false,
      order: 2,
      model: { modelKey: "crystal" },
      appearance: {},
      placement: { anchor: "BENCH", offset: { x: 0, y: 0, z: 0 } },
      behavior: {},
    },
    {
      _id: "col-4",
      name: "Disabled Keepsake",
      slug: "disabled-item",
      category: "MEMORY",
      rarity: "COMMON",
      source: "WORLD",
      enabled: false,
      isPublished: true,
      order: 3,
      model: { modelKey: "paper_crane" },
      appearance: {},
      placement: { anchor: "BENCH", offset: { x: 0, y: 0, z: 0 } },
      behavior: {},
    },
  ];

  // Active items filter (enabled && isPublished)
  const activeItems = mockDefinitions.filter((d) => d.enabled && d.isPublished);
  assert.strictEqual(activeItems.length, 2, "Only enabled & published items should count toward total");
  assert.strictEqual(activeItems[0]._id, "col-1");
  assert.strictEqual(activeItems[1]._id, "col-2");

  console.log("✓ Collectible active filter and published status passed");
}

// ── Test 5: Secret Engine Integration with Collectible Reward ──────
{
  const grantedCollectibles: string[] = [];

  const secretEngine = new SecretEngineCore({
    onDiscover: () => {},
    onReveal: (reveal) => {
      if (reveal.type === "COLLECTIBLE" && reveal.collectibleId) {
        grantedCollectibles.push(reveal.collectibleId);
      }
    },
    getRuntimeContext: () => ({ timeOfDay: "DAY" }),
    getDiscovered: () => ({}),
  });

  const secretWithCollectible: PublicSecret = {
    _id: "sec-butterfly",
    name: "Butterfly Whisper",
    slug: "butterfly-whisper",
    enabled: true,
    isPublished: true,
    order: 0,
    target: { type: "BUTTERFLY", id: "golden-butterfly" },
    trigger: { type: "MULTI_CLICK", requiredCount: 3, windowMs: 12000 },
    conditions: {},
    reveal: {
      type: "COLLECTIBLE",
      collectibleId: "col-golden-wing-id",
      title: "Whisper of the Golden Butterfly",
      message: "The butterfly rested on your fingertips, leaving behind a delicate shimmering wing.",
    },
    behavior: { repeatable: false },
  };

  secretEngine.setDefinitions([secretWithCollectible]);

  // Click 1
  secretEngine.processEvent({ type: "CLICK", targetType: "BUTTERFLY", targetId: "golden-butterfly", timestamp: 1000 });
  assert.strictEqual(grantedCollectibles.length, 0);

  // Click 2
  secretEngine.processEvent({ type: "CLICK", targetType: "BUTTERFLY", targetId: "golden-butterfly", timestamp: 2000 });
  assert.strictEqual(grantedCollectibles.length, 0);

  // Click 3 (completes requirement)
  secretEngine.processEvent({ type: "CLICK", targetType: "BUTTERFLY", targetId: "golden-butterfly", timestamp: 3000 });
  assert.strictEqual(grantedCollectibles.length, 1, "Secret reveal should grant collectible item");
  assert.strictEqual(grantedCollectibles[0], "col-golden-wing-id");

  console.log("✓ Secret Engine -> Collectible Reward integration passed");
}

// ── Test 6: Safe Corrupted LocalStorage Handling ───────────────────
{
  // Corrupted non-JSON string
  mockStorage.setItem(STORAGE_KEY, "invalid-json{{");
  const fallback = collectibleStorage.loadProgress();
  assert.strictEqual(fallback.version, 1);
  assert.deepStrictEqual(fallback.collected, {});

  // Outdated schema version
  mockStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 0, collected: { old: {} } }));
  const upgraded = collectibleStorage.loadProgress();
  assert.strictEqual(upgraded.version, 1);
  assert.deepStrictEqual(upgraded.collected, {});

  console.log("✓ Corrupted / outdated localStorage resilience passed");
}

console.log("All Collectibles Engine & Storage Unit Tests Passed Successfully! ✦");
