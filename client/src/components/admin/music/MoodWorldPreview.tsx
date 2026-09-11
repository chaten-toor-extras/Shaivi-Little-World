"use client";

import {
  MusicOverrideContext,
  WorldSettingsOverrideContext,
  useWorldSettings,
} from "@/providers/ContentProvider";
import { useExperienceStore } from "@/store/useExperienceStore";
import { useMusicStore } from "@/store/useMusicStore";
import type { Mood } from "@/types";
import type { TimeOfDay, WorldSettings } from "@/types/world";
import { Canvas } from "@react-three/fiber";
import { Segmented, Switch, Typography } from "antd";
import dynamic from "next/dynamic";
import { Component, useEffect, useMemo, useState, type ReactNode } from "react";

const World = dynamic(() => import("@/components/experience/World"), {
  ssr: false,
});

class PreviewBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed) {
      return (
        <div
          style={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#8a7f8e",
            padding: "24px",
            textAlign: "center",
          }}
        >
          Preview unavailable with current settings.
        </div>
      );
    }
    return this.props.children;
  }
}

interface MoodWorldPreviewProps {
  mood: Partial<Mood>;
  worldSettings?: WorldSettings;
}

export default function MoodWorldPreview({
  mood,
  worldSettings,
}: MoodWorldPreviewProps) {
  const currentWorldSettings = useWorldSettings();
  const settings = worldSettings || currentWorldSettings;

  const [previewTime, setPreviewTime] = useState<TimeOfDay>("DAY");
  const [effectEnabled, setEffectEnabled] = useState(true);

  const setTimeOfDayOverride = useExperienceStore(
    (s) => s.setTimeOfDayOverride,
  );

  useEffect(() => {
    setTimeOfDayOverride(previewTime);
  }, [previewTime, setTimeOfDayOverride]);

  const previewMoodId = mood._id ? String(mood._id) : "preview-mood-admin";

  const previewMood: Mood = useMemo(
    () => ({
      _id: previewMoodId,
      name: mood.name || "Preview Mood",
      slug: mood.slug || "preview",
      paperColor: mood.paperColor || "#d7ddc5",
      inkColor: mood.inkColor || "#354537",
      songIds: mood.songIds || [],
      order: mood.order ?? 0,
      isPublished: mood.isPublished ?? true,
      worldEffect: {
        enabled: effectEnabled && (mood.worldEffect?.enabled ?? true),
        intensity: mood.worldEffect?.intensity ?? 0.8,
        scene: mood.worldEffect?.scene,
        lighting: mood.worldEffect?.lighting,
        atmosphere: mood.worldEffect?.atmosphere,
        environment: mood.worldEffect?.environment,
        motion: mood.worldEffect?.motion,
      },
    }),
    [mood, previewMoodId, effectEnabled],
  );

  useEffect(() => {
    useMusicStore.getState().selectMood(previewMoodId);
    useMusicStore.getState().setWorldMoodActivated(effectEnabled);
    useMusicStore.getState().setWorldMoodEffectsEnabled(true);
  }, [previewMoodId, effectEnabled]);

  return (
    <WorldSettingsOverrideContext.Provider value={settings}>
      <MusicOverrideContext.Provider value={{ moods: [previewMood] }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            minHeight: "460px",
            background: "#18141c",
            borderRadius: "10px",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* Controls toolbar */}
          <div
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              right: 10,
              zIndex: 10,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "8px",
              background: "rgba(255, 255, 255, 0.92)",
              backdropFilter: "blur(12px)",
              padding: "6px 12px",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                flexWrap: "wrap",
              }}
            >
              <Typography.Text strong style={{ fontSize: "11px" }}>
                Time:
              </Typography.Text>
              <Segmented<TimeOfDay>
                size="small"
                value={previewTime}
                onChange={(val) => setPreviewTime(val)}
                options={[
                  { label: "🌅 Dawn", value: "MORNING" },
                  { label: "☀️ Day", value: "DAY" },
                  { label: "🌇 Sunset", value: "SUNSET" },
                  { label: "🌙 Night", value: "NIGHT" },
                ]}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Typography.Text style={{ fontSize: "11px" }}>
                Effect:
              </Typography.Text>
              <Switch
                size="small"
                checked={effectEnabled}
                onChange={setEffectEnabled}
                checkedChildren="ON"
                unCheckedChildren="OFF"
              />
            </div>
          </div>

          <PreviewBoundary>
            <Canvas
              shadows="percentage"
              dpr={1.2}
              camera={{ position: [11, 11, 18], fov: 40 }}
              gl={{ antialias: true, powerPreference: "default" }}
              style={{
                width: "100%",
                height: "100%",
                minHeight: "clamp(260px, 45vh, 460px)",
              }}
            >
              <World onReady={() => {}} />
            </Canvas>
          </PreviewBoundary>
        </div>
      </MusicOverrideContext.Provider>
    </WorldSettingsOverrideContext.Provider>
  );
}
