import { RESOLVED_WORLD_OBJECTS } from "@/data/worldLayout";

export const IN_WORLD_QUOTE_TV = process.env.NEXT_PUBLIC_IN_WORLD_QUOTE_TV !== "false";
// The existing desk is the television's canonical world anchor.
export const QUOTE_TV = RESOLVED_WORLD_OBJECTS.DESK;
export const SCREEN_CENTER: [number, number, number] = [0, 1.4, 0.272];
export const TV_FOCUS: [number, number, number] = [0.15, 1.4, 0.272];
export const TV_BUTTONS = [
  { action: "previous", y: 1.69, label: "PREVIOUS" },
  { action: "next", y: 1.46, label: "NEXT" },
  { action: "power", y: 1.10, label: "POWER" },
] as const;

/** Fit the complete bezel, side panel and antenna on both viewport axes. */
export function quoteCameraDistance(width: number, height: number, fov: number) {
  const tangent = Math.tan(fov * Math.PI / 360);
  return Math.max(1.72 / (2 * tangent * (width / height) * 0.90),
    1.02 / (2 * tangent * 0.78)) + 0.04;
}

/** Bounded pages preserve every character, including unbroken strings/newlines. */
export function quotePages(text: string, limit = 180): string[] {
  const characters = Array.from(text);
  const pages: string[] = [];
  while (characters.length) {
    let end = Math.min(limit, characters.length);
    if (end < characters.length) {
      const space = characters.slice(0, end).lastIndexOf(" ");
      if (space > limit * 0.6) end = space + 1;
    }
    pages.push(characters.splice(0, end).join(""));
  }
  return pages.length ? pages : [""];
}
