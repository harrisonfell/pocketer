import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0A0A0B",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 14,
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            background: "#7EF0C1",
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#0A0A0B",
            fontWeight: 800,
            fontSize: 28,
          }}
        >
          P
        </div>
      </div>
    ),
    size
  );
}
