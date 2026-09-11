"use client";

import { WorldSettingsOverrideContext } from "@/providers/ContentProvider";
import { useExperienceStore } from "@/store/useExperienceStore";
import type { TimeOfDayOverride, WorldSettings } from "@/types/world";
import {
  ClockCircleOutlined,
  MoonOutlined,
  SunOutlined,
} from "@ant-design/icons";
import { Canvas } from "@react-three/fiber";
import { Segmented } from "antd";
import dynamic from "next/dynamic";
import { Component, Suspense, type ReactNode } from "react";

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

export default function WorldPreviewCanvas({
  settings,
}: {
  settings: WorldSettings;
}) {
  const timeOfDayOverride = useExperienceStore((s) => s.timeOfDayOverride);
  const setTimeOfDayOverride = useExperienceStore(
    (s) => s.setTimeOfDayOverride,
  );

  return (
    <WorldSettingsOverrideContext.Provider value={settings}>
      <div
        style={{
          width: "100%",
          height: "100%",
          minHeight: "420px",
          position: "relative",
          borderRadius: "12px",
          overflow: "hidden",
          background: settings.scene?.backgroundColor || "#d5cbdc",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 10,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 10,
            background: "rgba(255, 255, 255, 0.88)",
            backdropFilter: "blur(10px)",
            padding: "3px 6px",
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.12)",
          }}
        >
          <Segmented<TimeOfDayOverride>
            size="small"
            value={timeOfDayOverride}
            onChange={(val) => setTimeOfDayOverride(val)}
            options={[
              {
                label: (
                  <span>
                    <ClockCircleOutlined /> Auto
                  </span>
                ),
                value: "AUTO",
              },
              {
                label: (
                  <span>
                    <SunOutlined style={{ color: "#fa8c16" }} /> Dawn
                  </span>
                ),
                value: "MORNING",
              },
              {
                label: (
                  <span>
                    <SunOutlined style={{ color: "#fadb14" }} /> Day
                  </span>
                ),
                value: "DAY",
              },
              {
                label: (
                  <span>
                    <SunOutlined style={{ color: "#d4380d" }} /> Sunset
                  </span>
                ),
                value: "SUNSET",
              },
              {
                label: (
                  <span>
                    <MoonOutlined style={{ color: "#1677ff" }} /> Night
                  </span>
                ),
                value: "NIGHT",
              },
            ]}
          />
        </div>
        <PreviewBoundary>
          <Canvas
            shadows="percentage"
            dpr={1.2}
            camera={{ position: [11, 11, 18], fov: 40 }}
            gl={{ antialias: true, powerPreference: "default" }}
          >
            <Suspense fallback={null}>
              <World onReady={() => {}} />
            </Suspense>
          </Canvas>
        </PreviewBoundary>
      </div>
    </WorldSettingsOverrideContext.Provider>
  );
}
