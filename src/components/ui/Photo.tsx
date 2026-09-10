"use client";
import Image from "next/image";
import { useState } from "react";
import type { Photo as PhotoData } from "@/data/artworks";
export default function Photo({
  image,
  className = "",
  sizes = "(max-width: 700px) 90vw, 45vw",
}: {
  image: PhotoData;
  className?: string;
  sizes?: string;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={`art-photo ${className}`}>
      {failed ? (
        <span className="photo-error">{image.alt}</span>
      ) : (
        <Image
          src={image.src}
          alt={image.alt}
          fill
          unoptimized={false}
          sizes={sizes}
          loader={({ src, width }) => {
            const url = new URL(src);
            url.searchParams.set("w", String(Math.min(width, 1600)));
            return url.toString();
          }}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
