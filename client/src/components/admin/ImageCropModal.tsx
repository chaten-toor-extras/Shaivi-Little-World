import { Button, Modal, Segmented, Slider, Space } from "antd";
import { useCallback, useEffect, useState } from "react";
import Cropper, { Area } from "react-easy-crop";

interface ImageCropModalProps {
  open: boolean;
  imageUrl: string;
  aspectRatio?: number;
  onApply: (croppedFile: File) => void;
  onCancel: () => void;
}

const PRESET_OPTIONS = [
  { label: "Free", value: "free" },
  { label: "1:1", value: "1:1" },
  { label: "4:3", value: "4:3" },
  { label: "3:2", value: "3:2" },
  { label: "16:9", value: "16:9" },
];

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation: number = 0,
): Promise<File> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = imageSrc;
  });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("No 2d context");
  }

  // Calculate bounding box of the rotated image
  const rotRad = (rotation * Math.PI) / 180;
  const boundingBoxWidth =
    Math.abs(Math.cos(rotRad) * image.width) +
    Math.abs(Math.sin(rotRad) * image.height);
  const boundingBoxHeight =
    Math.abs(Math.sin(rotRad) * image.width) +
    Math.abs(Math.cos(rotRad) * image.height);

  canvas.width = boundingBoxWidth;
  canvas.height = boundingBoxHeight;

  // Translate to center and rotate
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(rotRad);
  ctx.translate(-image.width / 2, -image.height / 2);

  // Draw image
  ctx.drawImage(image, 0, 0);

  // Extract the cropped image
  const croppedCanvas = document.createElement("canvas");
  const croppedCtx = croppedCanvas.getContext("2d");

  if (!croppedCtx) {
    throw new Error("No 2d context for cropped canvas");
  }

  croppedCanvas.width = pixelCrop.width;
  croppedCanvas.height = pixelCrop.height;

  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  return new Promise((resolve, reject) => {
    croppedCanvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Canvas is empty"));
          return;
        }
        const file = new File([blob], "cropped.jpg", { type: "image/jpeg" });
        resolve(file);
      },
      "image/jpeg",
      0.9,
    );
  });
}

export default function ImageCropModal({
  open,
  imageUrl,
  aspectRatio,
  onApply,
  onCancel,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [currentAspectStr, setCurrentAspectStr] = useState<string>("free");
  const [currentAspect, setCurrentAspect] = useState<number | undefined>(
    aspectRatio,
  );

  useEffect(() => {
    if (open) {
      setZoom(1);
      setRotation(0);
      setCrop({ x: 0, y: 0 });
      if (aspectRatio) {
        setCurrentAspect(aspectRatio);
        // Try to match aspect ratio to a preset if possible
        if (Math.abs(aspectRatio - 1) < 0.01) setCurrentAspectStr("1:1");
        else if (Math.abs(aspectRatio - 4 / 3) < 0.01)
          setCurrentAspectStr("4:3");
        else if (Math.abs(aspectRatio - 3 / 2) < 0.01)
          setCurrentAspectStr("3:2");
        else if (Math.abs(aspectRatio - 16 / 9) < 0.01)
          setCurrentAspectStr("16:9");
        else setCurrentAspectStr("free");
      } else {
        setCurrentAspect(undefined);
        setCurrentAspectStr("free");
      }
    }
  }, [open, aspectRatio]);

  const onCropComplete = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    [],
  );

  const handleApply = async () => {
    if (croppedAreaPixels && imageUrl) {
      try {
        const croppedFile = await getCroppedImg(
          imageUrl,
          croppedAreaPixels,
          rotation,
        );
        onApply(croppedFile);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleAspectChange = (value: string) => {
    setCurrentAspectStr(value);
    switch (value) {
      case "1:1":
        setCurrentAspect(1);
        break;
      case "4:3":
        setCurrentAspect(4 / 3);
        break;
      case "3:2":
        setCurrentAspect(3 / 2);
        break;
      case "16:9":
        setCurrentAspect(16 / 9);
        break;
      default:
        setCurrentAspect(undefined);
    }
  };

  return (
    <Modal
      open={open}
      title="Edit Image"
      onCancel={onCancel}
      width={600}
      destroyOnHidden
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="apply"
          type="primary"
          style={{ background: "#8a6d79", borderColor: "#8a6d79" }}
          onClick={handleApply}
        >
          Apply
        </Button>,
      ]}
      styles={{
        body: { background: "#faf6f0" },
        header: { background: "#faf6f0" },
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div
          style={{
            position: "relative",
            width: "100%",
            height: 350,
            background: "#333",
          }}
        >
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={currentAspect}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
          />
        </div>

        <div>
          <div style={{ marginBottom: 8, fontSize: "0.9rem" }}>
            Aspect Ratio
          </div>
          <Segmented
            options={PRESET_OPTIONS}
            value={currentAspectStr}
            onChange={handleAspectChange}
            block
          />
        </div>

        <Space direction="vertical" style={{ width: "100%" }}>
          <div>
            <div style={{ fontSize: "0.9rem" }}>Zoom</div>
            <Slider
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={setZoom}
              styles={{
                track: { background: "#8a6d79" },
                handle: { borderColor: "#8a6d79" },
              }}
            />
          </div>
          <div>
            <div style={{ fontSize: "0.9rem" }}>Rotation</div>
            <Slider
              min={-180}
              max={180}
              step={1}
              value={rotation}
              onChange={setRotation}
              styles={{
                track: { background: "#8a6d79" },
                handle: { borderColor: "#8a6d79" },
              }}
            />
          </div>
        </Space>
      </div>
    </Modal>
  );
}
