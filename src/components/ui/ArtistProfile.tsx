import { artist } from "@/data/artist";
import images from "@/data/images.json";
import Photo from "./Photo";
export default function ArtistProfile() {
  return (
    <div className="artist-profile">
      <div className="artist-portrait">
        <Photo image={artist.image} />
        <span className="portrait-label">
          DEMO PORTRAIT · NOT SHAIVI
        </span>
        <Photo image={images[0]} className="artist-mini" />
        <span className="artist-annotation">
          always noticing
          <br />
          the little things ↗
        </span>
      </div>
      <div className="artist-copy">
        <p className="section-kicker">MEET THE ARTIST / DEMO PROFILE</p>
        <h2>
          {artist.name}
          <i>.</i>
        </h2>
        <span className="artist-role">{artist.label}</span>
        <p className="artist-caption">{artist.caption}</p>
        <p>{artist.bio}</p>
        <div className="artist-tags">
          {artist.tags.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
        <div className="artist-details">
          {artist.details.map((d) => (
            <div key={d.label}>
              <small>{d.label}</small>
              <p>{d.value}</p>
            </div>
          ))}
        </div>
        <p className="demo-note">{artist.note}</p>
      </div>
    </div>
  );
}
