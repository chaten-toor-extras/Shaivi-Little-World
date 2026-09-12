import assert from "node:assert";
import { evaluateSecretConditions } from "../src/services/secretEvaluator";
import { SecretEngineCore } from "../src/services/secretEngineCore";
import type { PublicSecret, SecretEvent, SecretRevealPayload } from "../src/types";

console.log("Starting Secret Engine Unit Tests...");

// 1. Single Click Trigger
{
  const reveals: SecretRevealPayload[] = [];
  const discoveries: string[] = [];

  const engine = new SecretEngineCore({
    onDiscover: (slug) => discoveries.push(slug),
    onReveal: (reveal) => reveals.push(reveal),
    getRuntimeContext: () => ({ timeOfDay: "DAY" }),
    getDiscovered: () => ({}),
  });

  const secret: PublicSecret = {
    _id: "sec-1",
    name: "Desk Click",
    slug: "desk-click",
    enabled: true,
    isPublished: true,
    order: 0,
    target: { type: "BOOKS" },
    trigger: { type: "CLICK", requiredCount: 1 },
    conditions: {},
    reveal: { type: "MESSAGE", title: "Desk Note", message: "Found!" },
    behavior: { repeatable: false },
  };

  engine.setDefinitions([secret]);

  engine.processEvent({
    type: "CLICK",
    targetType: "BOOKS",
    timestamp: 1000,
  });

  assert.strictEqual(discoveries.length, 1, "Should discover secret on single click");
  assert.strictEqual(discoveries[0], "desk-click");
  assert.strictEqual(reveals.length, 1, "Should trigger reveal on single click");
  assert.strictEqual(reveals[0].title, "Desk Note");
  console.log("✓ Single click trigger passed");
}

// 2. Multi-Click Trigger with Time Window & Window Expiration
{
  const reveals: SecretRevealPayload[] = [];
  const discoveries: string[] = [];

  const engine = new SecretEngineCore({
    onDiscover: (slug) => discoveries.push(slug),
    onReveal: (reveal) => reveals.push(reveal),
    getRuntimeContext: () => ({ timeOfDay: "DAY" }),
    getDiscovered: () => ({}),
  });

  const secret: PublicSecret = {
    _id: "sec-2",
    name: "Butterfly Whisper",
    slug: "butterfly-whisper",
    enabled: true,
    isPublished: true,
    order: 0,
    target: { type: "BUTTERFLY" },
    trigger: { type: "MULTI_CLICK", requiredCount: 3, windowMs: 5000 },
    conditions: {},
    reveal: { type: "MESSAGE", title: "Butterfly Found" },
    behavior: { repeatable: false },
  };

  engine.setDefinitions([secret]);

  // Click 1 at t=1000
  engine.processEvent({ type: "CLICK", targetType: "BUTTERFLY", timestamp: 1000 });
  assert.strictEqual(reveals.length, 0, "1 click should not trigger 3-click secret");

  // Click 2 at t=2000
  engine.processEvent({ type: "CLICK", targetType: "BUTTERFLY", timestamp: 2000 });
  assert.strictEqual(reveals.length, 0, "2 clicks should not trigger 3-click secret");

  // Click 3 at t=3000 (within 5000ms window)
  engine.processEvent({ type: "CLICK", targetType: "BUTTERFLY", timestamp: 3000 });
  assert.strictEqual(reveals.length, 1, "3 clicks within window must trigger secret");
  assert.strictEqual(discoveries[0], "butterfly-whisper");

  // Test window expiration: reset engine
  engine.resetRuntimeState();
  const revealsExp: SecretRevealPayload[] = [];
  const engineExp = new SecretEngineCore({
    onDiscover: () => {},
    onReveal: (r) => revealsExp.push(r),
    getRuntimeContext: () => ({}),
    getDiscovered: () => ({}),
  });
  engineExp.setDefinitions([secret]);

  // Click 1 at t=1000
  engineExp.processEvent({ type: "CLICK", targetType: "BUTTERFLY", timestamp: 1000 });
  // Click 2 at t=2000
  engineExp.processEvent({ type: "CLICK", targetType: "BUTTERFLY", timestamp: 2000 });
  // Click 3 at t=8000 (6000ms after Click 2 -> Click 1 and 2 expired from 5000ms window)
  engineExp.processEvent({ type: "CLICK", targetType: "BUTTERFLY", timestamp: 8000 });
  assert.strictEqual(revealsExp.length, 0, "Clicks outside window should expire and not trigger");

  console.log("✓ Multi-click trigger & window expiration passed");
}

// 3. Toggle, Ripple, and Shake Count Accumulation
{
  const reveals: SecretRevealPayload[] = [];

  const engine = new SecretEngineCore({
    onDiscover: () => {},
    onReveal: (r) => reveals.push(r),
    getRuntimeContext: () => ({}),
    getDiscovered: () => ({}),
  });

  const lampSecret: PublicSecret = {
    _id: "sec-lamp",
    name: "Lamp Toggle",
    slug: "lamp-toggle",
    enabled: true,
    isPublished: true,
    order: 0,
    target: { type: "LAMP" },
    trigger: { type: "TOGGLE", requiredCount: 4, windowMs: 10000 },
    conditions: {},
    reveal: { type: "MESSAGE", title: "Lamp Glow" },
    behavior: { repeatable: true },
  };

  const pondSecret: PublicSecret = {
    _id: "sec-pond",
    name: "Pond Ripple",
    slug: "pond-ripple",
    enabled: true,
    isPublished: true,
    order: 1,
    target: { type: "POND" },
    trigger: { type: "RIPPLE", requiredCount: 5, windowMs: 15000 },
    conditions: {},
    reveal: { type: "MESSAGE", title: "Pond Star" },
    behavior: { repeatable: false },
  };

  engine.setDefinitions([lampSecret, pondSecret]);

  // 4 toggles on lamp
  for (let i = 0; i < 4; i++) {
    engine.processEvent({ type: "TOGGLE", targetType: "LAMP", timestamp: 1000 + i * 500 });
  }
  assert.strictEqual(reveals.length, 1, "4 lamp toggles should trigger lamp secret");
  assert.strictEqual(reveals[0].title, "Lamp Glow");

  // 5 ripples on pond
  for (let i = 0; i < 5; i++) {
    engine.processEvent({ type: "RIPPLE", targetType: "POND", timestamp: 5000 + i * 500 });
  }
  assert.strictEqual(reveals.length, 2, "5 pond ripples should trigger pond secret");
  assert.strictEqual(reveals[1].title, "Pond Star");

  console.log("✓ Toggle and Ripple trigger accumulation passed");
}

// 4. Condition Evaluation (Time of Day, Mood, Visited Sections, Letter, Journey)
{
  const secret: PublicSecret = {
    _id: "sec-night-dreamy",
    name: "Night Window Dreamy",
    slug: "night-window-dreamy",
    enabled: true,
    isPublished: true,
    order: 0,
    target: { type: "HOUSE_WINDOW" },
    trigger: { type: "CLICK", requiredCount: 1 },
    conditions: {
      timeOfDay: ["NIGHT"],
      moods: ["mood-dreamy"],
      sectionsVisited: ["ABOUT", "JOURNEY"],
      letterSent: true,
      journeyViewed: true,
    },
    reveal: { type: "MESSAGE", title: "Secret Window" },
    behavior: { repeatable: false },
  };

  // Failing conditions
  assert.strictEqual(
    evaluateSecretConditions(secret, { timeOfDay: "DAY" }),
    false,
    "Should fail if timeOfDay does not match",
  );

  assert.strictEqual(
    evaluateSecretConditions(secret, {
      timeOfDay: "NIGHT",
      activeMoodId: "mood-happy",
    }),
    false,
    "Should fail if mood does not match",
  );

  assert.strictEqual(
    evaluateSecretConditions(secret, {
      timeOfDay: "NIGHT",
      activeMoodId: "mood-dreamy",
      visitedSections: ["ABOUT"], // missing JOURNEY
    }),
    false,
    "Should fail if all required sections are not visited",
  );

  assert.strictEqual(
    evaluateSecretConditions(secret, {
      timeOfDay: "NIGHT",
      activeMoodId: "mood-dreamy",
      visitedSections: ["ABOUT", "JOURNEY"],
      letterSent: false, // missing letter
    }),
    false,
    "Should fail if letterSent is false",
  );

  assert.strictEqual(
    evaluateSecretConditions(secret, {
      timeOfDay: "NIGHT",
      activeMoodId: "mood-dreamy",
      visitedSections: ["ABOUT", "JOURNEY"],
      letterSent: true,
      journeyViewed: true,
    }),
    true,
    "Should pass when ALL conditions are met",
  );

  console.log("✓ Condition evaluation (Time, Mood, Sections, Letter, Journey) passed");
}

// 5. Prerequisite Secret Dependency Chain (A unlocks B)
{
  const reveals: SecretRevealPayload[] = [];
  const discoveredMap: Record<string, any> = {};

  const engine = new SecretEngineCore({
    onDiscover: (slug) => {
      discoveredMap[slug] = { slug, discoveredAt: new Date().toISOString() };
    },
    onReveal: (r) => reveals.push(r),
    getRuntimeContext: () => ({}),
    getDiscovered: () => discoveredMap,
  });

  const secA: PublicSecret = {
    _id: "sec-a",
    name: "Secret A",
    slug: "secret-a",
    enabled: true,
    isPublished: true,
    order: 0,
    target: { type: "LAMP" },
    trigger: { type: "CLICK", requiredCount: 1 },
    conditions: {},
    reveal: { type: "MESSAGE", title: "A" },
    behavior: { repeatable: false },
  };

  const secB: PublicSecret = {
    _id: "sec-b",
    name: "Secret B",
    slug: "secret-b",
    enabled: true,
    isPublished: true,
    order: 1,
    target: { type: "POND" },
    trigger: { type: "CLICK", requiredCount: 1 },
    conditions: {
      requiresSecretIds: ["secret-a"],
    },
    reveal: { type: "MESSAGE", title: "B" },
    behavior: { repeatable: false },
  };

  engine.setDefinitions([secA, secB]);

  // Click Pond before A is discovered -> should NOT trigger B
  engine.processEvent({ type: "CLICK", targetType: "POND", timestamp: 1000 });
  assert.strictEqual(reveals.length, 0, "Secret B must not unlock before Secret A");

  // Click Lamp -> unlocks A
  engine.processEvent({ type: "CLICK", targetType: "LAMP", timestamp: 2000 });
  assert.strictEqual(reveals.length, 1, "Secret A should unlock");
  assert.strictEqual(reveals[0].title, "A");

  // Now click Pond -> should unlock B!
  engine.processEvent({ type: "CLICK", targetType: "POND", timestamp: 3000 });
  assert.strictEqual(reveals.length, 2, "Secret B should unlock now that A is discovered");
  assert.strictEqual(reveals[1].title, "B");

  console.log("✓ Prerequisite secret chain (A -> B) passed");
}

// 6. Repeatable, Cooldown, and Once-Per-Session Policies
{
  const reveals: SecretRevealPayload[] = [];
  const discoveredMap: Record<string, any> = {};

  const engine = new SecretEngineCore({
    onDiscover: (slug) => {
      discoveredMap[slug] = { slug, discoveredAt: new Date().toISOString() };
    },
    onReveal: (r) => reveals.push(r),
    getRuntimeContext: () => ({}),
    getDiscovered: () => discoveredMap,
  });

  const repeatableSecret: PublicSecret = {
    _id: "sec-repeatable",
    name: "Repeatable Tree",
    slug: "repeatable-tree",
    enabled: true,
    isPublished: true,
    order: 0,
    target: { type: "TREE" },
    trigger: { type: "SHAKE", requiredCount: 1 },
    conditions: {},
    reveal: { type: "MESSAGE", title: "Leaves" },
    behavior: {
      repeatable: true,
      cooldownMs: 5000,
    },
  };

  engine.setDefinitions([repeatableSecret]);

  // Trigger 1 at t=1000
  engine.processEvent({ type: "SHAKE", targetType: "TREE", timestamp: 1000 });
  assert.strictEqual(reveals.length, 1, "First trigger succeeds");

  // Trigger 2 at t=3000 (inside 5000ms cooldown) -> ignored
  engine.processEvent({ type: "SHAKE", targetType: "TREE", timestamp: 3000 });
  assert.strictEqual(reveals.length, 1, "Trigger inside cooldown must be ignored");

  // Trigger 3 at t=7000 (after 6000ms > 5000ms cooldown) -> succeeds!
  engine.processEvent({ type: "SHAKE", targetType: "TREE", timestamp: 7000 });
  assert.strictEqual(reveals.length, 2, "Trigger after cooldown succeeds");

  console.log("✓ Repeatable and cooldown policies passed");
}

// 7. Non-repeatable Secret Ignored After First Discovery
{
  const reveals: SecretRevealPayload[] = [];
  const discoveredMap: Record<string, any> = {};

  const engine = new SecretEngineCore({
    onDiscover: (slug) => {
      discoveredMap[slug] = { slug, discoveredAt: new Date().toISOString() };
    },
    onReveal: (r) => reveals.push(r),
    getRuntimeContext: () => ({}),
    getDiscovered: () => discoveredMap,
  });

  const oneTimeSecret: PublicSecret = {
    _id: "sec-onetime",
    name: "One Time Star",
    slug: "one-time-star",
    enabled: true,
    isPublished: true,
    order: 0,
    target: { type: "CLOCK" },
    trigger: { type: "CLICK", requiredCount: 1 },
    conditions: {},
    reveal: { type: "MESSAGE", title: "Star" },
    behavior: { repeatable: false },
  };

  engine.setDefinitions([oneTimeSecret]);

  engine.processEvent({ type: "CLICK", targetType: "CLOCK", timestamp: 1000 });
  assert.strictEqual(reveals.length, 1);

  engine.processEvent({ type: "CLICK", targetType: "CLOCK", timestamp: 5000 });
  assert.strictEqual(reveals.length, 1, "Non-repeatable secret must not reveal again");

  console.log("✓ Non-repeatable secret policy passed");
}

// 8. Resilience against malformed/unknown secrets
{
  const engine = new SecretEngineCore({
    onDiscover: () => {},
    onReveal: () => {},
    getRuntimeContext: () => ({}),
    getDiscovered: () => ({}),
  });

  // Malformed definition without trigger or target
  engine.setDefinitions([
    { _id: "broken", name: "Broken" } as any,
  ]);

  assert.doesNotThrow(() => {
    engine.processEvent({ type: "CLICK", targetType: "WORLD", timestamp: 1000 });
  }, "Engine must not throw on malformed definitions");

  console.log("✓ Malformed secret resilience passed");
}

console.log("All Secret Engine Unit Tests Passed Successfully! ✦");
