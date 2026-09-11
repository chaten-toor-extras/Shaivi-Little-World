import images from "./images.json";
export const moods = [
  {
    name: "Calm",
    color: "#d7ddc5",
    ink: "#354537",
    order: [0, 3, 4, 1, 2, 5, 6],
  },
  {
    name: "Dreamy",
    color: "#c9c5df",
    ink: "#474059",
    order: [2, 1, 5, 0, 6, 3, 4],
  },
  {
    name: "Focus",
    color: "#d8ceba",
    ink: "#474334",
    order: [5, 0, 1, 4, 2, 3, 6],
  },
  {
    name: "Late Night",
    color: "#343341",
    ink: "#e7ddce",
    order: [0, 5, 6, 2, 1, 4, 3],
  },
  {
    name: "Rainy",
    color: "#bccbd0",
    ink: "#354954",
    order: [3, 1, 5, 4, 0, 2, 6],
  },
  {
    name: "Happy",
    color: "#e8d09b",
    ink: "#624b35",
    order: [4, 6, 2, 1, 0, 3, 5],
  },
] as const;
export const songs = [
  "After Midnight",
  "Soft Blue",
  "Paper Skies",
  "Quiet Weather",
  "Slow Sunday",
  "Half-Light",
  "Warm Static",
].map((title, i) => ({
  id: `track-${i + 1}`,
  title,
  artist: "Demo Artist",
  duration: [222, 248, 177, 211, 256, 203, 234][i],
  cover: images[[6, 9, 5, 7, 0, 2, 4][i]],
  audioSrc: null,
}));
