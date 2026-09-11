"use client";

import { Canvas } from "@react-three/fiber";
import TelescopeStarfield from "./TelescopeStarfield";
import type { NormalizedStarCoord } from "./telescopeUtils";

interface TelescopeCanvasProps {
  milestoneCoords: (NormalizedStarCoord & { originalIndex: number })[];
  activeIndex: number;
  hoveredIndex: number | null;
  onSelectStar: (index: number) => void;
  onHoverStar: (index: number | null) => void;
  quality?: "low" | "medium" | "high";
  reducedMotion?: boolean;
  isMobile?: boolean;
}

export default function TelescopeCanvas({
  milestoneCoords,
  activeIndex,
  hoveredIndex,
  onSelectStar,
  onHoverStar,
  quality = "medium",
  reducedMotion = false,
  isMobile = false,
}: TelescopeCanvasProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 50 }}
      gl={{
        antialias: quality !== "low",
        alpha: true,
        powerPreference: "high-performance",
        depth: true,
      }}
      dpr={quality === "low" ? 1 : [1, 2]}
      style={{ width: "100%", height: "100%" }}
    >
      <TelescopeStarfield
        milestoneCoords={milestoneCoords}
        activeIndex={activeIndex}
        hoveredIndex={hoveredIndex}
        onSelectStar={onSelectStar}
        onHoverStar={onHoverStar}
        quality={quality}
        reducedMotion={reducedMotion}
        isMobile={isMobile}
      />
    </Canvas>
  );
}
