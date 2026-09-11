"use client";

import { useArtist } from "@/providers/ContentProvider";
import Photo from "./Photo";

export default function ArtistProfile() {
  const artist = useArtist();

  const portrait = artist?.portrait || (artist as any)?.image;
  const miniImage = artist?.smallImage || {
    src: "https://images.pexels.com/photos/16652946/pexels-photo-16652946.jpeg?auto=compress&cs=tinysrgb&w=1600",
    alt: "Decorative mini image",
  };

  return (
    <div className="artist-profile">
      <div className="artist-portrait">
        <Photo image={portrait} priority loading="eager" />
        {artist?.note && <span className="portrait-label">{artist.note}</span>}
        <Photo image={miniImage} className="artist-mini" />
        <span className="artist-annotation" style={{ whiteSpace: "pre-line" }}>
          {artist?.annotationText || "always noticing\nthe little things ↗"}
        </span>
      </div>
      <div className="artist-copy">
        <p className="section-kicker">
          {artist?.sectionKicker || "MEET THE ARTIST / PROFILE"}
        </p>
        <h2>
          {artist?.name || "Shaivi"}
          <i>.</i>
        </h2>
        <span className="artist-role">{artist?.label || "Artist"}</span>
        <p className="artist-caption">{artist?.caption}</p>
        <p>{artist?.bio}</p>
        <div className="artist-tags">
          {artist?.tags?.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
        <div className="artist-details">
          {artist?.details?.map((d) => (
            <div key={d.label}>
              <small>{d.label}</small>
              <p>{d.value}</p>
            </div>
          ))}
        </div>
        {artist?.note && <p className="demo-note">{artist.note}</p>}
      </div>
    </div>
  );
}
