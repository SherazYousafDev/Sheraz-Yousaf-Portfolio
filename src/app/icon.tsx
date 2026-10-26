import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** "SY" monogram favicon — ink square, paper letters, red-pen underline. */
export default function Icon() {
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
          background: "#141312",
          color: "#eeebe4",
          fontSize: 34,
          fontWeight: 700,
          letterSpacing: -2,
          fontFamily: "sans-serif",
        }}
      >
        SY
        <div style={{ width: 30, height: 4, background: "#e5401a", marginTop: 2 }} />
      </div>
    ),
    size,
  );
}
