"use client";

import type { CollectibleModelKey } from "@/types";
import React, { useMemo } from "react";
import * as THREE from "three";

export interface ModelRegistryEntry {
  key: CollectibleModelKey;
  name: string;
  categoryName: string;
  description: string;
  render: (props: { glowColor?: string; accentColor?: string }) => React.ReactElement;
}

// ── 1. Tiny Star ─────────────────────────────────────────────
function TinyStarModel({ glowColor = "#ffe8b2", accentColor = "#f7d070" }: { glowColor?: string; accentColor?: string }) {
  const starGeo = useMemo(() => {
    const shape = new THREE.Shape();
    const points = 5;
    const outerRadius = 0.18;
    const innerRadius = 0.085;

    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();

    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.04,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.015,
      bevelSegments: 1,
    });
  }, []);

  return (
    <group>
      <mesh geometry={starGeo} castShadow receiveShadow>
        <meshStandardMaterial
          color={accentColor}
          emissive={glowColor}
          emissiveIntensity={0.35}
          roughness={0.3}
          metalness={0.2}
        />
      </mesh>
    </group>
  );
}

// ── 2. Pressed Wildflower ────────────────────────────────────
function PressedFlowerModel({ glowColor = "#ffd4dc", accentColor = "#e8899e" }: { glowColor?: string; accentColor?: string }) {
  return (
    <group>
      {/* Tiny Stem */}
      <mesh position={[0, -0.12, -0.01]} rotation={[0, 0, 0.15]}>
        <cylinderGeometry args={[0.012, 0.012, 0.22, 8]} />
        <meshStandardMaterial color="#788b64" roughness={0.7} />
      </mesh>
      {/* 5 Soft Petals */}
      {Array.from({ length: 5 }, (_, i) => {
        const angle = (i * 2 * Math.PI) / 5;
        return (
          <group key={i} rotation={[0, 0, angle]}>
            <mesh position={[0, 0.09, 0]} scale={[0.065, 0.09, 0.018]}>
              <sphereGeometry args={[1, 12, 8]} />
              <meshStandardMaterial
                color={accentColor}
                emissive={glowColor}
                emissiveIntensity={0.2}
                roughness={0.5}
              />
            </mesh>
          </group>
        );
      })}
      {/* Golden Pistil Center */}
      <mesh position={[0, 0, 0.015]}>
        <sphereGeometry args={[0.04, 12, 8]} />
        <meshStandardMaterial color="#f0b64d" roughness={0.4} />
      </mesh>
    </group>
  );
}

// ── 3. Tiny Detail Brush ────────────────────────────────────
function PaintBrushModel({ glowColor = "#e0d2fc", accentColor = "#a682e6" }: { glowColor?: string; accentColor?: string }) {
  return (
    <group rotation={[0.4, 0.2, 0.6]}>
      {/* Wooden Handle */}
      <mesh position={[0, -0.08, 0]}>
        <cylinderGeometry args={[0.018, 0.01, 0.32, 8]} />
        <meshStandardMaterial color="#a27a56" roughness={0.6} />
      </mesh>
      {/* Metal Ferrule */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.07, 12]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Bristle Tip */}
      <mesh position={[0, 0.17, 0]} scale={[0.018, 0.07, 0.018]}>
        <coneGeometry args={[1, 1, 10]} />
        <meshStandardMaterial color="#40322a" roughness={0.8} />
      </mesh>
      {/* Paint Tip Accent */}
      <mesh position={[0, 0.195, 0]} scale={[0.012, 0.025, 0.012]}>
        <coneGeometry args={[1, 1, 8]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={glowColor}
          emissiveIntensity={0.4}
        />
      </mesh>
    </group>
  );
}

// ── 4. Paper Crane ──────────────────────────────────────────
function PaperCraneModel({ glowColor = "#fff2db", accentColor = "#d6b885" }: { glowColor?: string; accentColor?: string }) {
  return (
    <group scale={[0.85, 0.85, 0.85]}>
      {/* Center diamond body */}
      <mesh scale={[0.1, 0.08, 0.14]}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#f7eedc" roughness={0.7} />
      </mesh>
      {/* Left wing */}
      <mesh position={[-0.14, 0.06, 0]} rotation={[0.2, 0, 0.45]} scale={[0.16, 0.015, 0.1]}>
        <boxGeometry />
        <meshStandardMaterial color="#faefe0" roughness={0.7} />
      </mesh>
      {/* Right wing */}
      <mesh position={[0.14, 0.06, 0]} rotation={[0.2, 0, -0.45]} scale={[0.16, 0.015, 0.1]}>
        <boxGeometry />
        <meshStandardMaterial color="#faefe0" roughness={0.7} />
      </mesh>
      {/* Neck & Head */}
      <mesh position={[0, 0.1, 0.14]} rotation={[0.6, 0, 0]} scale={[0.02, 0.14, 0.02]}>
        <cylinderGeometry args={[1, 1, 1, 6]} />
        <meshStandardMaterial color="#faefe0" roughness={0.7} />
      </mesh>
      {/* Tail */}
      <mesh position={[0, 0.08, -0.14]} rotation={[-0.6, 0, 0]} scale={[0.02, 0.12, 0.02]}>
        <cylinderGeometry args={[1, 1, 1, 6]} />
        <meshStandardMaterial color="#faefe0" roughness={0.7} />
      </mesh>
    </group>
  );
}

// ── 5. Faded Polaroid ───────────────────────────────────────
function PolaroidModel({ glowColor = "#ffe5cf", accentColor = "#e39f78" }: { glowColor?: string; accentColor?: string }) {
  return (
    <group rotation={[0.1, 0.15, 0]}>
      {/* White Polaroid Card */}
      <mesh position={[0, 0, 0]} scale={[0.26, 0.32, 0.012]} castShadow receiveShadow>
        <boxGeometry />
        <meshStandardMaterial color="#f4efe6" roughness={0.8} />
      </mesh>
      {/* Photo Area */}
      <mesh position={[0, 0.035, 0.008]} scale={[0.21, 0.21, 0.005]}>
        <boxGeometry />
        <meshStandardMaterial
          color={accentColor}
          emissive={glowColor}
          emissiveIntensity={0.15}
          roughness={0.4}
        />
      </mesh>
      {/* Miniature painted sun inside photo */}
      <mesh position={[0.04, 0.08, 0.013]}>
        <circleGeometry args={[0.035, 16]} />
        <meshBasicMaterial color="#ffe899" />
      </mesh>
    </group>
  );
}

// ── 6. Moon Charm ───────────────────────────────────────────
function MoonCharmModel({ glowColor = "#d8eaf7", accentColor = "#88b5dc" }: { glowColor?: string; accentColor?: string }) {
  const moonGeo = useMemo(() => {
    const shape = new THREE.Shape();
    shape.absarc(0, 0, 0.18, -Math.PI * 0.45, Math.PI * 0.45, false);
    shape.absarc(0.06, 0, 0.15, Math.PI * 0.45, -Math.PI * 0.45, true);
    shape.closePath();

    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.03,
      bevelEnabled: true,
      bevelThickness: 0.015,
      bevelSize: 0.01,
      bevelSegments: 1,
    });
  }, []);

  return (
    <group position={[-0.05, 0, 0]}>
      <mesh geometry={moonGeo} castShadow receiveShadow>
        <meshStandardMaterial
          color={accentColor}
          emissive={glowColor}
          emissiveIntensity={0.3}
          metalness={0.5}
          roughness={0.35}
        />
      </mesh>
      {/* Small top suspension eyelet */}
      <mesh position={[0.04, 0.19, 0.015]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.02, 0.006, 8, 16]} />
        <meshStandardMaterial color="#c0cdd8" metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  );
}

// ── 7. Bronze Music Note ────────────────────────────────────
function MusicNoteModel({ glowColor = "#f5deb3", accentColor = "#c99e63" }: { glowColor?: string; accentColor?: string }) {
  return (
    <group position={[-0.04, -0.06, 0]} rotation={[0, 0, 0.1]}>
      {/* Tilted note head */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, -0.3]} scale={[0.07, 0.05, 0.035]}>
        <sphereGeometry args={[1, 16, 12]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={glowColor}
          emissiveIntensity={0.25}
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>
      {/* Vertical stem */}
      <mesh position={[0.055, 0.12, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.24, 8]} />
        <meshStandardMaterial
          color={accentColor}
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>
      {/* Curved flag */}
      <mesh position={[0.09, 0.21, 0]} rotation={[0, 0, 0.8]} scale={[0.05, 0.04, 0.015]}>
        <boxGeometry />
        <meshStandardMaterial
          color={accentColor}
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>
    </group>
  );
}

// ── 8. Golden Wing (Secret Reward) ──────────────────────────
function GoldenWingModel({ glowColor = "#ffe082", accentColor = "#ffb300" }: { glowColor?: string; accentColor?: string }) {
  const wingGeo = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, -0.05);
    shape.bezierCurveTo(0.08, 0.05, 0.22, 0.24, 0.24, 0.32);
    shape.bezierCurveTo(0.2, 0.35, 0.12, 0.34, 0.05, 0.26);
    shape.bezierCurveTo(-0.02, 0.28, -0.08, 0.22, -0.08, 0.14);
    shape.bezierCurveTo(-0.08, 0.06, -0.04, -0.02, 0, -0.05);
    shape.closePath();

    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.015,
      bevelEnabled: true,
      bevelThickness: 0.01,
      bevelSize: 0.008,
      bevelSegments: 1,
    });
  }, []);

  return (
    <group scale={[1.1, 1.1, 1.1]} position={[-0.05, -0.1, 0]}>
      <mesh geometry={wingGeo} castShadow receiveShadow>
        <meshStandardMaterial
          color={accentColor}
          emissive={glowColor}
          emissiveIntensity={0.45}
          metalness={0.55}
          roughness={0.25}
          transparent
          opacity={0.92}
        />
      </mesh>
      {/* Delicate spine tracery */}
      <mesh position={[0.06, 0.12, 0.018]} rotation={[0, 0, -0.6]}>
        <cylinderGeometry args={[0.006, 0.004, 0.22, 6]} />
        <meshStandardMaterial color="#fff4c2" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

// ── 9. Shimmering Crystal ───────────────────────────────────
function CrystalModel({ glowColor = "#d7f3ff", accentColor = "#79c2e0" }: { glowColor?: string; accentColor?: string }) {
  return (
    <group scale={[0.14, 0.24, 0.14]}>
      <mesh castShadow receiveShadow>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={glowColor}
          emissiveIntensity={0.3}
          metalness={0.3}
          roughness={0.15}
          transparent
          opacity={0.85}
        />
      </mesh>
    </group>
  );
}

// ── 10. Tiny Letter ─────────────────────────────────────────
function TinyLetterModel({ glowColor = "#ffe8d6", accentColor = "#cb8b6a" }: { glowColor?: string; accentColor?: string }) {
  return (
    <group rotation={[0.2, -0.15, 0]}>
      {/* Envelope Base */}
      <mesh scale={[0.24, 0.16, 0.012]} castShadow receiveShadow>
        <boxGeometry />
        <meshStandardMaterial color="#f5ede0" roughness={0.8} />
      </mesh>
      {/* Triangular Flap */}
      <mesh position={[0, 0.02, 0.008]} rotation={[0, 0, Math.PI / 4]} scale={[0.1, 0.1, 0.005]}>
        <planeGeometry />
        <meshStandardMaterial color="#ebe0cf" roughness={0.8} />
      </mesh>
      {/* Maroon Wax Stamp */}
      <mesh position={[0, -0.01, 0.012]}>
        <cylinderGeometry args={[0.022, 0.022, 0.008, 12]} />
        <meshStandardMaterial color="#882d2d" roughness={0.5} />
      </mesh>
    </group>
  );
}

// ── Central Registry Export ──────────────────────────────────
export const COLLECTIBLE_MODELS: Record<CollectibleModelKey, ModelRegistryEntry> = {
  tiny_star: {
    key: "tiny_star",
    name: "Little Star",
    categoryName: "Celestial",
    description: "Faceted 5-pointed celestial star with warm starlight glow.",
    render: (props) => <TinyStarModel {...props} />,
  },
  pressed_flower: {
    key: "pressed_flower",
    name: "Pressed Wildflower",
    categoryName: "Botanical",
    description: "5-petal wildflower with golden pistil and delicate stem.",
    render: (props) => <PressedFlowerModel {...props} />,
  },
  paint_brush: {
    key: "paint_brush",
    name: "Tiny Detail Brush",
    categoryName: "Studio Art",
    description: "Fine wooden brush with silver ferrule and lavender paint dab.",
    render: (props) => <PaintBrushModel {...props} />,
  },
  paper_crane: {
    key: "paper_crane",
    name: "Paper Crane",
    categoryName: "Keepsake",
    description: "Folded origami paper crane with textured geometric wings.",
    render: (props) => <PaperCraneModel {...props} />,
  },
  polaroid: {
    key: "polaroid",
    name: "Faded Polaroid",
    categoryName: "Memory",
    description: "Miniature instant photograph with warm sunset landscape.",
    render: (props) => <PolaroidModel {...props} />,
  },
  moon_charm: {
    key: "moon_charm",
    name: "Moon Charm",
    categoryName: "Amulet",
    description: "Iridescent crescent moon charm with subtle silver glow.",
    render: (props) => <MoonCharmModel {...props} />,
  },
  music_note: {
    key: "music_note",
    name: "Bronze Music Note",
    categoryName: "Melody",
    description: "Sculpted eighth-note in brushed antique brass.",
    render: (props) => <MusicNoteModel {...props} />,
  },
  golden_wing: {
    key: "golden_wing",
    name: "Golden Wing",
    categoryName: "Secret Lore",
    description: "Radiant filigree butterfly wing awarded by the Butterfly Secret.",
    render: (props) => <GoldenWingModel {...props} />,
  },
  crystal: {
    key: "crystal",
    name: "Shimmering Crystal",
    categoryName: "Mineral",
    description: "Prismatic faceted octahedron with translucent shimmer.",
    render: (props) => <CrystalModel {...props} />,
  },
  tiny_letter: {
    key: "tiny_letter",
    name: "Wax-Sealed Note",
    categoryName: "Correspondence",
    description: "Miniature folded envelope with deep maroon wax seal.",
    render: (props) => <TinyLetterModel {...props} />,
  },
};

export const MODEL_KEYS = Object.keys(COLLECTIBLE_MODELS) as CollectibleModelKey[];

