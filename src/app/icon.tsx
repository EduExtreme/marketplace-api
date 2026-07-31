import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

const PRIMARY = "#e8a33d";
const BACKGROUND = "#0b0c0f";

function Dot({ left, top, dim }: { left: number; top: number; dim: number }) {
  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width: dim,
        height: dim,
        borderRadius: "50%",
        background: PRIMARY,
      }}
    />
  );
}

function Bar({ left, top, width, height }: { left: number; top: number; width: number; height: number }) {
  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width,
        height,
        background: PRIMARY,
      }}
    />
  );
}

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: BACKGROUND,
          borderRadius: 7,
          position: "relative",
        }}
      >
        <Bar left={15} top={8} width={2} height={5} />
        <Bar left={15} top={19} width={2} height={5} />
        <Bar left={19} top={15} width={5} height={2} />
        <Bar left={8} top={15} width={5} height={2} />
        <Dot left={13} top={2} dim={6} />
        <Dot left={13} top={24} dim={6} />
        <Dot left={24} top={13} dim={6} />
        <Dot left={2} top={13} dim={6} />
        <Dot left={13} top={13} dim={6} />
      </div>
    ),
    { ...size },
  );
}
