"use client";
import type { Section } from "@/data/portfolio";
import ArtWorkspace from "./ArtWorkspace";
import QuoteTV from "./QuoteTV";
import MusicClock from "./MusicClock";
import LetterContact from "./LetterContact";
import ArtistProfile from "./ArtistProfile";
import StarJourney from "./StarJourney";
export function SectionContent({ section }: { section: Section }) {
  return section === "ABOUT" ? (
    <ArtistProfile />
  ) : section === "GALLERY" ? (
    <ArtWorkspace />
  ) : section === "QUOTES" ? (
    <QuoteTV />
  ) : section === "CONTACT" ? (
    <LetterContact />
  ) : section === "MUSIC" ? (
    <MusicClock />
  ) : (
    <StarJourney />
  );
}
