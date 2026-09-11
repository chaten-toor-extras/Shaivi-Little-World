"use client";

import { mediaService } from "@/services/media.service";
import {
  CustomerServiceOutlined,
  DeleteOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { Alert, Button, Progress } from "antd";
import { useRef, useState, type ChangeEvent } from "react";

interface AdminAudioUploadProps {
  value?: { url: string } | null;
  duration?: number;
  onChange?: (val: { url: string } | null, duration?: number) => void;
}

/**
 * Extract duration in seconds directly from an audio File using browser HTML5 Audio
 */
function extractAudioDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    try {
      const url = URL.createObjectURL(file);
      const audio = new Audio();
      audio.preload = "metadata";
      audio.src = url;

      let resolved = false;
      const cleanup = () => {
        if (!resolved) {
          resolved = true;
          URL.revokeObjectURL(url);
          audio.removeEventListener("loadedmetadata", onLoaded);
          audio.removeEventListener("error", onError);
        }
      };

      const onLoaded = () => {
        const dur = Math.round(audio.duration || 0);
        cleanup();
        resolve(dur);
      };

      const onError = () => {
        cleanup();
        resolve(0);
      };

      audio.addEventListener("loadedmetadata", onLoaded);
      audio.addEventListener("error", onError);

      setTimeout(() => {
        cleanup();
        resolve(0);
      }, 5000);
    } catch {
      resolve(0);
    }
  });
}

export default function AdminAudioUpload({
  value,
  duration,
  onChange,
}: AdminAudioUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleFile = async (file: File) => {
    // Validations
    const validTypes = [
      "audio/mpeg",
      "audio/mp3",
      "audio/wav",
      "audio/m4a",
      "audio/aac",
      "audio/x-m4a",
    ];
    if (
      !validTypes.includes(file.type) &&
      !file.name.match(/\.(mp3|wav|m4a|aac)$/i)
    ) {
      setError("Please select an audio file (MP3, WAV, M4A, AAC).");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError("Audio file size must be less than 50 MB.");
      return;
    }

    setError(null);
    setUploading(true);
    setProgress(0);

    // 1. Immediately extract duration locally from the audio file
    const localDuration = await extractAudioDuration(file);
    if (localDuration > 0) {
      onChange?.(value || null, localDuration);
    }

    try {
      const asset = await mediaService.uploadToCloudinary(
        file,
        "audio",
        "audio",
        (p) => setProgress(p),
      );

      const audioUrl = asset.secureUrl || asset.url;
      const finalDuration = localDuration || Math.round(asset.duration || 0);

      onChange?.({ url: audioUrl }, finalDuration);
    } catch (err: any) {
      setError(
        err?.message ||
          "Could not upload audio. Check your Cloudinary configuration in server/.env.",
      );
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleRemove = () => {
    onChange?.(null, 0);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        maxWidth: "420px",
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/mp3,audio/mpeg,audio/wav,audio/m4a,audio/aac"
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

      {value?.url ? (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "8px",
            border: "1px solid rgba(64, 62, 69, 0.12)",
            background: "#faf6f0",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <CustomerServiceOutlined
                style={{ color: "#8a6d79", fontSize: "18px" }}
              />
              <span
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  color: "#3d3745",
                }}
              >
                Audio Attached{" "}
                {duration
                  ? `(${Math.floor(duration / 60)}:${String(duration % 60).padStart(2, "0")})`
                  : ""}
              </span>
            </div>

            <div style={{ display: "flex", gap: "6px" }}>
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
                danger
                icon={<DeleteOutlined />}
                onClick={handleRemove}
                disabled={uploading}
              >
                Remove
              </Button>
            </div>
          </div>

          <audio
            ref={audioRef}
            src={value.url}
            controls
            style={{ width: "100%", height: "36px" }}
          />
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{
            padding: "16px",
            border: "2px dashed rgba(64, 62, 69, 0.2)",
            borderRadius: "8px",
            background: "#faf6f0",
            textAlign: "center",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
          }}
        >
          <CustomerServiceOutlined
            style={{ fontSize: "20px", color: "#8a6d79" }}
          />
          <div style={{ textAlign: "left" }}>
            <div
              style={{ fontWeight: 500, fontSize: "0.85rem", color: "#3d3745" }}
            >
              Select audio track
            </div>
            <div style={{ fontSize: "0.75rem", color: "#8a7f8e" }}>
              MP3, WAV, AAC up to 50MB
            </div>
          </div>
        </div>
      )}

      {uploading && (
        <Progress
          percent={progress}
          size="small"
          status="active"
          strokeColor="#8a6d79"
        />
      )}
    </div>
  );
}
