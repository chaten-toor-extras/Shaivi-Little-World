"use client";

import { mediaService } from "@/services/media.service";
import type { PhotoData } from "@/types";
import {
  DeleteOutlined,
  PictureOutlined,
  UploadOutlined,
  ScissorOutlined,
} from "@ant-design/icons";
import { Alert, Button, Progress } from "antd";
import Image from "next/image";
import ImageCropModal from "./ImageCropModal";
import { useRef, useState, type ChangeEvent, type DragEvent } from "react";

interface AdminImageUploadProps {
  value?: PhotoData | null;
  onChange?: (val: PhotoData | null) => void;
  folder?: "artist" | "artworks" | "journey" | "song-covers";
  aspectRatio?: string;
  recommendedSize?: string;
}

export default function AdminImageUpload({
  value,
  onChange,
  folder = "artworks",
  aspectRatio = "4 / 3",
  recommendedSize = "1600 × 1200",
}: AdminImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [selectedFileUrl, setSelectedFileUrl] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    // Basic validations
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (JPEG, PNG, WebP, AVIF).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image file size must be less than 10 MB.");
      return;
    }

    setError(null);
    const url = URL.createObjectURL(file);
    setSelectedFileUrl(url);
    setCropModalOpen(true);
  };

  const processCroppedFile = async (croppedFile: File) => {
    setCropModalOpen(false);
    if (selectedFileUrl && selectedFileUrl.startsWith("blob:")) {
      URL.revokeObjectURL(selectedFileUrl);
    }
    setSelectedFileUrl(null);

    setUploading(true);
    setProgress(0);

    try {
      const asset = await mediaService.uploadToCloudinary(
        croppedFile,
        folder,
        "image",
        (p) => setProgress(p),
      );

      const photoData: PhotoData = {
        src: asset.secureUrl || asset.url,
        alt: croppedFile.name.replace(/\.[^/.]+$/, ""),
        source: "",
        credit: "Uploaded via Studio CMS",
      };

      onChange?.(photoData);
    } catch (err: any) {
      setError(
        err?.message ||
          "Could not upload image. Cloudinary upload failed. Check your API credentials in server/.env.",
      );
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleCropCancel = () => {
    setCropModalOpen(false);
    if (selectedFileUrl && selectedFileUrl.startsWith("blob:")) {
      URL.revokeObjectURL(selectedFileUrl);
    }
    setSelectedFileUrl(null);
  };

  const parseAspectRatio = (ar?: string): number | undefined => {
    if (!ar) return undefined;
    const parts = ar.split("/").map((p) => p.trim());
    if (parts.length === 2) {
      const num = parseFloat(parts[0]);
      const den = parseFloat(parts[1]);
      if (!isNaN(num) && !isNaN(den) && den !== 0) return num / den;
    }
    const val = parseFloat(ar);
    return isNaN(val) ? undefined : val;
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleRemove = () => {
    onChange?.(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const imgPreview =
    value?.src || (value as any)?.url || (value as any)?.secureUrl || "";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        onChange={handleInputChange}
        style={{ display: "none" }}
      />

      {error && (
        <Alert
          title={error}
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
          style={{ marginBottom: "8px" }}
        />
      )}

      {imgPreview ? (
        // Image Preview State
        <div
          style={{
            position: "relative",
            borderRadius: "8px",
            overflow: "hidden",
            border: "1px solid rgba(64, 62, 69, 0.12)",
            background: "#faf6f0",
            width: "100%",
            maxWidth: "360px",
            aspectRatio,
          }}
        >
          <Image
            src={imgPreview}
            alt={value?.alt || "Uploaded image"}
            fill
            style={{ objectFit: "cover" }}
          />

          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: "8px 12px",
              background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", gap: "8px" }}>
              <Button
                size="small"
                icon={<UploadOutlined />}
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                Replace
              </Button>
              <Button
                size="small"
                icon={<ScissorOutlined />}
                onClick={() => {
                  if (imgPreview) {
                    setSelectedFileUrl(imgPreview);
                    setCropModalOpen(true);
                  }
                }}
                disabled={uploading}
              >
                Edit
              </Button>
            </div>
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={handleRemove}
              disabled={uploading}
            >
              Remove
            </Button>
          </div>
        </div>
      ) : (
        // Dropzone / Select State
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            padding: "24px 16px",
            border: `2px dashed ${isDragOver ? "#8a6d79" : "rgba(64, 62, 69, 0.2)"}`,
            borderRadius: "8px",
            background: isDragOver ? "#f7f1f4" : "#faf6f0",
            textAlign: "center",
            cursor: "pointer",
            transition: "all 0.2s ease",
            maxWidth: "360px",
          }}
        >
          <PictureOutlined
            style={{ fontSize: "28px", color: "#8a6d79", marginBottom: "8px" }}
          />
          <div
            style={{ fontWeight: 500, color: "#3d3745", fontSize: "0.9rem" }}
          >
            Click or drag image here
          </div>
          <div
            style={{ color: "#8a7f8e", fontSize: "0.75rem", marginTop: "4px" }}
          >
            JPEG, PNG, WebP up to 10MB (Rec: {recommendedSize})
          </div>
        </div>
      )}

      {uploading && (
        <div style={{ marginTop: "6px", maxWidth: "360px" }}>
          <Progress
            percent={progress}
            size="small"
            status="active"
            strokeColor="#8a6d79"
          />
        </div>
      )}

      {selectedFileUrl && (
        <ImageCropModal
          open={cropModalOpen}
          imageUrl={selectedFileUrl}
          aspectRatio={parseAspectRatio(aspectRatio)}
          onApply={processCroppedFile}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
}
