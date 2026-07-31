import { ImageResponse } from "next/og";

export const alt = "HUBApis — o hub de APIs prontas para usar";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PRIMARY = "#e8a33d";
const BACKGROUND = "#0b0c0f";
const FOREGROUND = "#ececec";
const MUTED = "#9a9a9a";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: BACKGROUND,
        }}
      >
        <svg width="140" height="140" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"
            fill={PRIMARY}
          />
        </svg>
        <div style={{ display: "flex", marginTop: 36, fontSize: 76, fontWeight: 700, color: FOREGROUND }}>
          HUBApis
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 20,
            fontSize: 32,
            color: MUTED,
            maxWidth: 860,
            textAlign: "center",
            justifyContent: "center",
          }}
        >
          O hub onde você descobre, assina e usa APIs prontas para o seu produto.
        </div>
      </div>
    ),
    { ...size },
  );
}
