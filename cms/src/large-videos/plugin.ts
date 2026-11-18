import { definePlugin } from "emdash";

export function createPlugin(options: { adminEntry: string }) {
  return definePlugin({
    id: "large-videos",
    displayName: "Large video uploads",
    version: "1.0.0",
    admin: {
      entry: options.adminEntry,
      pages: [{ path: "/upload", label: "大视频上传", icon: "upload-simple" }],
    },
  });
}
