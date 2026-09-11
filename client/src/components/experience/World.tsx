import { useTimeOfDay } from "@/hooks/useTimeOfDay";
import {
  useMusic,
  useSiteSettings,
  useWorldSettings,
} from "@/providers/ContentProvider";
import { useExperienceStore } from "@/store/useExperienceStore";
import { useMusicStore } from "@/store/useMusicStore";
import { resolveWorldTheme } from "@/utils/timeOfDay";
import { OrbitControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Group } from "three";
import Clouds from "../world/Clouds";
import FlyingPage from "../world/FlyingPage";
import Island from "../world/Island";
import Moon from "../world/Moon";
import {
  ArtWall,
  Desk,
  House,
  Mailbox,
  RecordPlayer,
  Telescope,
} from "../world/Objects";
import Stars from "../world/Stars";
import WorldDetails from "../world/WorldDetails";
import CameraRig from "./CameraRig";
import WorldAtmosphere from "./WorldAtmosphere";

export default function World({ onReady }: { onReady: () => void }) {
  const site = useSiteSettings();
  const worldSettings = useWorldSettings();
  const firstFrame = useRef(false);
  const { mode, transitioning, quality, reducedMotion } = useExperienceStore();
  const floating = useRef<Group>(null);

  const { effectivePeriod, transition, dayNight } = useTimeOfDay();
  const { moods } = useMusic();
  const activeMoodId = useMusicStore((s) => s.activeMoodId);
  const worldMoodActivated = useMusicStore((s) => s.worldMoodActivated);
  const worldMoodEffectsEnabled = useMusicStore(
    (s) => s.worldMoodEffectsEnabled,
  );

  const activeMood = useMemo(() => {
    if (!activeMoodId) return null;
    return moods.find((m) => String(m._id) === String(activeMoodId)) || null;
  }, [moods, activeMoodId]);

  const resolvedTheme = useMemo(
    () =>
      resolveWorldTheme({
        base: worldSettings,
        dayNight,
        period: effectivePeriod,
        quality,
        reducedMotion,
        mood: activeMood,
        worldMoodActivated: worldMoodActivated && worldMoodEffectsEnabled,
        adminMoodEnabled: worldSettings.musicMood?.enabled ?? true,
      }),
    [
      worldSettings,
      dayNight,
      effectivePeriod,
      quality,
      reducedMotion,
      activeMood,
      worldMoodActivated,
      worldMoodEffectsEnabled,
    ],
  );

  const lighting = worldSettings.lighting;
  const motion = worldSettings.motion;
  const interactions = worldSettings.interactions;
  const cameraSettings = worldSettings.camera;

  const floatActive =
    (motion?.islandFloatEnabled ?? true) && mode === "WORLD" && !reducedMotion;

  const motionMult = resolvedTheme.motionSpeedMultiplier;
  const floatSpeed = (motion?.islandFloatSpeed ?? 0.5) * motionMult;
  const floatStrength = motion?.islandFloatStrength ?? 0.07;
  const driftSpeed = (motion?.islandRotationDrift ?? 0.01) * motionMult;

  const requiredClicks = interactions?.butterflySecret?.requiredClicks ?? 3;
  const butterflyColor =
    interactions?.butterflySecret?.butterflyColor || "#f6ebd8";

  useFrame(({ clock }) => {
    if (!firstFrame.current) {
      firstFrame.current = true;
      onReady();
    }
    if (floating.current) {
      floating.current.position.y = floatActive
        ? Math.sin(clock.elapsedTime * floatSpeed) * floatStrength
        : 0;
      floating.current.rotation.y = floatActive
        ? Math.sin(clock.elapsedTime * 0.17 * motionMult) * driftSpeed
        : 0;
    }
  });

  const shadowLevel = lighting?.shadowLevel || "BALANCED";
  const canCastShadow =
    (lighting?.directional?.castShadow ?? true) &&
    shadowLevel !== "OFF" &&
    quality !== "LOW";

  return (
    <>
      <WorldAtmosphere
        theme={resolvedTheme}
        transitionDuration={
          transition.enabled === false
            ? 0
            : resolvedTheme.transitionDuration || transition.durationSeconds
        }
        shadowLevel={shadowLevel}
        directionalCastShadow={canCastShadow}
      />

      <Stars
        enabled={resolvedTheme.stars.enabled}
        count={resolvedTheme.stars.count}
        brightness={resolvedTheme.stars.brightness}
        twinkle={resolvedTheme.stars.twinkle}
      />

      <Moon
        enabled={resolvedTheme.moon.enabled}
        color={resolvedTheme.moon.color}
        brightness={resolvedTheme.moon.brightness}
        scale={resolvedTheme.moon.scale}
      />

      <group ref={floating}>
        <Island theme={resolvedTheme} />
        <Clouds theme={resolvedTheme} />
        <House theme={resolvedTheme} />
        <Desk />
        <ArtWall />
        <Telescope />
        <Mailbox />
        <RecordPlayer />
        <WorldDetails theme={resolvedTheme} />

        {(interactions?.butterflySecret?.enabled ?? true) && (
          <FlyingPage color={butterflyColor} requiredClicks={requiredClicks} />
        )}
      </group>

      <CameraRig />

      {mode === "WORLD" &&
        !transitioning &&
        (cameraSettings?.orbitEnabled ?? true) && (
          <OrbitControls
            target={[0, 0.85, 0]}
            enablePan={false}
            enableZoom={false}
            minPolarAngle={0.65}
            maxPolarAngle={1.15}
            minAzimuthAngle={0.25}
            maxAzimuthAngle={0.85}
            rotateSpeed={cameraSettings?.orbitSpeed ?? 0.3}
          />
        )}
    </>
  );
}
