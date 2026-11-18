export const PART_SIZE = 16 * 1024 * 1024;
export const MAX_VIDEO_SIZE = 20 * 1024 * 1024 * 1024;
export const SESSION_LIFETIME = 24 * 60 * 60 * 1000;
export const API_PATH = "/_emdash/api/large-videos";

export interface VideoUpload {
  id: string;
  filename: string;
  size: number;
  fingerprint: string;
  partSize: number;
  totalParts: number;
  completedParts: number[];
  expiresAt: number;
  status: "uploading" | "completing" | "complete" | "aborted";
  mediaId?: string;
  url?: string;
}
