"use client";
import type { Section } from "@/data/portfolio";
import ArtistProfile from "./ArtistProfile";
import ArtWorkspace from "./ArtWorkspace";
import JourneyExperience from "./JourneyExperience";
import LetterContact from "./LetterContact";
import MusicClock from "./MusicClock";
import QuoteTV from "./QuoteTV";

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
    <JourneyExperience />
  );
}
