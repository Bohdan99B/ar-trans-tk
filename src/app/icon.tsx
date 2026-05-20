import { ImageResponse } from "next/og";

export const size = {
  width: 64,
  height: 64,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "linear-gradient(135deg, #123f90 0%, #1e5aa8 58%, #0b111a 100%)",
          color: "#ffd34d",
          display: "flex",
          fontSize: 24,
          fontWeight: 900,
          height: "100%",
          justifyContent: "center",
          letterSpacing: "-1px",
          width: "100%",
        }}
      >
        AR
      </div>
    ),
    size,
  );
}
