import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { person } from "@/data/portfolio";

export const alt = "Sheraz Yousaf · Data Analyst & Frontend Developer, Lahore";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Cached so the image is rendered once at build time (Cache Components treats raw file reads as dynamic). */
async function loadAssets() {
  "use cache";
  const dir = join(process.cwd(), "src/fonts/og");
  const [clash, satoshi, photo] = await Promise.all([
    readFile(join(dir, "ClashDisplay-Semibold.ttf")),
    readFile(join(dir, "Satoshi-Medium.ttf")),
    readFile(join(process.cwd(), "public/images/sheraz.png")),
  ]);
  return { clash: clash.toString("base64"), satoshi: satoshi.toString("base64"), photo: photo.toString("base64") };
}

/** Social preview card in the site's own language: paper, ink, one red accent. */
export default async function OpengraphImage() {
  const assets = await loadAssets();
  const clash = Buffer.from(assets.clash, "base64");
  const satoshi = Buffer.from(assets.satoshi, "base64");
  const photoSrc = `data:image/png;base64,${assets.photo}`;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#eeebe4", color: "#141312", fontFamily: "Satoshi", position: "relative" }}>
        {/* grid lines */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{ position: "absolute", top: 0, bottom: 0, left: i * 200, width: 1, background: "rgba(20,19,18,.08)" }} />
        ))}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "56px 64px", width: 760 }}>
          <div style={{ display: "flex", fontSize: 18, letterSpacing: 3, textTransform: "uppercase", borderBottom: "1px solid rgba(20,19,18,.25)", paddingBottom: 14 }}>
            SY · Portfolio ’26 · {person.coordinates}
          </div>
          <div style={{ display: "flex", flexDirection: "column", fontFamily: "Clash", fontSize: 150, lineHeight: 0.84, letterSpacing: -6, textTransform: "uppercase" }}>
            <span>{person.firstName}</span>
            <span style={{ paddingLeft: 70 }}>{person.lastName}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <span style={{ fontSize: 34, color: "#e5401a" }}>Data Analyst · Frontend Developer</span>
            <span style={{ fontSize: 22, opacity: 0.7 }}>Product data audits by day. React interfaces since 2024. Lahore, Pakistan.</span>
          </div>
        </div>
        <div style={{ position: "absolute", right: 70, bottom: 0, width: 380, height: 360, borderTopLeftRadius: 190, borderTopRightRadius: 190, background: "#e5401a" }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photoSrc} alt="" width={422} height={591} style={{ position: "absolute", right: 50, bottom: 0, height: 560, width: 400 }} />
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Clash", data: clash, weight: 600, style: "normal" },
        { name: "Satoshi", data: satoshi, weight: 500, style: "normal" },
      ],
    },
  );
}
