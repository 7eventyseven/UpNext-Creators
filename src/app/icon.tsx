import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: "#FAF7F2",
          display: "flex",
        }}
      >
        <div style={{ width: 7, height: 32, background: "#556B2F" }} />
      </div>
    ),
    { ...size }
  );
}
