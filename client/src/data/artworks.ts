import images from "./images.json";
export type Photo = (typeof images)[number];
export const artworks = [
  "Blue Silence",
  "Sunday Window",
  "Soft Chaos",
  "Paper Moon",
  "Half Awake",
  "Before Rain",
  "Somewhere Quiet",
  "Bloom",
  "Warm Static",
  "Unsent",
  "After 5 PM",
  "Little Things",
].map((title, i) => ({
  id: `art-${i + 1}`,
  title,
  year: 2026 - Math.floor(i / 5),
  image: images[[9, 8, 1, 5, 7, 6, 2, 0, 4, 3, 9, 7][i]],
  caption: [
    "A study in noticing what almost slips past.",
    "Collected light, softened edges, and a little room to breathe.",
    "An imagined page from a notebook of everyday things.",
  ][i % 3],
  initialPosition: {
    x: [4, 26, 49, 72, 12, 36, 60, 77, 1, 24, 49, 70][i],
    y: [3, 8, 2, 6, 31, 37, 30, 38, 65, 70, 64, 72][i],
  },
  initialRotation: [-8, 6, -4, 9, 3, -7, 6, -5, 8, -3, -7, 4][i],
  initialScale: [1, 0.92, 1.03, 0.9, 0.96, 1, 0.9, 0.95, 0.94, 0.9, 1, 0.92][i],
}));
