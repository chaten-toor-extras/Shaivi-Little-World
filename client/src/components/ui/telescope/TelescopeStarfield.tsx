"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import {
  generateDecorativeStars,
  getDiffractionSpikeTexture,
  getStarGlowTexture,
  normalizedToWorld,
  type NormalizedStarCoord,
} from "./telescopeUtils";

interface TelescopeStarfieldProps {
  milestoneCoords: (NormalizedStarCoord & { originalIndex: number })[];
  activeIndex: number;
  hoveredIndex: number | null;
  onSelectStar: (index: number) => void;
  onHoverStar: (index: number | null) => void;
  quality?: "low" | "medium" | "high";
  reducedMotion?: boolean;
  isMobile?: boolean;
}

// Deep background cosmic nebula dust clouds for atmospheric depth
function CosmicNebulaClouds() {
  const nebulaGlow = useMemo(() => getStarGlowTexture(), []);

  const clouds = useMemo(
    () => [
      { pos: [-6, 3, -13], scale: 14, color: "#361a5e", opacity: 0.18 },
      { pos: [7, -2, -14], scale: 16, color: "#183058", opacity: 0.16 },
      { pos: [0, 4, -12], scale: 12, color: "#451f4d", opacity: 0.14 },
      { pos: [-4, -4, -13], scale: 13, color: "#1c2a4f", opacity: 0.15 },
    ],
    [],
  );

  return (
    <group>
      {clouds.map((c, i) => (
        <sprite
          key={i}
          position={c.pos as [number, number, number]}
          scale={[c.scale, c.scale, 1]}
        >
          <spriteMaterial
            map={nebulaGlow}
            color={c.color}
            transparent
            opacity={c.opacity}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </sprite>
      ))}
    </group>
  );
}

// Procedural decorative stars with authentic stellar color temperatures & twinkling
function RealisticDecorativeStars({
  quality = "medium",
  reducedMotion = false,
}: {
  quality?: "low" | "medium" | "high";
  reducedMotion?: boolean;
}) {
  const count = quality === "low" ? 220 : quality === "high" ? 700 : 420;
  const matRef = useRef<THREE.PointsMaterial>(null);
  const glowTexture = useMemo(() => getStarGlowTexture(), []);

  const { positions, colors } = useMemo(
    () => generateDecorativeStars(count),
    [count],
  );

  const baseOpacity = useRef(0.85);

  useFrame(({ clock }) => {
    if (!matRef.current || reducedMotion) return;
    const t = clock.elapsedTime;
    matRef.current.opacity =
      baseOpacity.current + Math.sin(t * 1.6) * 0.08 + Math.cos(t * 2.7) * 0.05;
  });

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={matRef}
        map={glowTexture}
        size={0.24}
        sizeAttenuation={true}
        vertexColors={true}
        transparent
        opacity={0.88}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Prominent signature stars with 4-point telescope optical diffraction spikes
function DiffractionSignatureStars({
  reducedMotion = false,
}: {
  reducedMotion?: boolean;
}) {
  const spikeTexture = useMemo(() => getDiffractionSpikeTexture(), []);

  const signatureStars = useMemo(
    () => [
      {
        pos: [-8.5, 4.2, -6.5],
        scale: 1.1,
        color: "#d2e4ff",
        speed: 1.1,
        phase: 0.3,
      },
      {
        pos: [9.2, 3.8, -7.0],
        scale: 0.95,
        color: "#ffe7c4",
        speed: 1.4,
        phase: 1.8,
      },
      {
        pos: [-4.2, -4.8, -5.8],
        scale: 1.25,
        color: "#ffffff",
        speed: 0.9,
        phase: 3.2,
      },
      {
        pos: [6.8, -4.2, -6.2],
        scale: 1.05,
        color: "#ffd4b8",
        speed: 1.3,
        phase: 4.5,
      },
      {
        pos: [-11.0, -1.5, -7.5],
        scale: 0.85,
        color: "#c8dbff",
        speed: 1.6,
        phase: 2.1,
      },
      {
        pos: [11.5, 1.2, -7.2],
        scale: 0.9,
        color: "#e8dcff",
        speed: 1.2,
        phase: 5.4,
      },
      {
        pos: [1.5, 5.5, -6.8],
        scale: 1.0,
        color: "#fff0db",
        speed: 1.5,
        phase: 0.9,
      },
      {
        pos: [-2.0, -5.5, -6.0],
        scale: 0.8,
        color: "#dbe8ff",
        speed: 1.7,
        phase: 3.7,
      },
    ],
    [],
  );

  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current || reducedMotion) return;
    const t = clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      const star = signatureStars[i];
      if (!star) return;
      const pulse = 1.0 + Math.sin(t * star.speed + star.phase) * 0.14;
      child.scale.set(star.scale * pulse, star.scale * pulse, 1);
    });
  });

  return (
    <group ref={groupRef}>
      {signatureStars.map((star, i) => (
        <sprite
          key={i}
          position={star.pos as [number, number, number]}
          scale={[star.scale, star.scale, 1]}
        >
          <spriteMaterial
            map={spikeTexture}
            color={star.color}
            transparent
            opacity={0.88}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </sprite>
      ))}
    </group>
  );
}

// Glowing constellation path connecting milestones
function ConstellationPath({
  coords,
  reducedMotion = false,
}: {
  coords: (NormalizedStarCoord & { originalIndex: number })[];
  reducedMotion?: boolean;
}) {
  const lineRef = useRef<THREE.Line>(null);
  const opacityRef = useRef(reducedMotion ? 0.5 : 0);

  const geometry = useMemo(() => {
    if (coords.length < 2) return null;
    const sorted = [...coords].sort((a, b) => a.order - b.order);
    const points = sorted.map((c) => {
      const [x, y, z] = normalizedToWorld(c.x, c.y, c.depth);
      return new THREE.Vector3(x, y, z);
    });
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [coords]);

  const lineObj = useMemo(() => {
    if (!geometry) return null;
    const mat = new THREE.LineBasicMaterial({
      color: "#d0c0fa",
      transparent: true,
      opacity: reducedMotion ? 0.5 : 0,
      depthWrite: false,
    });
    return new THREE.Line(geometry, mat);
  }, [geometry, reducedMotion]);

  useFrame((_, dt) => {
    if (!lineRef.current) return;
    const mat = lineRef.current.material as THREE.LineBasicMaterial;
    if (opacityRef.current < 0.5) {
      opacityRef.current = Math.min(0.5, opacityRef.current + dt * 0.6);
      mat.opacity = opacityRef.current;
    }
  });

  if (!lineObj) return null;

  return <primitive ref={lineRef} object={lineObj} />;
}

// Single interactive milestone star with generous invisible touch hit target
function InteractiveMilestoneStar({
  coord,
  isActive,
  isHovered,
  onSelect,
  onHover,
  reducedMotion = false,
}: {
  coord: NormalizedStarCoord & { originalIndex: number };
  isActive: boolean;
  isHovered: boolean;
  onSelect: () => void;
  onHover: (hovered: boolean) => void;
  reducedMotion?: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const haloRef = useRef<THREE.Sprite>(null);
  const flareRef = useRef<THREE.Sprite>(null);
  const stardustRef = useRef<THREE.Points>(null);
  const pointerDownPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const glowTexture = useMemo(() => getStarGlowTexture(), []);
  const spikeTexture = useMemo(() => getDiffractionSpikeTexture(), []);

  const [worldX, worldY, worldZ] = useMemo(
    () => normalizedToWorld(coord.x, coord.y, coord.depth),
    [coord.x, coord.y, coord.depth],
  );

  // Delicate stardust particle coordinates orbiting the active star
  const stardustPositions = useMemo(() => {
    const count = 8;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 0.44 + (i % 3) * 0.08;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = Math.sin(angle) * radius * 0.55;
      pos[i * 3 + 2] = i % 2 === 0 ? 0.06 : -0.06;
    }
    return pos;
  }, []);

  const baseScale =
    coord.size === "featured" ? 1.25 : coord.size === "small" ? 0.8 : 1.0;
  const glowColor = coord.glowColor || "#C9B7E8";

  useFrame(({ clock }, dt) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;

    let targetScale = baseScale;
    if (isActive) {
      const pulse = reducedMotion ? 1.25 : 1.25 + Math.sin(t * 2.8) * 0.07;
      targetScale = baseScale * pulse;
    } else if (isHovered) {
      targetScale = baseScale * 1.18;
    }

    groupRef.current.scale.setScalar(
      THREE.MathUtils.damp(groupRef.current.scale.x, targetScale, 6, dt),
    );

    if (flareRef.current && !reducedMotion) {
      flareRef.current.material.rotation = Math.sin(t * 0.4) * 0.06;
      const targetFlareOpacity = isActive ? 0.95 : isHovered ? 0.75 : 0.45;
      flareRef.current.material.opacity = THREE.MathUtils.damp(
        flareRef.current.material.opacity,
        targetFlareOpacity,
        5,
        dt,
      );
    }

    if (haloRef.current) {
      const targetHaloOpacity = isActive ? 0.85 : isHovered ? 0.6 : 0.35;
      haloRef.current.material.opacity = THREE.MathUtils.damp(
        haloRef.current.material.opacity,
        targetHaloOpacity,
        5,
        dt,
      );
    }

    if (stardustRef.current && !reducedMotion) {
      stardustRef.current.rotation.z += dt * 0.45;
    }
  });

  const handlePointerDown = (e: {
    clientX: number;
    clientY: number;
    stopPropagation: () => void;
  }) => {
    e.stopPropagation();
    pointerDownPos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: {
    clientX: number;
    clientY: number;
    stopPropagation: () => void;
  }) => {
    e.stopPropagation();
    const dist = Math.hypot(
      e.clientX - pointerDownPos.current.x,
      e.clientY - pointerDownPos.current.y,
    );
    // Only select if not dragged (clean tap/click)
    if (dist < 10) {
      onSelect();
    }
  };

  return (
    <group ref={groupRef} position={[worldX, worldY, worldZ]}>
      {/* Invisible generous hit area (radius 1.35) for effortless touch/click registration */}
      <mesh
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(true);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          onHover(false);
        }}
      >
        <sphereGeometry args={[1.35, 12, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Incandescent white core point */}
      <mesh>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Radiant inner starlight core sprite */}
      <sprite scale={[0.5, 0.5, 1]}>
        <spriteMaterial
          map={glowTexture}
          color="#ffffff"
          transparent
          opacity={0.95}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>

      {/* Soft colored starlight halo */}
      <sprite
        ref={haloRef}
        scale={[isActive ? 2.2 : 1.4, isActive ? 2.2 : 1.4, 1]}
      >
        <spriteMaterial
          map={glowTexture}
          color={glowColor}
          transparent
          opacity={isActive ? 0.85 : 0.35}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>

      {/* 4-point optical diamond starlight diffraction flare */}
      <sprite
        ref={flareRef}
        scale={[isActive ? 2.8 : 1.6, isActive ? 2.8 : 1.6, 1]}
      >
        <spriteMaterial
          map={spikeTexture}
          color={glowColor}
          transparent
          opacity={isActive ? 0.95 : 0.45}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>

      {/* Ethereal orbiting stardust sparkles (only for active star) */}
      {isActive && (
        <points ref={stardustRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[stardustPositions, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            map={glowTexture}
            size={0.18}
            sizeAttenuation={true}
            color="#ffffff"
            transparent
            opacity={0.88}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
      )}
    </group>
  );
}

export default function TelescopeStarfield({
  milestoneCoords,
  activeIndex,
  hoveredIndex,
  onSelectStar,
  onHoverStar,
  quality = "medium",
  reducedMotion = false,
  isMobile = false,
}: TelescopeStarfieldProps) {
  const celestialGroupRef = useRef<THREE.Group>(null);
  const { gl } = useThree();

  // Celestial Pan & Inertia Controller state
  const targetPan = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const currentPan = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Auto-center view on active star smoothly
  useEffect(() => {
    const activeCoord = milestoneCoords.find(
      (c) => c.originalIndex === activeIndex,
    );
    if (activeCoord) {
      const [worldX, worldY] = normalizedToWorld(
        activeCoord.x,
        activeCoord.y,
        activeCoord.depth,
      );
      // On mobile portrait, offset vertically so star floats above the bottom card
      const yOffset = isMobile ? 1.4 : 0;
      targetPan.current.x = -worldX;
      targetPan.current.y = -worldY + yOffset;
    }
  }, [activeIndex, milestoneCoords, isMobile]);

  // Touch & Mouse drag-to-pan listener
  useEffect(() => {
    const dom = gl.domElement;
    let isDown = false;
    let lastX = 0;
    let lastY = 0;

    const onPointerDown = (e: PointerEvent) => {
      isDown = true;
      lastX = e.clientX;
      lastY = e.clientY;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDown) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;

      // Sensitivity factor: 0.022 provides very responsive and natural panning on mobile
      const sensitivity = isMobile ? 0.022 : 0.018;
      targetPan.current.x = Math.max(
        -8.5,
        Math.min(8.5, targetPan.current.x + dx * sensitivity),
      );
      targetPan.current.y = Math.max(
        -5.5,
        Math.min(5.5, targetPan.current.y - dy * sensitivity),
      );
    };

    const onPointerUp = () => {
      isDown = false;
    };

    dom.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    window.addEventListener("pointercancel", onPointerUp, { passive: true });

    return () => {
      dom.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
  }, [gl, isMobile]);

  // Smooth frame loop updating celestial group position and gentle mouse tilt
  useFrame(({ pointer }, dt) => {
    if (!celestialGroupRef.current) return;

    // Smooth inertia interpolation towards target pan
    currentPan.current.x = THREE.MathUtils.damp(
      currentPan.current.x,
      targetPan.current.x,
      5,
      dt,
    );
    currentPan.current.y = THREE.MathUtils.damp(
      currentPan.current.y,
      targetPan.current.y,
      5,
      dt,
    );

    celestialGroupRef.current.position.x = currentPan.current.x;
    celestialGroupRef.current.position.y = currentPan.current.y;

    // Subtle pointer parallax tilt on desktop
    if (!reducedMotion && !isMobile) {
      celestialGroupRef.current.rotation.y = THREE.MathUtils.damp(
        celestialGroupRef.current.rotation.y,
        -pointer.x * 0.05,
        3,
        dt,
      );
      celestialGroupRef.current.rotation.x = THREE.MathUtils.damp(
        celestialGroupRef.current.rotation.x,
        pointer.y * 0.04,
        3,
        dt,
      );
    }
  });

  return (
    <group ref={celestialGroupRef}>
      <CosmicNebulaClouds />
      <RealisticDecorativeStars
        quality={quality}
        reducedMotion={reducedMotion}
      />
      <DiffractionSignatureStars reducedMotion={reducedMotion} />
      <ConstellationPath
        coords={milestoneCoords}
        reducedMotion={reducedMotion}
      />

      {milestoneCoords.map((coord) => (
        <InteractiveMilestoneStar
          key={coord.originalIndex}
          coord={coord}
          isActive={activeIndex === coord.originalIndex}
          isHovered={hoveredIndex === coord.originalIndex}
          onSelect={() => onSelectStar(coord.originalIndex)}
          onHover={(hovered) =>
            onHoverStar(hovered ? coord.originalIndex : null)
          }
          reducedMotion={reducedMotion}
        />
      ))}
    </group>
  );
}
