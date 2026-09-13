import {
  canStartCompletionCinematic,
  type CompletionTriggerContext,
} from "../src/components/world/completion/completionResolver";
import { completionCinematicStorage } from "../src/services/completionCinematicStorage";
import { fitCinematicCamera } from "../src/components/world/completion/fitCinematicCamera";
import { useCompletionCinematicStore } from "../src/components/world/completion/useCompletionCinematicStore";
import {
  useCameraNavigationStore,
  canNavigateWorld,
} from "../src/components/world/navigation/cameraNavigationStore";
import { useExperienceStore } from "../src/store/useExperienceStore";
import { useCollectibleStore } from "../src/store/useCollectibleStore";

// Mock localStorage for headless Node environment
const mockStorage: Record<string, string> = {};
if (typeof window === "undefined" || !window.localStorage) {
  (global as any).window = {
    localStorage: {
      getItem: (k: string) => mockStorage[k] || null,
      setItem: (k: string, v: string) => {
        mockStorage[k] = v;
      },
      removeItem: (k: string) => {
        delete mockStorage[k];
      },
      clear: () => {
        Object.keys(mockStorage).forEach((k) => delete mockStorage[k]);
      },
    },
  };
}

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`FAIL: ${msg}`);
  }
}

function runTests() {
  console.log("Starting Phase 11 Completion Cinematic Unit Tests...\n");

  // -------------------------------------------------------------
  // Test 1: Safe-Trigger Resolver (canStartCompletionCinematic)
  // -------------------------------------------------------------
  const baseContext: CompletionTriggerContext = {
    completionEligible: true,
    hasPlayed: false,
    isReplay: false,
    mode: "WORLD",
    transitioning: false,
    secretOpen: false,
    bookOpen: false,
    activeCelebration: false,
    activeReveal: false,
    menuOpen: false,
    isHydrated: true,
    sceneReady: true,
    featureFlagEnabled: true,
    cmsEnabled: true,
    cmsAutoPlayEnabled: true,
  };

  assert(
    canStartCompletionCinematic(baseContext) === true,
    "Test 1.1: Standard eligible idle world state returns true"
  );

  assert(
    canStartCompletionCinematic({ ...baseContext, completionEligible: false }) === false,
    "Test 1.2: Ineligible world state returns false"
  );

  assert(
    canStartCompletionCinematic({ ...baseContext, mode: "GALLERY" }) === false,
    "Test 1.3: Active section mode (GALLERY) prevents auto-trigger"
  );

  assert(
    canStartCompletionCinematic({ ...baseContext, mode: "INTRO" }) === false,
    "Test 1.4: INTRO mode prevents auto-trigger"
  );

  assert(
    canStartCompletionCinematic({ ...baseContext, transitioning: true }) === false,
    "Test 1.5: Camera transition in flight prevents trigger"
  );

  assert(
    canStartCompletionCinematic({ ...baseContext, secretOpen: true }) === false,
    "Test 1.6: Active secret modal prevents trigger"
  );

  assert(
    canStartCompletionCinematic({ ...baseContext, bookOpen: true }) === false,
    "Test 1.7: Active collection book prevents trigger"
  );

  assert(
    canStartCompletionCinematic({ ...baseContext, activeCelebration: true }) === false,
    "Test 1.8: Active keepsake celebration prevents trigger"
  );

  assert(
    canStartCompletionCinematic({ ...baseContext, activeReveal: true }) === false,
    "Test 1.9: Active secret reveal celebration prevents trigger"
  );

  assert(
    canStartCompletionCinematic({ ...baseContext, isHydrated: false }) === false,
    "Test 1.10: Unhydrated state prevents premature startup jump"
  );

  assert(
    canStartCompletionCinematic({ ...baseContext, sceneReady: false }) === false,
    "Test 1.11: Scene not ready prevents startup jump"
  );

  assert(
    canStartCompletionCinematic({ ...baseContext, featureFlagEnabled: false }) === false,
    "Test 1.12: Disabled feature flag prevents trigger"
  );

  assert(
    canStartCompletionCinematic({ ...baseContext, cmsEnabled: false }) === false,
    "Test 1.13: CMS completion disabled prevents trigger"
  );

  assert(
    canStartCompletionCinematic({ ...baseContext, cmsAutoPlayEnabled: false }) === false,
    "Test 1.14: CMS autoPlayEnabled false prevents auto-play"
  );

  console.log("✓ Test 1 Passed: Safe-trigger resolver evaluates all invariants correctly");

  // -------------------------------------------------------------
  // Test 2: Auto-Play Once vs Replay Semantics
  // -------------------------------------------------------------
  assert(
    canStartCompletionCinematic({ ...baseContext, hasPlayed: true, isReplay: false }) === false,
    "Test 2.1: Already played prevents auto-trigger on subsequent visits"
  );

  assert(
    canStartCompletionCinematic({ ...baseContext, hasPlayed: true, isReplay: true }) === true,
    "Test 2.2: Replay is allowed when hasPlayed is true"
  );

  // If CMS added new items so current completionEligible is false, existing earned replay still works
  assert(
    canStartCompletionCinematic({
      ...baseContext,
      hasPlayed: true,
      isReplay: true,
      completionEligible: false,
    }) === true,
    "Test 2.3: Replay remains available even if CMS catalog changed completionEligible to false"
  );

  console.log("✓ Test 2 Passed: Auto-play once and earned replay semantics verified");

  // -------------------------------------------------------------
  // Test 3: Local Storage Service (completionCinematicStorage)
  // -------------------------------------------------------------
  completionCinematicStorage.reset();
  const initial = completionCinematicStorage.load();
  assert(initial.hasPlayed === false, "Test 3.1: Fresh visitor hasPlayed is false");

  const played = completionCinematicStorage.markPlayed();
  assert(played.hasPlayed === true, "Test 3.2: markPlayed sets hasPlayed to true");
  assert(typeof played.firstPlayedAt === "string", "Test 3.3: firstPlayedAt timestamp recorded");

  const replay = completionCinematicStorage.recordReplay();
  assert(replay.firstPlayedAt === played.firstPlayedAt, "Test 3.4: Replay preserves original firstPlayedAt");
  assert(typeof replay.lastReplayAt === "string", "Test 3.5: Replay records lastReplayAt");

  // Corrupted / malformed JSON recovery
  window.localStorage.setItem("shaivi-completion-cinematic-v1", "{bad json: invalid");
  const fallback = completionCinematicStorage.load();
  assert(fallback.hasPlayed === false, "Test 3.6: Corrupted localStorage gracefully falls back to default");

  completionCinematicStorage.reset();
  console.log("✓ Test 3 Passed: Storage service persistence and corruption resilience verified");

  // -------------------------------------------------------------
  // Test 4: Responsive Cinematic Camera Math (fitCinematicCamera)
  // -------------------------------------------------------------
  const desktopFit = fitCinematicCamera(1920, 1080);
  assert(Number.isFinite(desktopFit.position.x), "Test 4.1: Desktop position.x is finite");
  assert(Number.isFinite(desktopFit.position.y), "Test 4.2: Desktop position.y is finite");
  assert(Number.isFinite(desktopFit.position.z), "Test 4.3: Desktop position.z is finite");
  assert(desktopFit.fov === 38, "Test 4.4: Desktop base fov is 38");

  const mobileSizes = [
    { w: 320, h: 568 },
    { w: 360, h: 780 },
    { w: 390, h: 844 },
    { w: 430, h: 932 },
  ];

  mobileSizes.forEach(({ w, h }) => {
    const mobileFit = fitCinematicCamera(w, h);
    assert(Number.isFinite(mobileFit.position.x), `Test 4.5: Mobile ${w}x${h} position.x is finite`);
    assert(Number.isFinite(mobileFit.position.y), `Test 4.6: Mobile ${w}x${h} position.y is finite`);
    assert(Number.isFinite(mobileFit.position.z), `Test 4.7: Mobile ${w}x${h} position.z is finite`);
    assert(mobileFit.target.y === 0.55, `Test 4.8: Mobile ${w}x${h} target.y offsets island into upper viewport`);
    assert(mobileFit.fov === 44, `Test 4.9: Mobile ${w}x${h} fov expands to 44 for comfortable padding`);
  });

  console.log("✓ Test 4 Passed: Responsive camera framing calculations verified across desktop and mobile");

  // -------------------------------------------------------------
  // Test 5: Camera Lock Handshake & State Machine
  // -------------------------------------------------------------
  useExperienceStore.setState({
    mode: "WORLD",
    transitioning: false,
    secretOpen: false,
  });
  useCollectibleStore.setState({
    bookOpen: false,
  });
  useCameraNavigationStore.setState({
    isCinematicActive: false,
  });

  assert(canNavigateWorld() === true, "Test 5.1: Initial canNavigateWorld is true");

  // Start cinematic
  useCompletionCinematicStore.getState().startCinematic(false);
  assert(
    useCompletionCinematicStore.getState().stage === "PREPARING",
    "Test 5.2: Starting cinematic enters PREPARING stage"
  );
  assert(
    useCameraNavigationStore.getState().isCinematicActive === true,
    "Test 5.3: isCinematicActive set to true"
  );
  assert(
    canNavigateWorld() === false,
    "Test 5.4: canNavigateWorld returns false during cinematic"
  );

  // Transition to MESSAGE stage
  useCompletionCinematicStore.getState().setStage("MESSAGE");
  assert(
    useCompletionCinematicStore.getState().hasPlayed === true,
    "Test 5.5: hasPlayed marked when MESSAGE stage is reached"
  );

  // Skip cinematic
  useCompletionCinematicStore.getState().skipCinematic();
  assert(
    useCompletionCinematicStore.getState().stage === "RETURNING",
    "Test 5.6: Skipping cinematic moves to RETURNING stage"
  );

  // Finish cinematic
  useCompletionCinematicStore.getState().finishCinematic();
  assert(
    useCompletionCinematicStore.getState().stage === "IDLE",
    "Test 5.7: finishCinematic restores IDLE stage"
  );
  assert(
    useCameraNavigationStore.getState().isCinematicActive === false,
    "Test 5.8: isCinematicActive restored to false"
  );
  assert(
    canNavigateWorld() === true,
    "Test 5.9: canNavigateWorld restored to true after cinematic"
  );

  console.log("✓ Test 5 Passed: Camera lock handshake and state machine transitions verified");

  console.log("\nAll Phase 11 Completion Cinematic Unit Tests Passed! ✦");
}

runTests();

