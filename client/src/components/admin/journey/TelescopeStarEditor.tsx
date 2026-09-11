"use client";

import styles from "@/app/admin/journey/JourneyTelescopeEditor.module.css";
import { checkStarCollision } from "@/components/ui/telescope/telescopeUtils";
import type { JourneyMilestone } from "@/types";
import { WarningOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useCallback, useMemo, useRef, useState } from "react";

interface TelescopeStarEditorProps {
  value?: { x?: number; y?: number };
  onChange?: (val: { x: number; y: number }) => void;
  otherMilestones: JourneyMilestone[];
  currentId?: string;
  currentYear?: string;
  onAutoArrange?: () => void;
}

export default function TelescopeStarEditor({
  value,
  onChange,
  otherMilestones,
  currentId,
  currentYear = "Now",
  onAutoArrange,
}: TelescopeStarEditorProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const posX =
    typeof value?.x === "number" ? Math.max(5, Math.min(95, value.x)) : 50;
  const posY =
    typeof value?.y === "number" ? Math.max(5, Math.min(95, value.y)) : 50;

  // Filter out the milestone currently being edited from other stars
  const peerStars = useMemo(() => {
    return otherMilestones.filter((m) => m._id !== currentId);
  }, [otherMilestones, currentId]);

  // Check collision with any peer star (< 8% distance)
  const hasCollision = useMemo(() => {
    return peerStars.some((m) => {
      const px = m.telescope?.x ?? m.desktopPosition?.x ?? 50;
      const py = m.telescope?.y ?? m.desktopPosition?.y ?? 50;
      return checkStarCollision({ x: posX, y: posY }, { x: px, y: py }, 8);
    });
  }, [peerStars, posX, posY]);

  // Constellation SVG path
  const svgPath = useMemo(() => {
    const all = [
      ...peerStars.map((m) => ({
        x: m.telescope?.x ?? m.desktopPosition?.x ?? 50,
        y: m.telescope?.y ?? m.desktopPosition?.y ?? 50,
        order: m.telescope?.constellationOrder ?? m.order ?? 0,
      })),
      { x: posX, y: posY, order: 999 },
    ].sort((a, b) => a.order - b.order);

    if (all.length < 2) return "";
    return all.reduce(
      (acc, pt, i) => `${acc} ${i === 0 ? "M" : "L"} ${pt.x} ${pt.y}`,
      "",
    );
  }, [peerStars, posX, posY]);

  const updateFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      if (!boxRef.current || !onChange) return;
      const rect = boxRef.current.getBoundingClientRect();
      const rawX = ((clientX - rect.left) / rect.width) * 100;
      const rawY = ((clientY - rect.top) / rect.height) * 100;

      const clampedX = Math.round(Math.max(6, Math.min(94, rawX)));
      const clampedY = Math.round(Math.max(8, Math.min(92, rawY)));

      onChange({ x: clampedX, y: clampedY });
    },
    [onChange],
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    updateFromPointer(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    updateFromPointer(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
  };

  return (
    <div className={styles.editorWrapper}>
      <div className={styles.editorHeader}>
        <span className={styles.editorTitle}>Constellation Sky Placement</span>
        {onAutoArrange && (
          <Button size="small" onClick={onAutoArrange} style={{ fontSize: 11 }}>
            Auto Arrange All Stars
          </Button>
        )}
      </div>

      <div
        ref={boxRef}
        className={styles.skyBox}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Constellation line preview */}
        {svgPath && (
          <svg
            className={styles.constellationSvg}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path d={svgPath} className={styles.constellationPath} />
          </svg>
        )}

        {/* Peer milestone stars */}
        {peerStars.map((m) => {
          const sx = m.telescope?.x ?? m.desktopPosition?.x ?? 50;
          const sy = m.telescope?.y ?? m.desktopPosition?.y ?? 50;
          return (
            <div
              key={m._id}
              className={styles.passiveStar}
              style={{ left: `${sx}%`, top: `${sy}%` }}
            >
              <span className={styles.passiveLabel}>{m.year || "✦"}</span>
            </div>
          );
        })}

        {/* Active draggable star */}
        <div
          className={styles.activeDraggableStar}
          style={{ left: `${posX}%`, top: `${posY}%` }}
        >
          <div className={styles.activeStarCore} />
          <span className={styles.activeStarLabel}>{currentYear} ★</span>
        </div>
      </div>

      <div className={styles.coordDisplay}>
        <span>Drag the star or click anywhere in the sky to position.</span>
        <span>
          X: <b>{posX}%</b> · Y: <b>{posY}%</b>
        </span>
      </div>

      {hasCollision && (
        <div className={styles.collisionWarning}>
          <WarningOutlined />
          <span>
            This star is very close to another star and may overlap on mobile
            screens.
          </span>
        </div>
      )}
    </div>
  );
}
