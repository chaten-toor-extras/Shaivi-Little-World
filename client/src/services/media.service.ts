import type { MediaAsset } from "@/types";
import { apiPost } from "./api";

export interface SignatureResponse {
  timestamp: number;
  signature: string;
  cloudName: string;
  apiKey: string;
  folder: string;
  resourceType: string;
}

export const mediaService = {
  getSignature: async (
    folder: "artist" | "artworks" | "journey" | "song-covers" | "audio",
    resourceType: "image" | "video" | "auto" | "audio" = "image",
  ): Promise<SignatureResponse> => {
    const res = await apiPost<SignatureResponse>("/admin/media/signature", {
      folder,
      resourceType: resourceType === "audio" ? "video" : resourceType,
    });
    return res.data;
  },

  uploadToCloudinary: async (
    file: File,
    folder: "artist" | "artworks" | "journey" | "song-covers" | "audio",
    resourceType: "image" | "video" | "auto" | "audio" = "image",
    onProgress?: (percent: number) => void,
  ): Promise<MediaAsset> => {
    // 1. Get signed params
    const sig = await mediaService.getSignature(folder, resourceType);

    // 2. Build form data for direct Cloudinary upload
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", sig.apiKey);
    formData.append("timestamp", String(sig.timestamp));
    formData.append("signature", sig.signature);
    formData.append("folder", sig.folder);

    // 3. Post to Cloudinary upload endpoint
    const endpointType = resourceType === "audio" ? "video" : resourceType;
    const uploadUrl = `https://api.cloudinary.com/v1_1/${sig.cloudName}/${endpointType}/upload`;

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", uploadUrl);

      if (onProgress && xhr.upload) {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            onProgress(Math.round((e.loaded / e.total) * 100));
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve({
              url: data.url,
              secureUrl: data.secure_url,
              publicId: data.public_id,
              resourceType: data.resource_type,
              format: data.format,
              width: data.width,
              height: data.height,
              bytes: data.bytes,
              duration: data.duration,
              originalFilename: data.original_filename,
            });
          } catch {
            reject(new Error("Invalid response from Cloudinary"));
          }
        } else {
          try {
            const errData = JSON.parse(xhr.responseText);
            reject(
              new Error(errData.error?.message || "Cloudinary upload failed"),
            );
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      };

      xhr.onerror = () =>
        reject(new Error("Network error during Cloudinary upload"));
      xhr.send(formData);
    });
  },
};
