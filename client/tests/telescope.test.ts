import assert from "node:assert";
import {
  calculateAutoPositions,
  checkStarCollision,
  createSeededRandom,
  generateDecorativeStars,
  getResolvedMilestoneCoords,
  normalizedToWorld,
} from "../src/components/ui/telescope/telescopeUtils";
import type { JourneyMilestone } from "../src/types";

console.log("Starting Telescope Journey Unit Tests...");

// 1. Seeded Random Determinism
{
  const rnd1 = createSeededRandom("shaivi-telescope");
  const rnd2 = createSeededRandom("shaivi-telescope");

  for (let i = 0; i < 20; i++) {
    assert.strictEqual(
      rnd1(),
      rnd2(),
      "Identical seeds must produce identical pseudorandom sequence",
    );
  }

  const { positions: pos1 } = generateDecorativeStars(100, "test-seed");
  const { positions: pos2 } = generateDecorativeStars(100, "test-seed");

  assert.strictEqual(pos1.length, pos2.length, "Positions length matches");
  for (let i = 0; i < pos1.length; i++) {
    assert.strictEqual(pos1[i], pos2[i], `Position at ${i} must be identical`);
  }
  console.log("✓ Seeded decorative star determinism passed");
}

// 2. Dynamic Milestone Count Support (0, 1, 3, 5, 12 milestones)
{
  assert.deepStrictEqual(
    calculateAutoPositions(0),
    [],
    "0 milestones returns empty array",
  );

  const oneStar = calculateAutoPositions(1);
  assert.strictEqual(oneStar.length, 1, "1 milestone returns 1 position");
  assert.strictEqual(oneStar[0].x, 50, "1 milestone centered horizontally");
  assert.strictEqual(oneStar[0].y, 45, "1 milestone centered vertically");

  const fiveStars = calculateAutoPositions(5);
  assert.strictEqual(fiveStars.length, 5, "5 milestones returns 5 positions");
  for (const s of fiveStars) {
    assert.ok(s.x >= 8 && s.x <= 92, "X coordinate within bounds");
    assert.ok(s.y >= 12 && s.y <= 88, "Y coordinate within bounds");
  }

  const twelveStars = calculateAutoPositions(12);
  assert.strictEqual(
    twelveStars.length,
    12,
    "12 milestones returns 12 positions",
  );
  for (let i = 0; i < twelveStars.length - 1; i++) {
    assert.ok(
      twelveStars[i + 1].x > twelveStars[i].x,
      "Stars must progress horizontally left to right",
    );
  }
  console.log("✓ Dynamic milestone count auto-layout passed (0, 1, 5, 12)");
}

// 3. Coordinate Resolution with Legacy & Missing Metadata
{
  const mockMilestones: JourneyMilestone[] = [
    {
      _id: "m1",
      title: "First",
      year: "2022",
      text: "Start",
      image: { src: "/img.jpg", alt: "First image" },
      order: 0,
      isPublished: true,
      createdAt: "",
      updatedAt: "",
      // Missing telescope metadata completely
    },
    {
      _id: "m2",
      title: "Second",
      year: "2023",
      text: "Middle",
      image: { src: "/img.jpg", alt: "Second image" },
      order: 1,
      isPublished: true,
      createdAt: "",
      updatedAt: "",
      telescope: {
        x: 35,
        y: 60,
        size: "featured",
        glowColor: "#FFD700",
      },
    },
  ];

  const resolved = getResolvedMilestoneCoords(mockMilestones, false);
  assert.strictEqual(resolved.length, 2);

  // m1 should have received safe auto-coordinates
  assert.ok(typeof resolved[0].x === "number" && !isNaN(resolved[0].x));
  assert.ok(typeof resolved[0].y === "number" && !isNaN(resolved[0].y));
  assert.strictEqual(resolved[0].size, "normal");

  // m2 should preserve configured telescope coordinates
  assert.strictEqual(resolved[1].x, 35);
  assert.strictEqual(resolved[1].y, 60);
  assert.strictEqual(resolved[1].size, "featured");
  assert.strictEqual(resolved[1].glowColor, "#FFD700");

  console.log("✓ Legacy & missing metadata fallback passed");
}

// 4. Mobile Layout Vertical Range Compression
{
  const mockMilestones: JourneyMilestone[] = [
    {
      _id: "m1",
      title: "Test",
      year: "2024",
      text: "",
      image: { src: "/img.jpg", alt: "Test" },
      order: 0,
      isPublished: true,
      createdAt: "",
      updatedAt: "",
      telescope: { x: 50, y: 80 },
    },
  ];

  const desktop = getResolvedMilestoneCoords(mockMilestones, false);
  const mobile = getResolvedMilestoneCoords(mockMilestones, true);

  assert.strictEqual(desktop[0].y, 80, "Desktop preserves y=80");
  assert.ok(
    mobile[0].y < 60,
    `Mobile compresses y to upper sky (got ${mobile[0].y}) to clear bottom sheet`,
  );
  console.log("✓ Mobile sky compression passed");
}

// 5. Star Collision Detection
{
  assert.strictEqual(
    checkStarCollision({ x: 20, y: 20 }, { x: 22, y: 23 }, 8),
    true,
    "Nearby stars detected as colliding",
  );
  assert.strictEqual(
    checkStarCollision({ x: 10, y: 10 }, { x: 50, y: 50 }, 8),
    false,
    "Distant stars detected as non-colliding",
  );
  console.log("✓ Star collision detection passed");
}

// 6. Normalized to World Space Transformation
{
  const [leftX, topY, z] = normalizedToWorld(0, 0, 0.5, 14, 9);
  const [rightX, bottomY] = normalizedToWorld(100, 100, 0.5, 14, 9);
  const [centerX, centerY] = normalizedToWorld(50, 50, 0.5, 14, 9);

  assert.strictEqual(leftX, -7, "x=0 maps to -viewportWidth/2");
  assert.strictEqual(rightX, 7, "x=100 maps to +viewportWidth/2");
  assert.strictEqual(topY, 4.5, "y=0 maps to +viewportHeight/2");
  assert.strictEqual(bottomY, -4.5, "y=100 maps to -viewportHeight/2");
  assert.strictEqual(centerX, 0, "x=50 maps to 0");
  assert.strictEqual(centerY, 0, "y=50 maps to 0");
  assert.ok(z < 0, "Z coordinate sits in front frustum");
  console.log("✓ Normalized to 3D world space transformation passed");
}

console.log("All Telescope Journey Unit Tests Passed Successfully! ✦");
