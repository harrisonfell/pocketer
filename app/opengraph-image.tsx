import { ImageResponse } from "next/og";

export const alt = "Pocketer — swap one habit, pocket the difference";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0A0A0B",
          display: "flex",
          flexDirection: "column",
          padding: "80px",
          color: "#F4F4F5",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              background: "#7EF0C1",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#0A0A0B",
              fontWeight: 800,
              fontSize: 32,
            }}
          >
            P
          </div>
          <div
            style={{
              fontSize: 22,
              letterSpacing: 6,
              color: "#A1A1AA",
              fontWeight: 700,
            }}
          >
            POCKETER
          </div>
        </div>

        <div
          style={{
            marginTop: 120,
            fontSize: 96,
            fontWeight: 700,
            lineHeight: 1.02,
            letterSpacing: -2,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <span>Swap one habit.</span>
          <span style={{ color: "#7EF0C1" }}>Pocket the difference.</span>
        </div>

        <div
          style={{
            marginTop: "auto",
            fontSize: 28,
            color: "#A1A1AA",
            maxWidth: 900,
            lineHeight: 1.25,
          }}
        >
          Finds the money quietly leaking out of your account — and redirects it into
          savings.
        </div>
      </div>
    ),
    size
  );
}
