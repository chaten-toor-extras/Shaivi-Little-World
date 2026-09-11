import type { JourneyMilestone } from "@/types";
import * as THREE from "three";

export interface NormalizedStarCoord {
  x: number; // 0–100
  y: number; // 0–100
  depth: number; // 0–1
  size: "small" | "normal" | "featured";
  glowColor: string;
  order: number;
}

// Deterministic Pseudo-Random Number Generator (LCG) based on string seed
export function createSeededRandom(seedStr: string = "shaivi-telescope") {
  let seed = 0;
  for (let i = 0; i < seedStr.length; i++) {
    seed = (seed * 31 + seedStr.charCodeAt(i)) & 0xffffffff;
  }
  if (seed === 0) seed = 123456789;

  return function next() {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

// Realistic astronomical stellar color palette [R, G, B]
export const STELLAR_COLORS: [number, number, number][] = [
  [0.72, 0.83, 1.0], // O/B Class: Sirius electric blue-white
  [0.88, 0.94, 1.0], // A Class: Vega diamond white
  [1.0, 0.98, 0.96], // F Class: Pure radiant pearl white
  [1.0, 0.92, 0.74], // G Class: Solar warm golden
  [1.0, 0.83, 0.65], // K Class: Arcturus soft amber
  [1.0, 0.72, 0.62], // M Class: Betelgeuse warm rose-amber
  [0.86, 0.76, 1.0], // Ethereal nebula violet / cosmic lavender
];

// Generate deterministic decorative stars in a viewing frustum
export function generateDecorativeStars(
  count: number,
  seed: string = "shaivi-telescope",
) {
  const prng = createSeededRandom(seed);
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const twinkleSpeeds = new Float32Array(count);
  const twinklePhases = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    // Spread across a deep celestial dome (-14 to +14 horizontal, -9 to +9 vertical, -2.5 to -14 depth)
    const x = (prng() - 0.5) * 28;
    const y = (prng() - 0.5) * 18;
    const z = -2.5 - prng() * 11.5;

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    // Pick authentic stellar color
    const colorIdx = Math.floor(prng() * STELLAR_COLORS.length);
    const [r, g, b] = STELLAR_COLORS[colorIdx];
    // Brightness factor (0.6 to 1.0)
    const brightness = 0.6 + prng() * 0.4;
    colors[i * 3] = r * brightness;
    colors[i * 3 + 1] = g * brightness;
    colors[i * 3 + 2] = b * brightness;

    // Multi-magnitude sizes (faint micro-dust 0.1 to bright signature 0.45)
    const isBright = prng() > 0.88;
    sizes[i] = isBright ? 0.32 + prng() * 0.18 : 0.1 + prng() * 0.18;

    // Asynchronous twinkle speeds and individual phase offsets
    twinkleSpeeds[i] = 1.0 + prng() * 3.5;
    twinklePhases[i] = prng() * Math.PI * 2;
  }

  return { positions, colors, sizes, twinkleSpeeds, twinklePhases };
}

// Generate aesthetic sinusoidal positions for N milestones
export function calculateAutoPositions(
  total: number,
): { x: number; y: number }[] {
  if (total <= 0) return [];
  if (total === 1) return [{ x: 50, y: 45 }];

  const positions: { x: number; y: number }[] = [];
  const minX = 14;
  const maxX = 86;
  const xStep = (maxX - minX) / (total - 1);

  for (let i = 0; i < total; i++) {
    const x = minX + i * xStep;
    // Sinusoidal wave across the constellation sky: mid at 44%, wave amplitude ~18%
    const wave = Math.sin((i / (total - 1)) * Math.PI * 2.2 + 0.3) * 18;
    const y = Math.round(Math.max(16, Math.min(78, 44 + wave)));
    positions.push({ x: Math.round(x), y });
  }

  return positions;
}

// Resolve coordinates for each milestone, honoring CMS values or falling back gracefully
export function getResolvedMilestoneCoords(
  milestones: JourneyMilestone[],
  isMobile: boolean = false,
): (NormalizedStarCoord & {
  milestone: JourneyMilestone;
  originalIndex: number;
})[] {
  const total = milestones.length;
  const autoCoords = calculateAutoPositions(total);

  return milestones.map((m, i) => {
    const t = m.telescope;
    const auto = autoCoords[i] || { x: 50, y: 50 };

    let x = typeof t?.x === "number" && !isNaN(t.x) ? t.x : auto.x;
    let y = typeof t?.y === "number" && !isNaN(t.y) ? t.y : auto.y;

    // Safety clamp to bounds
    x = Math.max(8, Math.min(92, x));
    y = Math.max(12, Math.min(88, y));

    // On mobile, compress upper vertical space so stars stay clear of bottom story sheet
    if (isMobile) {
      y = 12 + (y / 100) * 44; // keep in top 12% - 56% region
    }

    return {
      x,
      y,
      depth:
        typeof t?.depth === "number" ? Math.max(0, Math.min(1, t.depth)) : 0.5,
      size: t?.size || "normal",
      glowColor: t?.glowColor || "#C9B7E8",
      order:
        typeof t?.constellationOrder === "number"
          ? t.constellationOrder
          : (m.order ?? i),
      milestone: m,
      originalIndex: i,
    };
  });
}

// Convert normalized 0-100 coordinates to 3D world space
export function normalizedToWorld(
  x: number,
  y: number,
  depth: number = 0.5,
  viewportWidth: number = 14,
  viewportHeight: number = 9,
): [number, number, number] {
  // x: 0 (left) -> -viewportWidth/2, 100 (right) -> +viewportWidth/2
  const worldX = (x / 100 - 0.5) * viewportWidth;
  // y: 0 (top) -> +viewportHeight/2, 100 (bottom) -> -viewportHeight/2
  const worldY = (0.5 - y / 100) * viewportHeight;
  // subtle depth range between -0.5 and -2.5
  const worldZ = -0.5 - depth * 1.5;

  return [worldX, worldY, worldZ];
}

// Collision check between two stars in normalized percent coordinates
export function checkStarCollision(
  a: { x: number; y: number },
  b: { x: number; y: number },
  minDistance: number = 9,
): boolean {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy) < minDistance;
}

// Cached soft radial star glow texture
let cachedGlowTexture: THREE.CanvasTexture | null = null;
export function getStarGlowTexture(): THREE.CanvasTexture {
  if (cachedGlowTexture) return cachedGlowTexture;
  if (typeof document === "undefined") {
    return new THREE.CanvasTexture(null as unknown as HTMLCanvasElement);
  }

  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
    gradient.addColorStop(0.18, "rgba(235, 225, 255, 0.85)");
    gradient.addColorStop(0.45, "rgba(180, 150, 250, 0.35)");
    gradient.addColorStop(0.8, "rgba(120, 90, 220, 0.08)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.generateMipmaps = true;
  tex.needsUpdate = true;
  cachedGlowTexture = tex;
  return tex;
}

// Cached 4-point diffraction spike star texture
let cachedSpikeTexture: THREE.CanvasTexture | null = null;
export function getDiffractionSpikeTexture(): THREE.CanvasTexture {
  if (cachedSpikeTexture) return cachedSpikeTexture;
  if (typeof document === "undefined") {
    return new THREE.CanvasTexture(null as unknown as HTMLCanvasElement);
  }

  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    // Soft core
    const coreGrad = ctx.createRadialGradient(64, 64, 0, 64, 64, 20);
    coreGrad.addColorStop(0, "rgba(255, 255, 255, 1)");
    coreGrad.addColorStop(0.3, "rgba(230, 215, 255, 0.7)");
    coreGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = coreGrad;
    ctx.fillRect(0, 0, 128, 128);

    // Horizontal diffraction spike
    const hGrad = ctx.createLinearGradient(0, 64, 128, 64);
    hGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
    hGrad.addColorStop(0.45, "rgba(255, 255, 255, 0.85)");
    hGrad.addColorStop(0.5, "rgba(255, 255, 255, 1)");
    hGrad.addColorStop(0.55, "rgba(255, 255, 255, 0.85)");
    hGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = hGrad;
    ctx.fillRect(0, 62, 128, 4);

    // Vertical diffraction spike
    const vGrad = ctx.createLinearGradient(64, 0, 64, 128);
    vGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
    vGrad.addColorStop(0.45, "rgba(255, 255, 255, 0.85)");
    vGrad.addColorStop(0.5, "rgba(255, 255, 255, 1)");
    vGrad.addColorStop(0.55, "rgba(255, 255, 255, 0.85)");
    vGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = vGrad;
    ctx.fillRect(62, 0, 4, 128);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.generateMipmaps = true;
  tex.needsUpdate = true;
  cachedSpikeTexture = tex;
  return tex;
}
