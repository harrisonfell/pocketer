import { ImageResponse } from "next/og";

export const alt = "Pocketer — we aren't just saving money, we're saving for living";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#FFFFFF",
          display: "flex",
          flexDirection: "column",
          padding: "80px",
          color: "#102231",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 56,
              height: 56,
              background: "#B0DBF8",
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path
                d="M12 15 L20 23 L28 15"
                stroke="#2C689A"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div
            style={{
              fontSize: 22,
              letterSpacing: 6,
              color: "#102231",
              fontWeight: 700,
            }}
          >
            POCKETER
          </div>
        </div>

        <div
          style={{
            marginTop: 110,
            fontSize: 92,
            fontWeight: 800,
            lineHeight: 1.02,
            letterSpacing: -2,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <span>We aren&apos;t just saving money.</span>
          <span style={{ color: "#2C689A" }}>We&apos;re saving for living.</span>
        </div>

        <div
          style={{
            marginTop: "auto",
            fontSize: 26,
            color: "rgba(16, 34, 49, 0.65)",
            maxWidth: 900,
            lineHeight: 1.3,
          }}
        >
          No budgets. No guilt. Just the swaps that pay for themselves — and your
          call on every one.
        </div>
      </div>
    ),
    size
  );
}
