"use client";

import type { PhotoData } from "@/types";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Photo({
  image,
  className = "",
  sizes = "(max-width: 700px) 90vw, 45vw",
  priority = false,
  loading,
}: {
  image?:
    | PhotoData
    | { src?: string; url?: string; alt?: string; secureUrl?: string }
    | null;
  className?: string;
  sizes?: string;
  priority?: boolean;
  loading?: "eager" | "lazy";
}) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const imgSrc =
    image?.src ||
    (image as { url?: string; secureUrl?: string })?.url ||
    (image as { url?: string; secureUrl?: string })?.secureUrl ||
    "";

  useEffect(() => {
    setFailed(false);
    setLoaded(false);
  }, [imgSrc]);

  if (!image || !imgSrc) {
    return (
      <div className={`art-photo ${className}`}>
        <span className="photo-error">No image provided</span>
      </div>
    );
  }

  const isCustomCDN =
    imgSrc.includes("cloudinary.com") ||
    imgSrc.includes("pexels.com") ||
    imgSrc.includes("images.unsplash.com");

  const isExternal =
    imgSrc.startsWith("http://") || imgSrc.startsWith("https://");

  const customLoader = ({
    src,
    width,
    quality,
  }: {
    src: string;
    width: number;
    quality?: number;
  }) => {
    try {
      if (src.includes("cloudinary.com")) {
        // Apply Cloudinary optimization
        if (src.includes("/upload/")) {
          const params = `f_auto,q_${quality || "auto"},w_${Math.min(width, 1600)},c_limit`;
          return src.replace("/upload/", `/upload/${params}/`);
        }
        return src;
      }

      if (src.includes("images.unsplash.com")) {
        const url = new URL(src);
        url.searchParams.set("w", String(Math.min(width, 1600)));
        url.searchParams.set("q", String(quality || 80));
        url.searchParams.set("auto", "format");
        return url.toString();
      }

      if (src.includes("pexels.com")) {
        const url = new URL(src);
        url.searchParams.set("w", String(Math.min(width, 1600)));
        return url.toString();
      }

      return src;
    } catch {
      return src;
    }
  };

  return (
    <div className={`art-photo ${className} ${!loaded ? "photo-loading" : ""}`}>
      {failed ? (
        <span className="photo-error">
          {image.alt || "Image could not be loaded"}
        </span>
      ) : (
        <Image
          src={imgSrc}
          alt={image?.alt || "Portfolio image"}
          fill
          unoptimized={isExternal && !isCustomCDN}
          sizes={sizes}
          loader={isCustomCDN ? customLoader : undefined}
          priority={priority}
          loading={loading || (priority ? "eager" : undefined)}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
